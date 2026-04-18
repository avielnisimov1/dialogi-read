/**
 * Convert image file to base64 data URL.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Extract text from an image using Gemini Vision API.
 * Intelligently filters out page numbers, headers, footers, and irrelevant text.
 */
export async function extractTextFromImage(imageFile, onProgress) {
  // Show initial progress
  if (onProgress) onProgress(10)

  const base64 = await fileToBase64(imageFile)

  if (onProgress) onProgress(30)

  const res = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 }),
  })

  if (onProgress) onProgress(90)

  if (!res.ok) {
    throw new Error('OCR failed')
  }

  const data = await res.json()

  if (onProgress) onProgress(100)

  return (data.text || '').trim()
}
