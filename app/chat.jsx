'use client'

import { useState, useRef, useEffect } from 'react'
import ChatInput from '@/app/components/ChatInput'
import ChatMessage from '@/app/components/ChatMessage'
import FileUpload from '@/app/components/FileUpload'
import Sidebar from '@/app/components/Sidebar'
import AuthCheck from '@/app/components/AuthCheck'
import {
  getChatHistory,
  getChatDetail,
  getChatResult,
  createChatSession,
  chatFileUpload,
  interruptChatSession
} from '@/app/api/chat/index.js'
import { Button } from 'antd'
import { StopOutlined } from '@ant-design/icons'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isReceiving, setIsReceiving] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [conversations, setConversations] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const abortController = useRef(null)

  // 加载聊天历史
  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true)
      const response = await getChatHistory()
      console.log('loadChatHistory response:', response)
      
      if (response?.code === 200 && response?.success && Array.isArray(response?.data)) {
        setConversations(response.data)
        if (response.data.length > 0) {
          setCurrentChatId(response.data[0].id)
          const detail = await getChatDetail(response.data[0].id)
          if (detail?.code === 200 && detail?.success && Array.isArray(detail?.data)) {
            // 构造完整的对话消息列表
            const formattedMessages = [];
            detail.data.forEach(item => {
              // 添加用户问题
              if (item.role === 'HUMAN') {
                formattedMessages.push({
                  role: 'user',
                  content: item.content || ''
                });
              }
              // 处理AI回答列表
              if (item.answerList && Array.isArray(item.answerList)) {
                item.answerList.forEach(answer => {
                  if (answer && answer.role === 'AI') {
                    formattedMessages.push({
                      role: 'assistant',
                      content: answer.content || ''
                    });
                  }
                });
              }
            });
            console.log('initial formatted messages:', formattedMessages);
            setMessages(formattedMessages)
          } else {
            console.error('加载初始聊天详情失败:', detail?.msg || '未知错误')
            setMessages([])
          }
        }
      } else {
        console.error('加载聊天历史失败:', response?.msg || '未知错误')
        setConversations([])
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error)
      setConversations([])
      setMessages([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // 加载聊天详情
  const loadChatDetail = async (chatId) => {
    if (!chatId) return
    
    try {
      setIsLoading(true)
      const response = await getChatDetail(chatId)
      console.log('loadChatDetail response:', response)
      
      if (response?.code === 200 && response?.success && Array.isArray(response?.data)) {
        // 构造完整的对话消息列表
        const formattedMessages = [];
        response.data.forEach(item => {
          // 添加用户问题
          if (item.role === 'HUMAN') {
            formattedMessages.push({
              role: 'user',
              content: item.content || ''
            });
          }
          // 处理AI回答列表
          if (item.answerList && Array.isArray(item.answerList)) {
            // 修改这里：不再遍历answerList，而是将整个answerList作为一条消息
            formattedMessages.push({
              role: 'assistant',
              content: item.answerList[0]?.content || '',  // 默认显示第一条回答
              answerList: item.answerList.map(answer => ({
                content: answer.content || ''
              }))
            });
          }
        });
        setMessages(formattedMessages)
      } else {
        console.error('加载聊天详情失败:', response?.msg || '未知错误')
        setMessages([])
      }
    } catch (error) {
      console.error('加载聊天详情失败:', error)
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadChatHistory()
  }, [])

  const handleNewChat = () => {
    // 如果已经有新对话了，就不再创建
    const hasNewChat = conversations.some(chat => chat.title === '新对话')
    if (hasNewChat) {
      // 找到新对话并选中它
      const newChat = conversations.find(chat => chat.title === '新对话')
      if (newChat) {
        setCurrentChatId(newChat.id)
        setMessages([])
      }
      return
    }

    const newChat = {
      id: Date.now(),
      appId: -1,
      title: '新对话',
      topFlag: 0,
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      kbId: null,
      answerList: []
    }
    setConversations(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    setMessages([])
  }

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId)
    loadChatDetail(chatId)
  }

  const handleDeleteChat = async (chatId) => {
    try {
      setConversations(prev => prev.filter(c => c.id !== chatId))
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('删除对话失败:', error)
    }
  }

  // 处理消息流响应
  const handleStreamMessage = (event, streamResponse, setStreamResponse) => {
    try {
      const data = JSON.parse(event.data)
      if (data.text) {
        setStreamResponse(streamResponse + data.text)
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = streamResponse + data.text
            // 确保answerList存在并包含当前回答
            if (!lastMessage.answerList) {
              lastMessage.answerList = [{
                content: streamResponse + data.text
              }]
            } else {
              lastMessage.answerList[0].content = streamResponse + data.text
            }
          } else {
            newMessages.push({
              role: 'assistant',
              content: streamResponse + data.text,
              answerList: [{
                content: streamResponse + data.text
              }]
            })
          }
          return newMessages
        })
      }
    } catch (error) {
      console.error('解析消息失败:', error)
    }
  }

  // 处理请求完成
  const handleRequestClose = (message) => {
    setIsLoading(false)
    // 更新会话标题
    if (currentChatId) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentChatId) {
          return {
            ...conv,
            title: message.slice(0, 20) + (message.length > 20 ? '...' : ''),
            updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }
        }
        return conv
      }))
    }
  }

  // 处理请求错误
  const handleRequestError = (error) => {
    console.error('发送消息失败:', error)
    const errorMessage = '抱歉，发生了一些错误。请检查网络连接或稍后重试。'
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: errorMessage,
      answerList: [{
        content: errorMessage
      }]
    }])
    setIsLoading(false)
  }

  const handleFileSelect = async (files, type) => {
    setSelectedFiles(files)
    // 将文件转换为消息格式并发送
    // files.forEach(async file => {
      try {
        // 上传文件
        const formData = new FormData()
        formData.append('file', files)
        formData.append('type', type)  // 添加文件类型
        
        const response = await chatFileUpload(formData)
        
        if (response?.code === 200 && response?.success && response?.data?.url) {
          const fileMessage = {
            fileName: response.data.fileName,
            messageType: "FILE",
            type: type,  // 'DOC' 或 'VIDEO'
            url: response.data.url
          }
          handleSendMessage(JSON.stringify(fileMessage))
        } else {
          throw new Error('文件上传失败')
        }
      } catch (error) {
        console.error('文件上传失败:', error)
        // 显示错误消息
        const errorMessage = {
          role: 'assistant',
          content: '文件上传失败，请重试',
          answerList: [{
            content: '文件上传失败，请重试'
          }]
        }
        setMessages(prev => [...prev, errorMessage])
      }
    // })
  }

  const handleStopGenerate = async () => {
    if (abortController.current) {
      abortController.current.abort()
      
      // 调用中断接口
      if (currentChatId) {
        try {
          await interruptChatSession(currentChatId)
        } catch (error) {
          console.error('停止回答失败:', error)
        }
      }
      
      setIsLoading(false)
      setIsReceiving(false)
    }
  }

  const handleRegenerate = async () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
    if (lastUserMessage) {
      await handleSendMessage(lastUserMessage.content, true)  // 传入true表示这是重新回答
    }
  }

  const handleSendMessage = async (message, selectedFiles = []) => {
    if (isLoading || isReceiving) return
    setIsLoading(true)
    setIsReceiving(true)

    try {
      let chatId = currentChatId
      let kbId = null
      let dataSetIds = []

      // 如果是新对话的第一条消息，先创建会话
      if (!currentChatId || conversations.find(c => c.id === currentChatId)?.title === '新对话') {
        const createResponse = await createChatSession({
          appId: -1,
          title: message || '新对话'
        })
        
        if (createResponse?.code === 200 && createResponse?.success && createResponse?.data?.id) {
          chatId = createResponse.data.id
          // 更新conversations中的对话信息
          setConversations(prev => prev.map(conv => {
            if (conv.id === currentChatId) {
              return {
                ...conv,
                id: chatId,
                title: message.slice(0, 20) + (message.length > 20 ? '...' : '') || '新对话',
                updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
              }
            }
            return conv
          }))
          setCurrentChatId(chatId)
        } else {
          throw new Error('创建对话失败')
        }
      }

      // 添加用户消息到消息列表
      const newUserMessage = {
        role: 'user',
        content: message
      }
      setMessages(prev => [...prev, newUserMessage])

      // 如果是文件消息，不需要调用 AI 接口
      try {
        const fileData = JSON.parse(message)
        if (fileData.messageType === 'FILE') {
          setIsLoading(false)
          setIsReceiving(false)
          return
        }
      } catch (e) {
        // 不是 JSON 格式，继续处理普通消息
      }

      // 创建新的 AbortController
      abortController.current = new AbortController()

      // 发送消息
      let streamResponse = ''
      const params = {
        chatId,
        content: message,
        modelCode: "deepseek_r1_14b",
        chatType: "NEW_CHAT",
        kbId,
        dataSetIds
      }
      const formData = new FormData()
      formData.append('request', JSON.stringify(params))
      await getChatResult(
        formData,
        (event) => handleStreamMessage(event, streamResponse, (newResponse) => {
          streamResponse = newResponse
        }),
        abortController.current,
        () => {
          handleRequestClose(message || '新对话')
          setIsReceiving(false)  // 接收完成
        },
        (error) => {
          handleRequestError(error)
          setIsReceiving(false)  // 接收出错
        }
      )
    } catch (error) {
      handleRequestError(error)
      setIsReceiving(false)  // 接收出错
    }
  }

  return (
    <AuthCheck>
      <div className="flex h-screen">
        <Sidebar
          conversations={conversations}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          loading={isLoadingHistory}
        />
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage 
                key={index}
                role={message.role}
                content={message.content}
                files={message.files}
                answerList={message.answerList || []}
                isGenerating={isLoading && index === messages.length - 1}
                onRegenerate={handleRegenerate}
                onStop={handleStopGenerate}
                showAnimation={isLoading && index === messages.length - 1}
              />
            ))}
          </div>
          
          {/* 固定的停止回答按钮区域 */}
          {isReceiving && (
            <div className="border-t bg-white px-4 py-2">
              <Button
                type="primary"
                danger
                icon={<StopOutlined />}
                onClick={handleStopGenerate}
                size="middle"
              >
                停止回答
              </Button>
            </div>
          )}
          
          <div className="p-4">
            <ChatInput 
              onSend={handleSendMessage}
              disabled={isLoading || isReceiving}
              currentChatId={currentChatId}
              kbId={null}
            />
          </div>
        </div>
      </div>
    </AuthCheck>
  )
} 