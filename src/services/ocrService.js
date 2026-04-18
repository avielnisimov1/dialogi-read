import { createWorker } from 'tesseract.js'

let worker = null

async function getWorker(onProgress) {
  if (worker) return worker

  worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })

  return worker
}

/**
 * Extract text from an image file.
 * @param {File} imageFile - The image file to process
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {string} Extracted text
 */
export async function extractTextFromImage(imageFile, onProgress) {
  const w = await getWorker(onProgress)
  const { data: { text } } = await w.recognize(imageFile)
  return text.trim()
}
