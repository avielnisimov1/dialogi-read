/**
 * Splits text into sentences based on punctuation.
 * Handles abbreviations (Mr., Mrs., Dr., etc.) and avoids splitting on them.
 */
export function splitToSentences(text) {
  // Split on sentence-ending punctuation followed by space + capital letter or end of text
  // But avoid splitting on common abbreviations
  const abbrevPattern = /(?:Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|vs|etc|e\.g|i\.e)\./g
  const placeholder = '{{ABBR}}'

  // Temporarily replace abbreviations
  let safe = text.replace(abbrevPattern, (m) => m.replace('.', placeholder))

  // Split on .!? followed by whitespace
  const parts = safe
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0)
    .map(s => s.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), '.'))

  // If no splits found, return the whole text as one sentence
  return parts.length > 0 ? parts : [text]
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
