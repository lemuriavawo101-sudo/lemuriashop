import { NextResponse } from 'next/server';

/**
 * Ironclad Archive Security Gateway
 * Ensures only authorized curators can access the heritage database.
 */
export function verifyCuratorToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const curatorToken = process.env.ADMIN_SECRET_KEY; // High-Intensity Secret

  if (!curatorToken) {
    console.error('SECURE: ADMIN_SECRET_KEY is missing from environment variables');
    return false;
  }

  // Simple and highly effective for pre-production launch
  if (authHeader !== `Bearer ${curatorToken}`) {
    return false;
  }

  return true;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'ARCHIVE ACCESS DENIED: INVALID CURATOR IDENTIFICATION' }, 
    { status: 401 }
  );
}
