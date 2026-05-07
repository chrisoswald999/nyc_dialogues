export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const payload = req.body;
  if (!payload) return res.status(400).json({ ok: false, error: 'Empty body' });

  let item_name, item_price;

  if (payload.type === 'chat_message' && payload.tool_response?.type === 'item_selection') {
    const tr = payload.tool_response;
    item_name  = tr.item_name  || tr.name  || parseName(payload.text);
    item_price = tr.item_price || tr.price || parsePrice(payload.text);
  } else if (payload.subtype === 'add_to_cart') {
    item_name  = payload.params?.item_name;
    item_price = payload.params?.item_price;
  } else {
    return res.status(400).json({ ok: false, error: 'Unrecognized payload type' });
  }

  if (!item_name) return res.status(400).json({ ok: false, error: 'Missing item_name' });

  return res.status(200).json({
    ok: true,
    item_name,
    item_price: Number(item_price) || 0,
    flow_id: payload.flow_id || null,
    occasion: payload.metadata?.occasion || null,
  });
}

function parseName(text = '') {
  return text.split('\n')[0].replace(/\*+/g, '').trim();
}

function parsePrice(text = '') {
  const m = text.match(/\$([0-9,]+(?:\.[0-9]{2})?)/);
  return m ? parseFloat(m[1].replace(',', '')) : 0;
}
