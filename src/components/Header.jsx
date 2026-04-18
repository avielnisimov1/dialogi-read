import './Header.css'

export default function Header({ title, showBack, onBack, rightAction }) {
  return (
    <header className="header">
      <div className="header-right">
        {showBack && (
          <button className="header-back" onClick={onBack}>
            ←
          </button>
        )}
        <h1 className="header-title">{title}</h1>
      </div>
      {rightAction && <div className="header-left">{rightAction}</div>}
    </header>
  )
}
