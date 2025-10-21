const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || ''
const MAILCHIMP_API_SERVER = process.env.MAILCHIMP_API_SERVER || 'us20'
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || ''

export async function addSubscriber(email: string) {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
    throw new Error('Mailchimp credentials not configured')
  }

  const response = await fetch(
    `https://${MAILCHIMP_API_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
    {
      method: 'POST',
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
      }),
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'Failed to subscribe')
  }

  return data
}