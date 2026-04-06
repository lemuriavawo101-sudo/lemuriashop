/**
 * 🏺 THE GITHUB SANCTUARY BRIDGE
 * This bridge allows the Lemuria Admin Panel to stream artifacts
 * directly into a GitHub repository for unlimited free storage.
 */

export async function uploadToGithub(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'artifacts'
) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('🏺 GitHub Sanctuary is missing its credentials.');
  }

  const path = `${folder}/${fileName}`;
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  
  // Base64 encoding is required for the GitHub Content API
  const content = fileBuffer.toString('base64');

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: `🏺 Acquisition: Preservation of ${fileName} in the Lemuria Archive`,
      content: content,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`🏺 GitHub Transmission Failed: ${errorData.message}`);
  }

  // Generate the Permanent Raw URL for the storefront
  // Format: https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
}
