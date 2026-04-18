import { useState } from 'react'
import { SCREENS } from '../utils/constants'
import './NewBookScreen.css'

export default function NewBookScreen({ createBook, navigate }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const book = createBook(trimmed)
    navigate(SCREENS.ADD_PAGE, { bookId: book.id })
  }

  return (
    <div className="screen new-book-screen">
      <form onSubmit={handleSubmit} className="new-book-form">
        <label className="form-label">שם הספר</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="לדוגמה: Harry Potter Chapter 1"
          dir="auto"
          autoFocus
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={!name.trim()}
        >
          צור ספר
        </button>
      </form>
    </div>
  )
}
