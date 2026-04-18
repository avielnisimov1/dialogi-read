// Simple in-memory rate limiting (per serverless instance)
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW = 60_000 // 1 minute
const RATE_LIMIT_MAX = 30 // max requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 })
    return true
  }

  entry.count++
  return entry.count <= RATE_LIMIT_MAX
}

function sanitize(str, maxLength) {
  if (!str || typeof str !== 'string') return ''
  return str.slice(0, maxLength).replace(/[^\w\s.,!?;:'"()\-–—\u0590-\u05FF]/g, ' ').trim()
}

export default async function handler(req, res) {
  const allowedOrigins = [
    'https://dialogi-read.vercel.app',
    'https://dialogi-read-aviels-projects-e11f879d.vercel.app',
  ]
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests, try again later' })
  }

  const { word, sentence, mode } = req.body

  if (!word && !sentence) {
    return res.status(400).json({ error: 'Missing word or sentence' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  // Sanitize inputs
  const cleanWord = sanitize(word, 100)
  const cleanSentence = sanitize(sentence, 500)

  let prompt

  if (mode === 'sentence') {
    prompt = `תרגם את המשפט הבא לעברית. תן רק את התרגום, בלי הסברים.

משפט: "${cleanSentence}"

תרגום:`
  } else {
    prompt = `אתה מתרגם מילים מאנגלית לעברית עבור קורא שלומד אנגלית.

המילה: "${cleanWord}"
המשפט שבו המילה מופיעה: "${cleanSentence}"

תן תשובה בפורמט JSON בלבד (בלי markdown, בלי backticks):
{"hebrew":"התרגום לעברית של המילה בהקשר הזה","explanation":"הסבר קצר בעברית למה זה התרגום הנכון בהקשר הזה, משפט אחד"}`
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini error:', err)
      return res.status(502).json({ error: 'Translation service error' })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    if (mode === 'sentence') {
      return res.status(200).json({ translation: text })
    }

    // Parse JSON response for word translation
    try {
      const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const parsed = JSON.parse(cleaned)
      return res.status(200).json({
        hebrew: parsed.hebrew || '',
        explanation: parsed.explanation || '',
      })
    } catch {
      return res.status(200).json({ hebrew: text, explanation: '' })
    }
  } catch (err) {
    console.error('Fetch error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
