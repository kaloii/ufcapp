import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = 'https://api.citoapi.com/api/v1';
const API_KEY = process.env.CITO_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }

  try {
    const response = await fetch(`${API_BASE}/ufc/search?q=${encodeURIComponent(q)}`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Cito API error: ${response.statusText}` });
    }

    const data = await response.json();
const result = data.data || data;
return res.status(200).json({
  fighters: (result.fighters || []).slice(0, 5),
  bouts: (result.bouts || []).slice(0, 5),
});
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
}
