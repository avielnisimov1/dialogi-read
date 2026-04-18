export const dictionaryProvider = {
  name: 'dictionary',

  async lookup(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    const res = await fetch(url)
    if (!res.ok) return null

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null

    const entry = data[0]
    const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || ''

    const meanings = entry.meanings || []
    const firstMeaning = meanings[0]
    const definition = firstMeaning?.definitions?.[0]?.definition || ''
    const example = firstMeaning?.definitions?.[0]?.example || ''
    const partOfSpeech = firstMeaning?.partOfSpeech || ''

    return {
      definition,
      phonetic,
      example,
      partOfSpeech,
    }
  },
}
