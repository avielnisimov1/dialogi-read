import { useState, useCallback, useEffect } from 'react'
import { getItem, setItem, removeItem } from '../services/storageService'
import { STORAGE_KEYS } from '../utils/constants'

export function useBooks() {
  const [books, setBooks] = useState([])

  useEffect(() => {
    const saved = getItem(STORAGE_KEYS.BOOKS)
    if (saved) setBooks(saved)
  }, [])

  const saveBooks = useCallback((updated) => {
    setBooks(updated)
    setItem(STORAGE_KEYS.BOOKS, updated)
  }, [])

  const createBook = useCallback((name) => {
    const book = {
      id: 'book_' + Date.now(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentPageIndex: 0,
      totalPages: 0,
    }
    const updated = [...books, book]
    saveBooks(updated)
    return book
  }, [books, saveBooks])

  const deleteBook = useCallback((bookId) => {
    const updated = books.filter(b => b.id !== bookId)
    saveBooks(updated)
    removeItem(STORAGE_KEYS.PAGES + bookId)
  }, [books, saveBooks])

  const updateBook = useCallback((bookId, changes) => {
    const updated = books.map(b =>
      b.id === bookId ? { ...b, ...changes, updatedAt: new Date().toISOString() } : b
    )
    saveBooks(updated)
  }, [books, saveBooks])

  const togglePin = useCallback((bookId) => {
    const book = books.find(b => b.id === bookId)
    if (!book) return
    const pinnedCount = books.filter(b => b.pinned).length
    // Max 3 pinned
    if (!book.pinned && pinnedCount >= 3) return
    updateBook(bookId, { pinned: !book.pinned })
  }, [books, updateBook])

  const getBook = useCallback((bookId) => {
    return books.find(b => b.id === bookId) || null
  }, [books])

  // Page operations
  const getPages = useCallback((bookId) => {
    return getItem(STORAGE_KEYS.PAGES + bookId) || []
  }, [])

  const addPage = useCallback((bookId, text, source) => {
    const pages = getPages(bookId)
    const page = {
      id: 'page_' + Date.now(),
      bookId,
      pageNumber: pages.length + 1,
      text,
      source,
      addedAt: new Date().toISOString(),
    }
    const updatedPages = [...pages, page]
    setItem(STORAGE_KEYS.PAGES + bookId, updatedPages)
    updateBook(bookId, { totalPages: updatedPages.length })
    return page
  }, [getPages, updateBook])

  const deletePage = useCallback((bookId, pageId) => {
    const pages = getPages(bookId)
    const updated = pages
      .filter(p => p.id !== pageId)
      .map((p, i) => ({ ...p, pageNumber: i + 1 }))
    setItem(STORAGE_KEYS.PAGES + bookId, updated)
    updateBook(bookId, { totalPages: updated.length })
  }, [getPages, updateBook])

  return {
    books,
    createBook,
    deleteBook,
    updateBook,
    togglePin,
    getBook,
    getPages,
    addPage,
    deletePage,
  }
}
