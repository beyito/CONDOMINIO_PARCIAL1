import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User, AlertCircle } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: ''
  })
  const [errors, setErrors] = useState({})

  const { login, register, loading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    // Limpiar errores
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (error) clearError()
  }

  const validateForm = () => {
    const newErrors = {}

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El username es requerido'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const result = isLogin
      ? await login({
          username: formData.username,
          password: formData.password
        })
      : await register(formData)

    if (result.success) {
      navigate(from, { replace: true })
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrors({})
    setFormData({ username: '', password: '', name: '' })
    if (error) clearError()
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center p-4'>
      <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg'>
            <Lock className='text-white' size={28} />
          </div>
          <h2 className='text-2xl font-bold text-gray-800'>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className='text-gray-600 mt-2'>
            {isLogin ? 'Bienvenido de vuelta' : 'Únete a nosotros'}
          </p>
        </div>

        {/* Error global */}
        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2'>
            <AlertCircle className='text-red-500 flex-shrink-0' size={20} />
            <span className='text-red-700 text-sm'>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className='space-y-6'>
          {/* Nombre (solo para registro) */}
          {!isLogin && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Nombre completo
              </label>
              <div className='relative'>
                <User
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  size={20}
                />
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.name
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder='Juan Pérez'
                />
              </div>
              {errors.name && (
                <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
              )}
            </div>
          )}

          {/* username */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Nombre de usuario
            </label>
            <div className='relative'>
              <User
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={20}
              />
              <input
                type='username'
                name='username'
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.username
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder='username'
              />
            </div>
            {errors.username && (
              <p className='text-red-500 text-sm mt-1'>{errors.username}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Contraseña
            </label>
            <div className='relative'>
              <Lock
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={20}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.password
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder='••••••••'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed'
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className='text-red-500 text-sm mt-1'>{errors.password}</p>
            )}
          </div>

          {/* Botón de envío */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className='w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
          >
            {loading ? (
              <div className='flex items-center justify-center space-x-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                <span>{isLogin ? 'Iniciando...' : 'Registrando...'}</span>
              </div>
            ) : isLogin ? (
              'Iniciar Sesión'
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </div>

        {/* Toggle entre login y registro */}
        <div className='mt-6 text-center'>
          <p className='text-gray-600'>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              onClick={toggleMode}
              disabled={loading}
              className='ml-2 text-indigo-600 hover:text-indigo-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
