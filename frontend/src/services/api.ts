import axios from 'axios'
import { toast } from './ToastService'

const api = axios.create({
  baseURL: 'http://localhost:3001',
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o backend cair ou não responder
    if (!error.response) {
      toast.error('Erro de conexão com o servidor')
      return Promise.reject(error)
    }

    // Se o backend retornou um erro (4xx ou 5xx)
    const message = error.response.data?.error || 'Ocorreu um erro inesperado'
    toast.error(message)

    return Promise.reject(error)
  },
)

export default api
