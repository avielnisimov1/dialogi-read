import { useRef } from 'react'
import './ImageUpload.css'

export default function ImageUpload({ onImageSelected, disabled }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelected(file)
    }
    // Reset so same file can be selected again
    e.target.value = ''
  }

  return (
    <div className="image-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="image-input-hidden"
        disabled={disabled}
      />
      <button
        className="btn-secondary upload-btn"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        📷 צלם או העלה תמונה
      </button>
    </div>
  )
}
