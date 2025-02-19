import request from '@/app/utils/request'
import streamRequest from '@/app/utils/streamRequest'

export const createChatSession = (data) => {
    return request({
        url: '/chat/newChat',
        method: 'post',
        data
    })
}

// 获取聊天历史

export const getChatHistory = () => {
    return request({
        url: `/chat/getChatHistory/-1`,
        method: 'get',
    })
}

export const getChatDetail = (chatId) => {
    return request({
        url: `/chat/getChatDetail/${chatId}`,
        method: 'get'
    })
}
// 停止回答
export const interruptChatSession = (chatId) => {
    return request({
        url: `/chat/v1/completions/interrupt?chatId=${chatId}`,
        method: 'post',
    })
}
export const getChatResult = (
    data,
    onmessage,
    ctrl,
    onclose,
    onerror
) =>
    streamRequest(
        {
            url: `/chat/v1/completions`,
            method: 'post',
            data
        },
        onmessage,
        ctrl,
        onclose,
        onerror
    )