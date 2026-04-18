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
            <h1 className="header-title">Dialogi Read</h1>
          </div>
        ) : (
          <h1 className="header-title">{title}</h1>
        )}
      </div>
      {rightAction && <div className="header-left">{rightAction}</div>}
    </header>
  )
}
