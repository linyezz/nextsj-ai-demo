'use client'

import { useState, useRef, useEffect } from 'react'
import ChatInput from '@/app/components/ChatInput'
import ChatMessage from '@/app/components/ChatMessage'
import FileUpload from '@/app/components/FileUpload'
import Sidebar from '@/app/components/Sidebar'
import AuthCheck from '@/app/components/AuthCheck'
import {getChatHistory,getChatDetail} from '@/app/api/chat/index.js'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
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
        console.log('formatted messages:', formattedMessages);
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

  const handleSendMessage = async (message, isRegenerate = false) => {
    if (isLoading) return
    setIsLoading(true)
    
    if (isRegenerate) {
      setMessages(prev => prev.slice(0, -1))
    }

    const newUserMessage = {
      role: 'user',
      content: message
    }

    if (!isRegenerate) {
      setMessages(prev => [...prev, newUserMessage])
    }

    try {
      const response = await chatService.sendMessage({
        chatId: currentChatId,
        message,
        files: selectedFiles
      })

      if (response.code === 200 && response.success && response.data) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.content || ''
        }

        const newMessages = isRegenerate 
          ? [...messages.slice(0, -1), aiMessage]
          : [...messages, newUserMessage, aiMessage]
        
        setMessages(newMessages)

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
      } else {
        console.error('发送消息失败:', response.msg)
        throw new Error(response.msg)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage = {
        role: 'assistant',
        content: '抱歉，发生了一些错误。请检查网络连接或稍后重试。'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStopGenerate = () => {
    if (abortController.current) {
      abortController.current.abort()
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
    if (lastUserMessage) {
      await handleSendMessage(lastUserMessage.content, true)
    }
  }

  const handleFileSelect = (files) => {
    setSelectedFiles(files)
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
                isGenerating={isLoading && index === messages.length - 1}
                onRegenerate={handleRegenerate}
                onStop={handleStopGenerate}
                showAnimation={isLoading && index === messages.length - 1}
              />
            ))}
          </div>
          
          <div className="border-t p-4">
            <FileUpload onFileSelect={handleFileSelect} />
            <ChatInput 
              onSend={handleSendMessage}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </AuthCheck>
  )
} 