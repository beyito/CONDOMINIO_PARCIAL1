import { useState, useCallback } from 'react'

export const useApi = (apiFunction) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true)
        setError(null)

        const result = await apiFunction(...args)
        setData(result)

        return result
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}
