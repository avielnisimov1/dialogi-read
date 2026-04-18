import { getItem, setItem } from './storageService'
import { STORAGE_KEYS } from '../utils/constants'

function getCache() {
  return getItem(STORAGE_KEYS.TRANSLATIONS) || {}
}

function cacheWord(word, sentence, result) {
  const cache = getCache()
  // Cache key includes sentence for context-aware caching
  const key = `${word.toLowerCase()}__${sentence.slice(0, 50)}`
  cache[key] = { ...result, cachedAt: new Date().toISOString() }
  // Also cache the simple word for quick lookups
  if (!cache[word.toLowerCase()]) {
    cache[word.toLowerCase()] = { ...result, cachedAt: new Date().toISOString() }
  }
  setItem(STORAGE_KEYS.TRANSLATIONS, cache)
}

/**
 * Translate a single word using Gemini AI with sentence context.
 */
export async function translateWord(word, sentence = '') {
  const clean = word.toLowerCase().trim()
  if (!clean) return null

  // Check cache (context-aware first, then simple)
  const cache = getCache()
  const contextKey = `${clean}__${sentence.slice(0, 50)}`
  if (cache[contextKey]) return cache[contextKey]
  if (cache[clean]) return cache[clean]

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: clean, sentence, mode: 'word' }),
    })

    if (!res.ok) throw new Error('Translation failed')

    const data = await res.json()
    const result = {
      hebrew: data.hebrew || '',
      explanation: data.explanation || '',
      provider: 'gemini',
    }

    if (result.hebrew) {
      cacheWord(clean, sentence, result)
    }

    return result
  } catch {
    return { hebrew: '', explanation: '', provider: 'error' }
  }
}

/**
 * Translate a full sentence using Gemini AI.
 */
export async function translateSentence(sentence) {
  const trimmed = sentence.trim()
  if (!trimmed) return ''

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence: trimmed, mode: 'sentence' }),
    })

    if (!res.ok) throw new Error('Sentence translation failed')

    const data = await res.json()
    return data.translation || ''
  } catch {
    return ''
  }
}
