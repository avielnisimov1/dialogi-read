export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { word, sentence, mode } = req.body

  if (!word && !sentence) {
    return res.status(400).json({ error: 'Missing word or sentence' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  let prompt

  if (mode === 'sentence') {
    prompt = `תרגם את המשפט הבא לעברית. תן רק את התרגום, בלי הסברים.

משפט: "${sentence}"

תרגום:`
  } else {
    prompt = `אתה מתרגם מילים מאנגלית לעברית עבור קורא שלומד אנגלית.

המילה: "${word}"
המשפט שבו המילה מופיעה: "${sentence}"

תן תשובה בפורמט JSON בלבד (בלי markdown, בלי backticks):
{"hebrew":"התרגום לעברית של המילה בהקשר הזה","explanation":"הסבר קצר בעברית למה זה התרגום הנכון בהקשר הזה, משפט אחד"}`
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      // Clean potential markdown wrapping
      const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const parsed = JSON.parse(cleaned)
      return res.status(200).json({
        hebrew: parsed.hebrew || '',
        explanation: parsed.explanation || '',
      })
    } catch {
      // If JSON parsing fails, use raw text as hebrew
      return res.status(200).json({ hebrew: text, explanation: '' })
    }
  } catch (err) {
    console.error('Fetch error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
