export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Use POST');

  const { name, email, company, domain, message } = req.body || {};

  // TODO: add real web lookup + OpenAI draft here.
  // For now, fake two facts and three time slots so you can see the shape working.
  const facts = [
    `${company || 'This company'} is based online at ${domain || 'unknown domain'}.`,
    `They mentioned: ${message || 'no message provided'}.`
  ];
  const now = new Date();
  const slots = [10, 14, 9].map(h => {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(h, 0, 0, 0);
    return d.toISOString();
  });

  const out = {
    confidence: 0.9,
    facts,
    email: {
      subject: 'Quick intro + 3 time options',
      body_text: `Hi ${name || 'there'},\n\nNoticed ${facts[0]} Also saw ${facts[1]}.\n` +
                 `Here’s how we typically help in week one: clarify scope → storyboard → schedule → fast first cut.\n\n` +
                 `Options (CT):\n• ${slots[0]}\n• ${slots[1]}\n• ${slots[2]}\n\n` +
                 `— Freddyville Media`,
      proposed_slots_ct: slots,
      meeting_link: 'https://meetings.hubspot.com/your-link'
    },
    crm: { deal: { stage: 'Qualification', amount_hint: 4500 } },
    policy: { auto_send: true }
  };

  return res.status(200).json(out);
}

