/**
 * Splits text into sentences based on punctuation.
 */
export function splitToSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0)
}

/**
 * Splits a sentence into word tokens.
 * Each token has the clean word (for translation) and display form (with punctuation).
 */
export function splitToWords(sentence) {
  const parts = sentence.split(/(\s+)/)
  return parts
    .filter(p => p.trim().length > 0)
    .map(part => {
      const clean = part.replace(/[^a-zA-Z'-]/g, '').toLowerCase()
      return {
        display: part,
        word: clean,
        isWord: clean.length > 0,
      }
    })
}

/**
 * Finds which sentence a word belongs to in the full text.
 */
export function findSentenceForWord(text, wordIndex) {
  const sentences = splitToSentences(text)
  let count = 0
  for (const sentence of sentences) {
    const words = splitToWords(sentence)
    const wordCount = words.filter(w => w.isWord).length
    if (wordIndex < count + wordCount) {
      return sentence
    }
    count += wordCount
  }
  return sentences[sentences.length - 1] || ''
}
