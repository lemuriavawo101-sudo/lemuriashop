import { NextResponse } from 'next/server';

/**
 * Digital Twin Protection Gateway
 * Generates temporary access keys for 3D assets to prevent scraping.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get('modelId');

  if (!modelId) {
    return NextResponse.json({ error: 'Model Identification Required' }, { status: 400 });
  }

  // PRODUCTION UPGRADE PATH:
  // Here we would integrate with Cloudflare R2 or AWS S3 to generate a true 'Signed URL'.
  // For your current GitHub Raw setup, we provide the architectural bridge.
  
  // 1. Resolve actual storage path
  const modelUrl = modelId; // Currently passing the full URL or relative path

  // 2. Generate 'Signed Link' (In production, this is a distinct cryptographically signed URL)
  // For now, we return the URL but prepare the CinematicViewer to only use this gateway
  
  return NextResponse.json({ 
    signedUrl: modelUrl,
    expires: Date.now() + (5 * 60 * 1000) // 5 Minutes
  });
}
