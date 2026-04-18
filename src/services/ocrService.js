import { createWorker } from 'tesseract.js'

let worker = null
let terminateTimer = null
const AUTO_TERMINATE_MS = 60_000 // 1 minute after last use

async function getWorker(onProgress) {
  clearTimeout(terminateTimer)

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

function scheduleTerminate() {
  clearTimeout(terminateTimer)
  terminateTimer = setTimeout(async () => {
    if (worker) {
      await worker.terminate()
      worker = null
    }
  }, AUTO_TERMINATE_MS)
}

/**
 * Extract text from an image file.
 */
export async function extractTextFromImage(imageFile, onProgress) {
  const w = await getWorker(onProgress)
  const { data: { text } } = await w.recognize(imageFile)
  scheduleTerminate()
  return text.trim()
}
