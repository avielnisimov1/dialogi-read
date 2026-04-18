import { useState, useCallback } from 'react'
import { extractTextFromImage } from '../services/ocrService'

export function useOcr() {
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState('')
  const [error, setError] = useState(null)

  const processImage = useCallback(async (file) => {
    setProcessing(true)
    setProgress(0)
    setError(null)
    setResult('')

    try {
      const text = await extractTextFromImage(file, setProgress)
      setResult(text)
      return text
    } catch (e) {
      setError('שגיאה בזיהוי הטקסט. נסה תמונה אחרת.')
      return ''
    } finally {
      setProcessing(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult('')
    setError(null)
    setProgress(0)
  }, [])

  return { processing, progress, result, error, processImage, clearResult, setResult }
}
