import { useState, useCallback } from 'react'
import { SCREENS } from '../utils/constants'

export function useNavigation() {
  const [screen, setScreen] = useState(SCREENS.HOME)
  const [params, setParams] = useState({})
  const [history, setHistory] = useState([])

  const navigate = useCallback((newScreen, newParams = {}) => {
    setHistory(prev => [...prev, { screen, params }])
    setScreen(newScreen)
    setParams(newParams)
  }, [screen, params])

  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) {
        setScreen(SCREENS.HOME)
        setParams({})
        return prev
      }
      const newHistory = [...prev]
      const last = newHistory.pop()
      setScreen(last.screen)
      setParams(last.params)
      return newHistory
    })
  }, [])

  const goHome = useCallback(() => {
    setHistory([])
    setScreen(SCREENS.HOME)
    setParams({})
  }, [])

  return { screen, params, navigate, goBack, goHome }
}
