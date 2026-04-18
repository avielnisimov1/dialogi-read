import { useReducer, useCallback } from 'react'
import { SCREENS } from '../utils/constants'

const initialState = {
  screen: SCREENS.HOME,
  params: {},
  history: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        screen: action.screen,
        params: action.params,
        history: [...state.history, { screen: state.screen, params: state.params }],
      }
    case 'GO_BACK': {
      if (state.history.length === 0) {
        return { ...initialState }
      }
      const newHistory = state.history.slice(0, -1)
      const last = state.history[state.history.length - 1]
      return {
        screen: last.screen,
        params: last.params,
        history: newHistory,
      }
    }
    case 'GO_HOME':
      return { ...initialState }
    default:
      return state
  }
}

export function useNavigation() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const navigate = useCallback((screen, params = {}) => {
    dispatch({ type: 'NAVIGATE', screen, params })
  }, [])

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' })
  }, [])

  const goHome = useCallback(() => {
    dispatch({ type: 'GO_HOME' })
  }, [])

  return { screen: state.screen, params: state.params, navigate, goBack, goHome }
}
