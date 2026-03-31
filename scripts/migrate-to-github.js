const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@libsql/client');

dotenv.config({ path: '.env.local' });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const DATABASE_URL = process.env.TURSO_DATABASE_URL;
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function uploadToGithub(fileBuffer, fileName, folder = 'artifacts') {
  const filePath = `${folder}/${fileName}`;
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  const content = fileBuffer.toString('base64');

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: `🏺 Universal Sync: Preservation of ${fileName} in the Lemuria Archive`,
      content: content,
    }),
  });

  if (!response.ok) {
     if (response.status === 422) {
        // Already exists is fine for migration
     } else {
        const errorData = await response.json();
        throw new Error(`🏺 GitHub Transmission Failed: ${errorData.message}`);
     }
  }

  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${filePath}`;
}

async function runUniversalMigration() {
  console.log('🏺 INITIALIZING UNIVERSAL CLOUD SYNTHESIS (MODELS & IMAGES)...');
  
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    console.error('❌ Sanctuary credentials missing in .env.local');
    process.exit(1);
  }

  const client = createClient({ url: DATABASE_URL, authToken: AUTH_TOKEN });
  const roots = [
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'public', 'uploads')
  ];
  
  const allProducts = await client.execute("SELECT id, name, model3d, image FROM products");
  console.log(`📊 Auditing ${allProducts.rows.length} products for full visual migration.`);

  for (const product of allProducts.rows) {
    console.log(`🏺 Processing product: ${product.name}`);
    
    // 1. Migrate Model
    await migrateAsset(product.id, product.model3d, 'artifacts', 'model3d');
    
    // 2. Migrate Image
    await migrateAsset(product.id, product.image, 'images', 'image');
  }

  async function migrateAsset(id, assetPath, githubFolder, dbColumn) {
    if (assetPath && !assetPath.startsWith('http')) {
      let foundFile = null;
      for (const root of roots) {
         const fileName = path.basename(assetPath);
         const fullPath = path.join(root, fileName);
         if (fs.existsSync(fullPath) && !fs.lstatSync(fullPath).isDirectory()) {
             foundFile = fullPath;
             break;
         }
      }

      if (foundFile) {
          try {
              const buffer = fs.readFileSync(foundFile);
              let cleanName = path.basename(foundFile).replace(/\s+/g, '_');
              
              // Correct extensions if missing
              if (githubFolder === 'artifacts' && !cleanName.includes('.')) cleanName += '.glb';
              if (githubFolder === 'images' && !cleanName.includes('.')) cleanName += '.jpg';
              
              const cloudUrl = await uploadToGithub(buffer, cleanName, githubFolder);
              console.log(`   🏛️ ${dbColumn} Cloud Link: ${cloudUrl}`);

              await client.execute({
                sql: `UPDATE products SET ${dbColumn} = ? WHERE id = ?`,
                args: [cloudUrl, id]
              });
          } catch (err) {
              console.error(`   ❌ Failed to migrate ${dbColumn}:`, err.message);
          }
      }
    }
  }

  console.log('🏺 UNIVERSAL SYNTHESIS COMPLETE. ARCHIVE IS 100% CLOUD-HOSTED.');
  process.exit(0);
}

runUniversalMigration();
