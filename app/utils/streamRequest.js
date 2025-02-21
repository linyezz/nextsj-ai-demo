import { fetchEventSource } from '@microsoft/fetch-event-source'
import { message } from 'antd'
import Cookies from 'js-cookie'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
const token = Cookies.get('accessToken')

const service = (
    options,
    onmessage,
    ctrl = new AbortController(), // 用于中止请求
    onclose,
    onerror
) => {
    const url = baseURL + options.url
    console.log(options)
    fetchEventSource(url, {
        headers: {
            mimeType: 'multipart/form-data',
            Authorization: `Bearer ${token}`
        },
        responseType: 'stream',
        ...options,
        signal: ctrl.signal,
        body: options.data,
        method: options.method?.toUpperCase() || 'POST',
        onmessage: (msg) => {
            if (onmessage) onmessage(msg)
        },
        onclose: () => {
            console.log('请求已关闭')
            if (onclose) onclose()
        },
        onerror: (err) => {
            console.log(err, '请求错误')
            ctrl.abort()
            if (onerror) onerror(err)
            message.error(err.message) // 使用antd的message组件
            throw new Error(err)
        },
        openWhenHidden: true
    })
}

export default service
