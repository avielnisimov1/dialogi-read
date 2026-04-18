import { getItem, setItem } from './storageService'
import { STORAGE_KEYS } from '../utils/constants'

const MAX_CACHE_ENTRIES = 500

function getCache() {
  return getItem(STORAGE_KEYS.TRANSLATIONS) || {}
}

function pruneCache(cache) {
  const entries = Object.entries(cache)
  if (entries.length <= MAX_CACHE_ENTRIES) return cache
  entries.sort((a, b) => (a[1].cachedAt || '').localeCompare(b[1].cachedAt || ''))
  const toRemove = entries.length - MAX_CACHE_ENTRIES
  return Object.fromEntries(entries.slice(toRemove))
}

function cacheResult(key, result) {
  const cache = getCache()
  cache[key] = { ...result, cachedAt: new Date().toISOString() }
  setItem(STORAGE_KEYS.TRANSLATIONS, pruneCache(cache))
}

/**
 * Translate a single word — returns just the Hebrew word.
 */
export async function translateWord(word, sentence = '') {
  const clean = word.toLowerCase().trim()
  if (!clean) return null

  const cacheKey = `w:${clean}:${sentence.slice(0, 50)}`
  const cache = getCache()
  if (cache[cacheKey]) return cache[cacheKey]

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: clean, sentence, mode: 'word' }),
    })

    if (!res.ok) throw new Error('Translation failed')

    const data = await res.json()
    const result = { hebrew: data.hebrew || '' }

    if (result.hebrew) {
      cacheResult(cacheKey, result)
    }

    return result
  } catch {
    return { hebrew: '' }
  }
}

/**
 * Get detailed word info — translation, explanation, other meanings, examples.
 */
export async function getWordDetail(word, sentence = '') {
  const clean = word.toLowerCase().trim()
  if (!clean) return null

  const cacheKey = `d:${clean}:${sentence.slice(0, 50)}`
  const cache = getCache()
  if (cache[cacheKey]) return cache[cacheKey]

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: clean, sentence, mode: 'detail' }),
    })

    if (!res.ok) throw new Error('Detail failed')

    const data = await res.json()
    const result = {
      hebrew: data.hebrew || '',
      explanation: data.explanation || '',
      otherMeanings: data.otherMeanings || [],
      usageForms: data.usageForms || [],
      exampleSentences: data.exampleSentences || [],
    }

    if (result.hebrew) {
      cacheResult(cacheKey, result)
    }

    return result
  } catch {
    return { hebrew: '', explanation: '', otherMeanings: [], exampleSentences: [] }
  }
}

/**
 * Translate a full sentence.
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
