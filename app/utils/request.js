import axios from 'axios'
import Cookies from 'js-cookie'

// 创建 axios 实例
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从 cookie 中获取 token
    const token = Cookies.get('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // token 过期或无效，重定向到登录页
          window.location.href = '/login'
          break
        case 403:
          console.error('没有权限访问该资源')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器错误')
          break
        default:
          console.error('发生错误:', error.response.data.message)
      }
    } else if (error.request) {
      console.error('没有收到响应')
    } else {
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  }
)

/**
 * 统一请求方法
 * @param {string} url - 请求地址
 * @param {Object} options - 请求配置
 * @param {string} options.method - 请求方法 (GET, POST, PUT, DELETE)
 * @param {Object} options.params - URL参数
 * @param {Object} options.data - 请求体数据
 * @param {Object} options.headers - 自定义请求头
 * @returns {Promise} 
 */
const request = (options = {}) => {
  const {url, method = 'GET', params, data, headers = {} } = options

  return instance({
    url,
    method,
    params,
    data,
    headers,
  })
}

export default request 