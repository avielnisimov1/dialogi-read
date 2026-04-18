export const myMemoryProvider = {
  name: 'mymemory',

  async translate(word) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|he`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Translation request failed')

    const data = await res.json()
    const hebrew = data.responseData?.translatedText || ''

    return { hebrew }
  },

  async translateSentence(sentence) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentence)}&langpair=en|he`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Sentence translation failed')

    const data = await res.json()
    return data.responseData?.translatedText || ''
  },
}
