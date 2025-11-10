export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Use POST');
  }

  // 1) Receive webhook from HubSpot
  const events = Array.isArray(req.body) ? req.body : [req.body];

  // Grab first event safely
  const first = events[0] || {};
  const contactId = first.objectId || null;

  if (!contactId) {
    return res.status(200).json({ ok: true, note: 'No contactId; test payload received.' });
  }

  // 2) Fetch contact details from HubSpot
  const hubspotToken = process.env.HUBSPOT_TOKEN;
  const props = [
    'email','firstname','lastname','company','website','notes','recent_conversion_event_name'
  ].join(',');

  const hsResp = await fetch(
    `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=${props}`,
    { headers: { Authorization: `Bearer ${hubspotToken}` } }
  );
  const hsJson = await hsResp.json();
  const p = (hsJson.properties || {});

  // 3) Build the payload we’ll send to your agent
  const agentInput = {
    lead_id: String(contactId),
    name: [p.firstname, p.lastname].filter(Boolean).join(' ') || 'there',
    email: p.email || '',
    company: p.company || '',
    domain: (p.website || '').replace(/^https?:\/\//,'').replace(/\/$/,''),
    message: p.notes || p.recent_conversion_event_name || ''
  };

  // 4) Call your agent to draft the email
  const agentResp = await fetch(process.env.AGENT_SALES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-agent-key': process.env.AGENT_KEY || '' },
    body: JSON.stringify(agentInput)
  });
  const agentOut = await agentResp.json();

  // 5) (For now) just return what we’d do next. 
  // Later you’ll: send Gmail, create/associate Deal, log email, schedule follow-ups.
  return res.status(200).json({ ok: true, received: agentInput, agent: agentOut });
}

