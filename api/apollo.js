export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { action, apiKey, ...params } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'No API key provided' });
  const endpoints = {
    searchPeople: 'https://api.apollo.io/api/v1/mixed_people/search',
    searchOrg:    'https://api.apollo.io/api/v1/organizations/search',
  };
  const url = endpoints[action];
  if (!url) return res.status(400).json({ error: 'Invalid action' });
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify({ ...params, api_key: apiKey }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
