import { useState, useEffect } from 'react'
import { getItem, setItem } from '../../services/storageService'
import { STORAGE_KEYS } from '../../utils/constants'
import './reader.css'

const FONTS = [
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'System', value: '-apple-system, sans-serif' },
  { label: 'Mono', value: 'ui-monospace, monospace' },
]

const TEXT_COLORS = [
  { label: 'dark', value: '#1A1A1A' },
  { label: 'soft', value: '#333333' },
  { label: 'brown', value: '#3E2723' },
  { label: 'light', value: '#E0E0E0' },
]

const BG_COLORS = [
  { label: 'cream', value: '#FFFEF5' },
  { label: 'white', value: '#FFFFFF' },
  { label: 'gray', value: '#F0F0F0' },
  { label: 'sepia', value: '#F5E6CA' },
  { label: 'dark', value: '#1A1A1A' },
]

// Auto-pick text color when background changes
function getAutoTextColor(bgColor) {
  const darkBgs = ['#1A1A1A']
  if (darkBgs.includes(bgColor)) return '#E0E0E0'
  return '#1A1A1A'
}

const DEFAULT_SETTINGS = {
  fontSize: 20,
  lineHeight: 2,
  wordSpacing: 5,
  fontFamily: FONTS[0].value,
  textColor: TEXT_COLORS[0].value,
  bgColor: BG_COLORS[0].value,
}

export function useReaderSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = getItem(STORAGE_KEYS.SETTINGS)
    return { ...DEFAULT_SETTINGS, ...saved }
  })

  useEffect(() => {
    setItem(STORAGE_KEYS.SETTINGS, settings)
  }, [settings])

  const update = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      // Auto-adjust text color when bg changes
      if (key === 'bgColor') {
        next.textColor = getAutoTextColor(value)
      }
      return next
    })
  }

  const cssVars = {
    '--reader-font': settings.fontFamily,
    '--reader-font-size': settings.fontSize + 'px',
    '--reader-line-height': settings.lineHeight,
    '--reader-color': settings.textColor,
    '--reader-word-spacing': settings.wordSpacing + 'px',
  }

  return { settings, update, cssVars }
}

export default function ReaderSettings({ settings, onUpdate, onClose }) {
  return (
    <>
      <div className="settings-backdrop" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-title">הגדרות קריאה</div>

        {/* Font size */}
        <div className="setting-row">
          <span className="setting-label">גודל גופן</span>
          <div className="setting-control">
            <button
              className="setting-btn"
              onClick={() => onUpdate('fontSize', Math.max(14, settings.fontSize - 2))}
            >
              -
            </button>
            <span className="setting-value">{settings.fontSize}</span>
            <button
              className="setting-btn"
              onClick={() => onUpdate('fontSize', Math.min(32, settings.fontSize + 2))}
            >
              +
            </button>
          </div>
        </div>

        {/* Line height */}
        <div className="setting-row">
          <span className="setting-label">מרווח שורות</span>
          <div className="setting-control">
            <button
              className="setting-btn"
              onClick={() => onUpdate('lineHeight', Math.max(1.4, +(settings.lineHeight - 0.2).toFixed(1)))}
            >
              -
            </button>
            <span className="setting-value">{settings.lineHeight}</span>
            <button
              className="setting-btn"
              onClick={() => onUpdate('lineHeight', Math.min(3, +(settings.lineHeight + 0.2).toFixed(1)))}
            >
              +
            </button>
          </div>
        </div>

        {/* Word spacing */}
        <div className="setting-row">
          <span className="setting-label">מרווח מילים</span>
          <div className="setting-control">
            <button
              className="setting-btn"
              onClick={() => onUpdate('wordSpacing', Math.max(0, settings.wordSpacing - 1))}
            >
              -
            </button>
            <span className="setting-value">{settings.wordSpacing}</span>
            <button
              className="setting-btn"
              onClick={() => onUpdate('wordSpacing', Math.min(15, settings.wordSpacing + 1))}
            >
              +
            </button>
          </div>
        </div>

        {/* Font family */}
        <div className="setting-row">
          <span className="setting-label">גופן</span>
          <div className="setting-control">
            {FONTS.map(f => (
              <button
                key={f.value}
                className={`font-option ${settings.fontFamily === f.value ? 'active' : ''}`}
                onClick={() => onUpdate('fontFamily', f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text color */}
        <div className="setting-row">
          <span className="setting-label">צבע טקסט</span>
          <div className="setting-control">
            {TEXT_COLORS.map(c => (
              <button
                key={c.value}
                className={`color-option ${settings.textColor === c.value ? 'active' : ''}`}
                style={{ backgroundColor: c.value }}
                onClick={() => onUpdate('textColor', c.value)}
              />
            ))}
          </div>
        </div>

        {/* Background color */}
        <div className="setting-row">
          <span className="setting-label">צבע רקע</span>
          <div className="setting-control">
            {BG_COLORS.map(c => (
              <button
                key={c.value}
                className={`bg-option ${settings.bgColor === c.value ? 'active' : ''}`}
                style={{ backgroundColor: c.value }}
                onClick={() => onUpdate('bgColor', c.value)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
