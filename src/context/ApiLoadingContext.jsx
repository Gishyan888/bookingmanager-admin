import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { subscribeApiLoading } from '../api/client'

const ApiLoadingContext = createContext({ pendingRequests: 0, isLoading: false })

export function ApiLoadingProvider({ children }) {
  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => subscribeApiLoading(setPendingRequests), [])

  const value = useMemo(
    () => ({ pendingRequests, isLoading: pendingRequests > 0 }),
    [pendingRequests],
  )

  return (
    <ApiLoadingContext.Provider value={value}>
      {children}
    </ApiLoadingContext.Provider>
  )
}

export function useApiLoading() {
  return useContext(ApiLoadingContext)
}
