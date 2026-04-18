import { SCREENS } from '../utils/constants'
import './HomeScreen.css'

export default function HomeScreen({ books, navigate }) {
  return (
    <div className="screen home-screen">
      <div className="home-actions">
        <button
          className="btn-primary"
          onClick={() => navigate(SCREENS.QUICK_READ)}
        >
          קריאה מהירה
        </button>
        <button
          className="btn-secondary"
          onClick={() => navigate(SCREENS.NEW_BOOK)}
        >
          + ספר חדש
        </button>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <p className="empty-text">עוד אין ספרים</p>
          <p className="empty-sub">הוסף ספר חדש או התחל קריאה מהירה</p>
        </div>
      ) : (
        <div className="books-list">
          <h2 className="section-title">הספרים שלי</h2>
          {books.map(book => (
            <button
              key={book.id}
              className="book-card"
              onClick={() => navigate(SCREENS.READER, { bookId: book.id })}
            >
              <div className="book-info">
                <h3 className="book-name">{book.name}</h3>
                <p className="book-meta">
                  {book.totalPages > 0
                    ? `עמוד ${book.currentPageIndex + 1} מתוך ${book.totalPages}`
                    : 'אין עמודים עדיין'}
                </p>
              </div>
              <span className="book-arrow">←</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
