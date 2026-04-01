import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  const uploadDir = 'public/uploads';
  const imageDir = 'public/images';
  
  const processFolder = async (dir, folderType) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.lstatSync(filePath).isDirectory()) continue;
      
      const buffer = fs.readFileSync(filePath);
      const isModel = file.endsWith('.glb');
      const gitFolder = isModel ? 'artifacts' : 'images';
      
      console.log(`🏺 Migrating ${file} to GitHub Sanctuary...`);
      try {
        const cloudUrl = await uploadToGithub(buffer, file, gitFolder);
        console.log(`✅ Cloud Acquisition Successful: ${cloudUrl}`);
        
        // Update Database
        const oldPath = `/${folderType}/${file}`;
        const res = await client.execute({
          sql: `UPDATE products SET 
                image = CASE WHEN image = ? THEN ? ELSE image END,
                model3d = CASE WHEN model3d = ? THEN ? ELSE model3d END
                WHERE image = ? OR model3d = ?`,
          args: [oldPath, cloudUrl, oldPath, cloudUrl, oldPath, oldPath]
        });
        
        if (res.rowsAffected > 0) {
          console.log(`📜 Database synchronized for ${file} (${res.rowsAffected} records)`);
        }
      } catch (err) {
        console.error(`❌ Migration failed for ${file}:`, err.message);
      }
    }
  };

  await processFolder(uploadDir, 'uploads');
  await processFolder(imageDir, 'images');
  
  console.log('\n✨ Archival Restoration Complete.');
  process.exit(0);
}

// Since the project uses TS, I'll need a way to run this.
// I'll rewrite the uploadToGithub logic directly in the script for simplicity and speed.

async function uploadToGithubLocal(fileBuffer, fileName, folder = 'artifacts') {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  const path = `${folder}/${fileName}`;
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const content = fileBuffer.toString('base64');

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: `🏺 Archival Acquisition: Preservation of ${fileName}`,
      content: content,
    }),
  });

  if (!response.ok) {
     const errorData = await response.json();
     if (errorData.message.includes('already exists') || errorData.message.includes('\"sha\" wasn\'t supplied')) {
        return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${path}`;
     }
     throw new Error(errorData.message);
  }

  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${path}`;
}

// Update the migrate function to use the local version
const migrateFinal = async () => {
  const uploadDir = 'public/uploads';
  const imageDir = 'public/images';
  
  const processFolder = async (dir, folderType) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const buffer = fs.readFileSync(filePath);
      const isModel = file.endsWith('.glb');
      const gitFolder = isModel ? 'artifacts' : 'images';
      
      try {
        const cloudUrl = await uploadToGithubLocal(buffer, file, gitFolder);
        const oldPath = `/${folderType}/${file}`;
        
        await client.execute({
          sql: `UPDATE products SET 
                image = CASE WHEN image = ? THEN ? ELSE image END,
                model3d = CASE WHEN model3d = ? THEN ? ELSE model3d END
                WHERE image = ? OR model3d = ?`,
          args: [oldPath, cloudUrl, oldPath, cloudUrl, oldPath, oldPath]
        });
        console.log(`✅ ${file} successfully archived and synced.`);
      } catch (err) {
        console.error(`❌ ${file} failed:`, err.message);
      }
    }
  };

  await processFolder(uploadDir, 'uploads');
  await processFolder(imageDir, 'images');
  console.log('✨ All artifact references updated.');
  process.exit(0);
};

migrateFinal();
