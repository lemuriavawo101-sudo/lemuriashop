import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.warn('Turso Database credentials missing from environment.');
}

let _client: any = null;

export const db = {
  execute: async (stmt: any) => {
    if (!_client) {
      if (!url || !authToken) {
        throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured in Vercel settings.');
      }
      _client = createClient({ url, authToken });
    }
    return await _client.execute(stmt);
  }
};
