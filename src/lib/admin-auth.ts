import { NextResponse } from 'next/server';

/**
 * Ironclad Archive Security Gateway
 * Ensures only authorized curators can access the heritage database.
 */
export function verifyCuratorToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  let curatorToken = process.env.ADMIN_SECRET_KEY || 'archival_fallback_token_v24';

  // Sanitize Server Secret: Trim quotes if they exist
  curatorToken = curatorToken.replace(/^["']|["']$/g, '');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  // Sanitize Client Token: Trim quotes if they exist (handling stale sessionStorage)
  const incomingToken = authHeader.split(' ')[1]?.replace(/^["']|["']$/g, '');

  if (incomingToken !== curatorToken) {
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
