export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { message } = req.body || {}
  if (!message) return res.status(400).json({ error: 'Missing message' })

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_WA_FROM
  const to         = process.env.WA_TARGET_PHONE

  if (!accountSid || !authToken || !from || !to) {
    console.warn('[notify] Variables Twilio non configurées')
    return res.status(200).json({ ok: true, skipped: true })
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const body = new URLSearchParams({ From: from, To: to, Body: message })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const text = await response.text()
      return res.status(500).json({ error: 'Twilio error', detail: text })
    }

    const data = await response.json()
    return res.status(200).json({ ok: true, sid: data.sid })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
