import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = 'https://api.citoapi.com/api/v1';
const API_KEY = process.env.CITO_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  try {
    const params = new URLSearchParams();
    if (req.query.round) params.set('round', String(req.query.round));

    const qs = params.toString();
    const url = `${API_BASE}/ufc/bouts/${encodeURIComponent(id)}/stats${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Cito API error: ${response.statusText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
}
