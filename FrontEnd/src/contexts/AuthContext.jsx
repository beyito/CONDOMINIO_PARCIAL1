import React, { createContext, useContext, useReducer, useEffect } from 'react'
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  refresh as apiRefresh
} from '../api/auth/login'
// Estados de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null
      }

    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        error: action.payload
      }

    case 'REFRESH_TOKEN':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken
      }

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        error: null
      }

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

// Estado inicial
const initialState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null
}

// Crear contexto
export const AuthContext = createContext()

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedAuth = localStorage.getItem('authData')
        if (storedAuth) {
          const { user, accessToken, refreshToken } = JSON.parse(storedAuth)

          // Verificar si el token no ha expirado
          if (isTokenValid(accessToken)) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, accessToken, refreshToken }
            })
          } else if (refreshToken) {
            // Intentar renovar el token
            refreshAccessToken(refreshToken)
          } else {
            // Limpiar datos inválidos
            localStorage.removeItem('authData')
          }
        }
      } catch (error) {
        console.error('Error loading auth data:', error)
        localStorage.removeItem('authData')
      }
    }

    loadStoredAuth()
  }, [])

  // Guardar en localStorage cuando cambie el estado de auth
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.accessToken) {
      const authData = {
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      }
      localStorage.setItem('authData', JSON.stringify(authData))
    } else {
      localStorage.removeItem('authData')
    }
  }, [state.isAuthenticated, state.user, state.accessToken, state.refreshToken])

  // Verificar si el token es válido
  const isTokenValid = (token) => {
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch (error) {
      return false
    }
  }

  // Login
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      // credentials = { username, password }
      console.log(credentials)
      const response = await apiLogin(
        credentials.username,
        credentials.password
      )
      console.log(response)

      const values = response.data.values // Axios guarda JSON en data

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            username: values.username,
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            rol: values.rol,
            is_staff: values.is_staff
          },
          accessToken: values.access,
          refreshToken: values.refresh
        }
      })

      return { success: true, data: values }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || error.message
      })
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }

  // Registro
  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await apiRegister(
        userData.username,
        userData.password,
        userData.name
      )
      const values = response.data.values

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            username: values.username,
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            rol: values.rol,
            is_staff: values.is_staff
          },
          accessToken: values.access,
          refreshToken: values.refresh
        }
      })

      return { success: true, data: values }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || error.message
      })
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }

  // Refresh
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await apiRefresh(refreshToken)
      const values = response.data.values

      dispatch({
        type: 'REFRESH_TOKEN',
        payload: {
          accessToken: values.access,
          refreshToken: values.refresh || refreshToken
        }
      })

      return values.access
    } catch (error) {
      console.error('Error refreshing token:', error)
      logout()
      return null
    }
  }

  // Logout
  const logout = async () => {
    try {
      if (state.refreshToken) {
        await apiLogout()
      }
    } catch (error) {
      console.error('Error during logout:', error)
    }
    dispatch({ type: 'LOGOUT' })
  }

  // Actualizar información del usuario
  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    })
  }

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Interceptor para requests automáticos con token
  const authenticatedFetch = async (url, options = {}) => {
    let token = state.accessToken

    // Verificar si el token necesita renovarse
    if (!isTokenValid(token) && state.refreshToken) {
      token = await refreshAccessToken(state.refreshToken)
    }

    if (!token) {
      throw new Error('No valid token available')
    }

    const authenticatedOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    const response = await fetch(url, authenticatedOptions)

    // Si el token expiró, intentar renovarlo una vez más
    if (response.status === 401 && state.refreshToken) {
      const newToken = await refreshAccessToken(state.refreshToken)
      if (newToken) {
        authenticatedOptions.headers['Authorization'] = `Bearer ${newToken}`
        return fetch(url, authenticatedOptions)
      }
    }

    return response
  }

  const value = {
    // Estado
    ...state,

    // Acciones
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshAccessToken,
    authenticatedFetch,

    // Utilidades
    isTokenValid
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
