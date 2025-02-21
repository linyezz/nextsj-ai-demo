import request from '@/app/utils/request'
import streamRequest from '@/app/utils/streamRequest'

export const createChatSession = (data) => {
    // data 例子 {"appId":-1,"title":"1+1=？"} appId 默认-1 title就是提问内容
    /**
     * 返回 response 例子 
     * {
    "code": 200,
    "success": true,
    "msg": "操作成功",
    "data": {
        "id": 2336,
        "appId": -1,
        "appIcon": null,
        "modelEncode": null,
        "type": null,
        "title": "1+1=？",
        "topFlag": 0,
        "updateTime": null,
        "kbId": 18266,
        "presetDescription": null
    },
    "time": "2025-02-19 16:33:15"
}
     */
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
    data, // 参数数据例子 {"chatId":2308,"content":"什么是导数","modelCode":"deepseek_r1_14b","chatType":"NEW_CHAT"}
    onmessage, // 监听接受消息方法
    ctrl,
    onclose, // 监听请求关闭方法
    onerror // 监听请求报错方法
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
// 上传文件接口
export const chatFileUpload = (data) => {
    //  传参 data 类型
    // interface FileUploadParams {
    //     type: FileType // 文件类型
    //     files: File[] // 文件列表
    //     kbId?: number 第次一次上传文件不需要带，之后的文件带上第一次上传的返回值
    //   }
    /**
     * 返回值例子
     * {
    "code": 200,
    "success": true,
    "msg": "操作成功",
    "data": [
        {
            "id": 1236, // 发送消息时带上，字段名称时 dataSetIds 类型时 array[]
            "knowledgeBaseId": 19315, // 文件上传和发送消息时候的参数 kbId
            "dsEncode": "716176a9-c97b-484f-9b19-856309d3c639-脚本.docx",
            "dsType": "document",
            "dsName": "脚本.docx",
            "status": "PENDING",
            "errorReason": null,
            "ossUri": "http://192.168.6.240:9000/ecmax/aiboot/2025-02-20/1c79cd2a67cf2da1a569864ee7d3fb80.docx",
            "createTime": "2025-02-20 13:46:42",
            "updateTime": "2025-02-20 13:46:42",
            "createId": 1741,
            "updateId": 1741,
            "file": null
        }
    ],
    "time": "2025-02-20 13:46:42"
}
     */
    return request({
        url: `/chat/chatKbFile/upload`,
        method: 'post',
        data,
        timeout: 30000, // 设置30秒超时
        headers: {
        // FormData不需要设置Content-Type，浏览器会自动设置
        }
    }).catch(error => {
        console.error('文件上传请求失败:', error);
        throw error;
    });
    }