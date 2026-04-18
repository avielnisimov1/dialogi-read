export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
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

  const { image } = req.body

  if (!image) {
    return res.status(400).json({ error: 'Missing image data' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  // Extract base64 data and mime type
  const match = image.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) {
    return res.status(400).json({ error: 'Invalid image format' })
  }

  const mimeType = match[1]
  const base64Data = match[2]

  const prompt = `אתה מומחה בחילוץ טקסט מתמונות של דפים מספרים באנגלית.

הוראות:
1. חלץ רק את גוף הטקסט של הסיפור/הספר — את הפסקאות שקוראים.
2. התעלם לחלוטין מ: מספרי עמודים, כותרות עליונות/תחתונות (headers/footers), הערות שוליים, שמות פרקים קטנים בראש העמוד.
3. אם יש כותרת פרק גדולה (כמו "Chapter 3" או שם פרק) — שים אותה בשורה נפרדת בהתחלה.
4. שמור על סדר הפסקאות כמו שהן בעמוד.
5. אל תוסיף שום דבר משלך — רק הטקסט שמופיע בתמונה.
6. אם יש טקסט שנכנס מעמוד שכן (חתוך, לא שלם) — התעלם ממנו.
7. תן רק את הטקסט הנקי, בלי הסברים.`

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4000,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini Vision error:', err)
      return res.status(502).json({ error: 'OCR service error' })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    return res.status(200).json({ text })
  } catch (err) {
    console.error('OCR fetch error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
