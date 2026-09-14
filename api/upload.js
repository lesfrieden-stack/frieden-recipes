const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dataUrl, filename } = req.body || {};
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return res.status(400).json({ error: 'dataUrl (base64 data URL) is required' });
  }

  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    return res.status(400).json({ error: 'Malformed data URL' });
  }
  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');

  const safeName = (filename || 'photo').replace(/[^a-zA-Z0-9_.-]/g, '_');
  const key = `recipe-photos/${Date.now()}-${safeName}`;

  const blob = await put(key, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: true
  });

  return res.status(201).json({ url: blob.url });
};
