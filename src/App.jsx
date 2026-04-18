import { useState, useCallback, useRef } from 'react'
import { useNavigation } from './hooks/useNavigation'
import { useBooks } from './hooks/useBooks'
import { initStorage } from './services/storageService'
import { SCREENS } from './utils/constants'
import Header from './components/Header'
import HomeScreen from './screens/HomeScreen'
import NewBookScreen from './screens/NewBookScreen'
import AddPageScreen from './screens/AddPageScreen'
import ReaderScreen from './screens/ReaderScreen'

initStorage()

function App() {
  const { screen, params, navigate, goBack, goHome } = useNavigation()
  const bookOps = useBooks()
  const [quickReadText, setQuickReadText] = useState('')
  const settingsToggleRef = useRef(null)

  const handleQuickRead = useCallback((text) => {
    setQuickReadText(text)
    navigate(SCREENS.READER, { quickRead: true })
  }, [navigate])

  const getTitle = () => {
    switch (screen) {
      case SCREENS.HOME: return 'Dialogi Read'
      case SCREENS.NEW_BOOK: return 'ספר חדש'
      case SCREENS.ADD_PAGE: return params.bookId ? 'הוסף עמוד' : 'קריאה מהירה'
      case SCREENS.QUICK_READ: return 'קריאה מהירה'
      case SCREENS.READER: {
        if (params.quickRead) return 'קריאה מהירה'
        const book = bookOps.getBook(params.bookId)
        return book?.name || 'קריאה'
      }
      default: return 'Dialogi Read'
    }
  }

  const showBack = screen !== SCREENS.HOME
  const isReader = screen === SCREENS.READER

  const settingsButton = isReader ? (
    <button
      className="header-settings-btn"
      onClick={() => settingsToggleRef.current?.()}
    >
      Aa
    </button>
  ) : null

  return (
    <>
      <Header
        title={getTitle()}
        showBack={showBack}
        onBack={goBack}
        rightAction={settingsButton}
      />

      {screen === SCREENS.HOME && (
        <HomeScreen
          books={bookOps.books}
          navigate={navigate}
          deleteBook={bookOps.deleteBook}
          togglePin={bookOps.togglePin}
        />
      )}

      {screen === SCREENS.NEW_BOOK && (
        <NewBookScreen
          createBook={bookOps.createBook}
          navigate={navigate}
        />
      )}

      {screen === SCREENS.ADD_PAGE && (
        <AddPageScreen
          bookId={params.bookId}
          addPage={bookOps.addPage}
          navigate={navigate}
          onQuickRead={handleQuickRead}
        />
      )}

      {screen === SCREENS.QUICK_READ && (
        <AddPageScreen
          bookId={null}
          addPage={bookOps.addPage}
          navigate={navigate}
          onQuickRead={handleQuickRead}
        />
      )}

      {isReader && (
        <ReaderScreen
          bookId={params.quickRead ? null : params.bookId}
          quickReadText={params.quickRead ? quickReadText : null}
          getPages={bookOps.getPages}
          getBook={bookOps.getBook}
          updateBook={bookOps.updateBook}
          navigate={navigate}
          onSettingsButton={(fn) => { settingsToggleRef.current = fn }}
        />
      )}
    </>
  )
}

export default App
