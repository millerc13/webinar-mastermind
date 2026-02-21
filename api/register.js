// Vercel Serverless Function for Webinar Masterclass Registration
// Creates/updates contact in GHL with tags and creates pipeline opportunity

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

    // Determine date-specific tag from the selected date
    let dateTag = '';
    if (webinarDate && webinarDate.includes('23')) dateTag = 'masterclass 0226 - feb 23';
    else if (webinarDate && webinarDate.includes('25')) dateTag = 'masterclass 0226 - feb 25';
    else if (webinarDate && webinarDate.includes('26')) dateTag = 'masterclass 0226 - feb 26';

    // Tags for Masterclass 0226 registrants
    const tags = [
      'Masterclass 0226 - Registered',
      'sms-consent',
    ];
    if (dateTag) tags.push(dateTag);

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
        source: 'Masterclass 0226 Registration',
        customFields: [
          {
            key: 'masterclass__date',
            field_value: webinarDate || ''
          }
        ],
      }),
    });

    const result = await ghlResponse.json();

    // Handle response
    let contactId = null;

    if (!ghlResponse.ok) {
      console.error('GHL API Error:', result);

      // Check for duplicate contact - still count as success
      const isDuplicate = result.message && (
        result.message.toLowerCase().includes('duplicate') ||
        result.message.toLowerCase().includes('already exists')
      );

      if (isDuplicate) {
        // Get contact ID from the duplicate error response
        contactId = result.meta?.contactId;

        if (contactId) {
          // For duplicates: remove the date tag first so re-adding triggers the workflow
          if (dateTag) {
            await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/tags`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
                'Content-Type': 'application/json',
                'Version': '2021-07-28',
              },
              body: JSON.stringify({ tags: [dateTag] }),
            });
          }

          // Update existing contact with new date (no tags here - PUT replaces them)
          await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
              'Content-Type': 'application/json',
              'Version': '2021-07-28',
            },
            body: JSON.stringify({
              firstName: firstName || undefined,
              lastName: lastName || undefined,
              customFields: [
                {
                  key: 'masterclass__date',
                  field_value: webinarDate || ''
                }
              ],
            }),
          });

          // Add tags separately so existing tags are preserved
          await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/tags`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
              'Content-Type': 'application/json',
              'Version': '2021-07-28',
            },
            body: JSON.stringify({ tags: tags }),
          });
        }
      } else {
        return res.status(ghlResponse.status).json({
          error: 'Failed to create contact',
          details: result,
        });
      }
    } else {
      contactId = result.contact?.id;
    }

    // Create Opportunity in the Masterclass Webinar pipeline
    if (contactId) {
      try {
        await fetch('https://services.leadconnectorhq.com/opportunities/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify({
            pipelineId: 'pbm5k2tzDR68IEz90X9N',
            locationId: process.env.GHL_LOCATION_ID,
            name: `Masterclass - ${webinarDate || 'Unknown Date'}`,
            pipelineStageId: '8007c5d6-1647-4b38-a233-622b1332954d',
            status: 'open',
            contactId: contactId,
          }),
        });
      } catch (oppError) {
        console.error('Opportunity creation error:', oppError);
      }

      // Fire webhook to trigger the registration workflow
      try {
        await fetch('https://services.leadconnectorhq.com/hooks/ZTzlr9OKa82mgQ8vn680/webhook-trigger/SkIqx9xq4o01ZHbakdfu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId: contactId,
            email: email,
            phone: phone,
            firstName: firstName || '',
            lastName: lastName || '',
            webinarDate: webinarDate || '',
          }),
        });
      } catch (webhookError) {
        console.error('Webhook trigger error:', webhookError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Registration successful',
      contactId: contactId || 'existing',
    });

  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
