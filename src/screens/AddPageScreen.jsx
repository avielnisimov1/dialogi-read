import { useState } from 'react'
import { SCREENS, PAGE_SOURCE } from '../utils/constants'
import { useOcr } from '../hooks/useOcr'
import ImageUpload from '../components/ImageUpload'
import './AddPageScreen.css'

export default function AddPageScreen({ bookId, addPage, navigate, onQuickRead }) {
  const [text, setText] = useState('')
  const [activeTab, setActiveTab] = useState('text')
  const isQuickRead = !bookId
  const ocr = useOcr()

  const handleSave = () => {
    const trimmed = text.trim()
    if (!trimmed) return

    if (isQuickRead) {
      onQuickRead(trimmed)
    } else {
      addPage(bookId, trimmed, activeTab === 'image' ? PAGE_SOURCE.OCR : PAGE_SOURCE.PASTE)
      navigate(SCREENS.READER, { bookId })
    }
  }

  const handleImageSelected = async (file) => {
    const result = await ocr.processImage(file)
    if (result) {
      setText(result)
    }
  }

  return (
    <div className="screen add-page-screen">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'text' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          הדבק טקסט
        </button>
        <button
          className={`tab ${activeTab === 'image' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          צלם / העלה תמונה
        </button>
      </div>

      {activeTab === 'text' ? (
        <div className="tab-content">
          <textarea
            className="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="הדבק כאן טקסט באנגלית..."
            dir="ltr"
            autoFocus
          />
        </div>
      ) : (
        <div className="tab-content">
          {ocr.processing ? (
            <div className="ocr-progress">
              <div className="ocr-progress-bar">
                <div
                  className="ocr-progress-fill"
                  style={{ width: `${ocr.progress}%` }}
                />
              </div>
              <p className="ocr-progress-text">מזהה טקסט... {ocr.progress}%</p>
            </div>
          ) : ocr.result || text ? (
            <div className="ocr-review">
              <p className="ocr-review-label">בדוק ותקן את הטקסט אם צריך:</p>
              <textarea
                className="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                dir="ltr"
              />
              <button
                className="btn-secondary"
                onClick={() => { ocr.clearResult(); setText(''); }}
                style={{ marginTop: 'var(--spacing-sm)' }}
              >
                צלם שוב
              </button>
            </div>
          ) : (
            <div className="ocr-upload-area">
              <ImageUpload onImageSelected={handleImageSelected} disabled={ocr.processing} />
              {ocr.error && <p className="ocr-error">{ocr.error}</p>}
            </div>
          )}
        </div>
      )}

      <button
        className="btn-primary save-btn"
        onClick={handleSave}
        disabled={!text.trim() || ocr.processing}
      >
        {isQuickRead ? 'התחל לקרוא' : 'שמור עמוד'}
      </button>
    </div>
  )
}
