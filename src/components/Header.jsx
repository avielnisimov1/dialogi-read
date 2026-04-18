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
        {isHome && <img src="/logo.svg" alt="Dialogi" className="header-logo" />}
        <h1 className="header-title">{title}</h1>
      </div>
      {rightAction && <div className="header-left">{rightAction}</div>}
    </header>
  )
}
