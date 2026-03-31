import { NextResponse } from 'next/server';
import { uploadToGithub } from '@/lib/github-vault';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No artifact provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename and determine folder
    const isModel = file.name.endsWith('.glb');
    const folder = isModel ? 'artifacts' : 'images';
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    // Upload to the GitHub Sanctuary
    const downloadUrl = await uploadToGithub(buffer, filename, folder);
    
    console.log(`🏺 GitHub Cloud Acquisition Successful: ${downloadUrl}`);
    return NextResponse.json({ url: downloadUrl });
  } catch (error: any) {
    console.error('GitHub Upload Error:', error);
    return NextResponse.json({ error: 'GitHub Transmission Failed: ' + error.message }, { status: 500 });
  }
}
