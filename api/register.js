// Vercel Serverless Function for Webinar Masterclass Registration
// Creates/updates contact in GHL with mastermind-webinar tag

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
    const { firstName, lastName, email, phone, webinarDate } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!phone) {
      return res.status(400).json({ error: 'Phone is required' });
    }

    // Tags for webinar registrants
    const tags = [
      'mastermind-webinar',
      'webinar-registered',
      'sms-consent'
    ];

    // Add date-specific tag if provided
    if (webinarDate) {
      tags.push(`webinar-${webinarDate}`);
    }

    // Create/update contact in GHL
    const ghlResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
      body: JSON.stringify({
        locationId: process.env.GHL_LOCATION_ID,
        firstName: firstName || '',
        lastName: lastName || '',
        email: email,
        phone: phone,
        tags: tags,
        source: 'Webinar Masterclass Registration',
      }),
    });

    const result = await ghlResponse.json();

    // Handle response
    if (!ghlResponse.ok) {
      console.error('GHL API Error:', result);

      // Check for duplicate contact - still count as success
      const isDuplicate = result.message && (
        result.message.toLowerCase().includes('duplicate') ||
        result.message.toLowerCase().includes('already exists')
      );

      if (isDuplicate) {
        // Get contact ID from the duplicate error response
        const existingContactId = result.meta?.contactId;

        if (existingContactId) {
          // Update existing contact with new tags
          await fetch(`https://services.leadconnectorhq.com/contacts/${existingContactId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
              'Content-Type': 'application/json',
              'Version': '2021-07-28',
            },
            body: JSON.stringify({
              tags: tags,
              firstName: firstName || undefined,
              lastName: lastName || undefined,
            }),
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Registration successful',
          contactId: existingContactId || 'existing',
        });
      }

      return res.status(ghlResponse.status).json({
        error: 'Failed to create contact',
        details: result,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Registration successful',
      contactId: result.contact?.id,
    });

  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
