import { myMemoryProvider } from './providers/myMemoryProvider'
import { dictionaryProvider } from './providers/dictionaryProvider'
import { getItem, setItem } from './storageService'
import { STORAGE_KEYS } from '../utils/constants'

function getCache() {
  return getItem(STORAGE_KEYS.TRANSLATIONS) || {}
}

function cacheWord(word, result) {
  const cache = getCache()
  cache[word.toLowerCase()] = { ...result, cachedAt: new Date().toISOString() }
  setItem(STORAGE_KEYS.TRANSLATIONS, cache)
}

/**
 * Translate a single word. Checks cache first, then calls APIs in parallel.
 */
export async function translateWord(word) {
  const clean = word.toLowerCase().trim()
  if (!clean) return null

  // Check cache
  const cache = getCache()
  if (cache[clean]) return cache[clean]

  // Call both APIs in parallel
  const [translationResult, dictionaryResult] = await Promise.allSettled([
    myMemoryProvider.translate(clean),
    dictionaryProvider.lookup(clean),
  ])

  const hebrew = translationResult.status === 'fulfilled'
    ? translationResult.value.hebrew
    : ''

  const dict = dictionaryResult.status === 'fulfilled'
    ? dictionaryResult.value
    : null

  const result = {
    hebrew,
    definition: dict?.definition || '',
    phonetic: dict?.phonetic || '',
    example: dict?.example || '',
    partOfSpeech: dict?.partOfSpeech || '',
    provider: 'mymemory',
  }

  if (hebrew) {
    cacheWord(clean, result)
  }

  return result
}

/**
 * Translate a full sentence.
 */
export async function translateSentence(sentence) {
  const trimmed = sentence.trim()
  if (!trimmed) return ''

  try {
    return await myMemoryProvider.translateSentence(trimmed)
  } catch {
    return ''
  }
}
