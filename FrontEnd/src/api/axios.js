import axios from 'axios'

const instancia = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/',
  withCredentials: true
})

export default instancia
