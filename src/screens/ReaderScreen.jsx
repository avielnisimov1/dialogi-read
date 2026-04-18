import { useState, useCallback } from 'react'
import { SCREENS } from '../utils/constants'
import TextRenderer from '../features/reader/TextRenderer'
import TranslationPopup from '../features/reader/TranslationPopup'
import ReaderSettings, { useReaderSettings } from '../features/reader/ReaderSettings'
import './ReaderScreen.css'

export default function ReaderScreen({
  bookId,
  quickReadText,
  getPages,
  getBook,
  updateBook,
  navigate,
}) {
  const isQuickRead = !bookId

  const book = isQuickRead ? null : getBook(bookId)
  const pages = isQuickRead ? [] : getPages(bookId)
  const currentPageIndex = book?.currentPageIndex || 0

  const currentText = isQuickRead
    ? quickReadText
    : pages[currentPageIndex]?.text || ''

  const [selectedWord, setSelectedWord] = useState(null)
  const [selectedSentence, setSelectedSentence] = useState(null)
  const [highlightedSentence, setHighlightedSentence] = useState(null)
  const [popupMode, setPopupMode] = useState(null)
  const [wordPosition, setWordPosition] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const { settings, update: updateSetting, cssVars } = useReaderSettings()

  const handleWordTap = useCallback((word, sentence, position) => {
    setSelectedWord(word)
    setSelectedSentence(sentence)
    setWordPosition(position)
    setHighlightedSentence(null)
    setPopupMode('word')
  }, [])

  const handleLongPress = useCallback((word, sentence) => {
    setHighlightedSentence(sentence)
    setSelectedWord(word)
    setSelectedSentence(sentence)
    setPopupMode('sentence')
  }, [])

  const handleClosePopup = useCallback(() => {
    setSelectedWord(null)
    setSelectedSentence(null)
    setHighlightedSentence(null)
    setPopupMode(null)
    setWordPosition(null)
  }, [])

  const goToPage = useCallback((index) => {
    if (!bookId) return
    updateBook(bookId, { currentPageIndex: index })
  }, [bookId, updateBook])

  if (!currentText) {
    return (
      <div className="screen reader-empty">
        <p>אין טקסט לקריאה</p>
        {bookId && (
          <button
            className="btn-primary"
            onClick={() => navigate(SCREENS.ADD_PAGE, { bookId })}
          >
            הוסף עמוד
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className="reader-screen"
      style={{ backgroundColor: settings.bgColor }}
    >
      <button
        className="settings-toggle"
        onClick={() => setShowSettings(true)}
      >
        Aa
      </button>

      <div
        className="reader-content"
        onClick={popupMode ? handleClosePopup : undefined}
      >
        <TextRenderer
          text={currentText}
          highlightedSentence={highlightedSentence}
          style={cssVars}
          onWordTap={handleWordTap}
          onLongPress={handleLongPress}
        />
      </div>

      {!isQuickRead && pages.length > 1 && (
        <div className="page-nav">
          <button
            className="page-btn"
            onClick={() => goToPage(currentPageIndex - 1)}
            disabled={currentPageIndex === 0}
          >
            → הקודם
          </button>
          <span className="page-indicator">
            {currentPageIndex + 1} / {pages.length}
          </span>
          <button
            className="page-btn"
            onClick={() => goToPage(currentPageIndex + 1)}
            disabled={currentPageIndex >= pages.length - 1}
          >
            הבא ←
          </button>
        </div>
      )}

      {!isQuickRead && (
        <button
          className="add-page-fab"
          onClick={() => navigate(SCREENS.ADD_PAGE, { bookId })}
        >
          + עמוד
        </button>
      )}

      {popupMode && (
        <TranslationPopup
          word={selectedWord}
          sentence={selectedSentence}
          mode={popupMode}
          position={wordPosition}
          onClose={handleClosePopup}
        />
      )}

      {showSettings && (
        <ReaderSettings
          settings={settings}
          onUpdate={updateSetting}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
