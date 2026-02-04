import axios from 'axios'

const api = axios.create({
  baseURL: 'http://192.168.0.9:8000',
  withCredentials: true, // 🔥 ОБЯЗАТЕЛЬНО
})

let isRefreshing = false
let queue: any[] = []

function resolveQueue(error: any, token = null) {
  queue.forEach(p => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  queue = []
}

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then(() => api(original))
      }

      original._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh')
        resolveQueue(null)
        return api(original)
      } catch (err) {
        resolveQueue(err)
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
