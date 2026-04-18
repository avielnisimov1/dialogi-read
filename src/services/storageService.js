const SCHEMA_VERSION = 1

export function getItem(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed
  } catch {
    return null
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage write failed:', e)
  }
}

export function removeItem(key) {
  localStorage.removeItem(key)
}

export function getSchemaVersion() {
  return getItem('dialogi_schema_version') || 0
}

export function initStorage() {
  const version = getSchemaVersion()
  if (version < SCHEMA_VERSION) {
    setItem('dialogi_schema_version', SCHEMA_VERSION)
  }
}
