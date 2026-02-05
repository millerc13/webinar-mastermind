// Vercel Serverless Function for Free Registration Confirmation
// Adds "Masterclass 0226 - Free Confirmed" tag when user skips VIP upgrade

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // First, find the contact by email
    const searchResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${process.env.GHL_LOCATION_ID}&email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
          'Version': '2021-07-28',
        },
      }
    );

    const searchResult = await searchResponse.json();
    const contactId = searchResult.contact?.id;

    if (!contactId) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Add the Free Confirmed tag to the contact
    const updateResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/${contactId}/tags`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify({
          tags: ['Masterclass 0226 - Free Confirmed'],
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorResult = await updateResponse.json();
      console.error('GHL API Error:', errorResult);
      return res.status(updateResponse.status).json({
        error: 'Failed to update contact',
        details: errorResult,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Free registration confirmed',
      contactId: contactId,
    });

  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
