import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type Reducer,
} from "react"

type DevtoolsMessage = {
  type: string
  state?: string
  payload?: { type: string }
}

type DevtoolsConnection = {
  init: (state: unknown) => void
  send: (action: unknown, state: unknown) => void
  subscribe: (listener: (message: DevtoolsMessage) => void) => (() => void) | void
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect: (options?: { name?: string }) => DevtoolsConnection
    }
  }
}

/**
 * Drop-in replacement for useReducer that mirrors every action and the
 * resulting state to the Redux DevTools browser extension, including time
 * travel. Inactive in production builds or when the extension is missing.
 */
export function useDevtoolsReducer<S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  name: string
): [S, Dispatch<A>] {
  const [state, setState] = useState(initialState)
  // Latest state, updated synchronously so back-to-back dispatches chain correctly
  const stateRef = useRef(state)
  const connectionRef = useRef<DevtoolsConnection | null>(null)

  const replaceState = useCallback((next: S) => {
    stateRef.current = next
    setState(next)
  }, [])

  const dispatch = useCallback(
    (action: A) => {
      const next = reducer(stateRef.current, action)
      replaceState(next)
      connectionRef.current?.send(action, next)
    },
    [reducer, replaceState]
  )

  useEffect(() => {
    const extension = import.meta.env.DEV
      ? window.__REDUX_DEVTOOLS_EXTENSION__
      : undefined
    if (!extension) return

    const connection = extension.connect({ name })
    connection.init(stateRef.current)
    connectionRef.current = connection

    const unsubscribe = connection.subscribe((message) => {
      if (message.type !== "DISPATCH" || !message.payload) return

      switch (message.payload.type) {
        case "JUMP_TO_STATE":
        case "JUMP_TO_ACTION":
          if (message.state) replaceState(JSON.parse(message.state))
          break
        case "ROLLBACK":
          if (message.state) {
            const rolledBack = JSON.parse(message.state)
            replaceState(rolledBack)
            connection.init(rolledBack)
          }
          break
        case "COMMIT":
          connection.init(stateRef.current)
          break
        case "RESET":
          replaceState(initialState)
          connection.init(initialState)
          break
      }
    })

    return () => {
      connectionRef.current = null
      unsubscribe?.()
    }
  }, [name, initialState, replaceState])

  return [state, dispatch]
}
