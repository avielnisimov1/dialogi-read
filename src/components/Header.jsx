import './Header.css'

export default function Header({ title, showBack, onBack, rightAction }) {
  const isHome = !showBack

  return (
    <header className="header">
      <div className="header-right">
        {showBack && (
          <button className="header-back" onClick={onBack}>
            ←
          </button>
        )}
        {isHome ? (
          <div className="header-brand">
            <img src="/icon.png" alt="" className="header-icon" />
            <img src="/logo-text.png" alt="Dialogi" className="header-logo-text" />
            <span className="header-read">Read</span>
          </div>
        ) : (
          <h1 className="header-title">{title}</h1>
        )}
      </div>
      {rightAction && <div className="header-left">{rightAction}</div>}
    </header>
  )
}
