'use client'

import { useState, useRef, useEffect } from 'react'
import { FileTextOutlined, VideoCameraOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { chatFileUpload } from '@/app/api/chat'

export default function ChatInput({ onSend, disabled, currentChatId, kbId }) {
  const [messageText, setMessageText] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])  // {file, type, status, response}
  const textareaRef = useRef(null)
  
  // 处理文本框高度自适应
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 4 * 24) // 24px 是单行高度
      textarea.style.height = `${newHeight}px`
    }
  }, [messageText])

  // 处理发送消息
  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((messageText.trim() || selectedFiles.length > 0) && !disabled) {
      // 只发送上传成功的文件
      const successFiles = selectedFiles.filter(f => f.status === 'success')
      
      // 如果有文件，先构造并显示文件消息
      if (successFiles.length > 0) {
        const fileMessage = {
          fileName: successFiles[0].file.name,
          messageType: "FILE",
          type: successFiles[0].type,
          url: successFiles[0].response.ossUri // 使用 ossUri 作为文件链接
        }
        
        // 发送消息，包含文件信息和文本
        onSend(JSON.stringify(fileMessage), [])
        
        // 如果有额外的文本消息，延迟一下再发送
        if (messageText.trim()) {
          setTimeout(() => {
            onSend(messageText, [])
          }, 100)
        }
      } else {
        // 没有文件，直接发送文本消息
        onSend(messageText, [])
      }

      // 清空输入
      setMessageText('')
      setSelectedFiles([])
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  // 上传文件
  const uploadFile = async (file, type) => {
    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('type', type)
      if (kbId) formData.append('kbId', kbId)

      const response = await chatFileUpload(formData)
      
      if (response?.code === 200 && response?.success && Array.isArray(response?.data)) {
        const fileData = response.data[0]
        if (!fileData.ossUri) {
          throw new Error('文件上传失败：未获取到文件链接')
        }
        setSelectedFiles([{ 
          file, 
          type, 
          status: 'success', 
          response: fileData
        }])
      } else {
        throw new Error('文件上传失败')
      }
    } catch (error) {
      console.error('文件上传失败:', error)
      message.error(error.message || '文件上传失败')
      setSelectedFiles([])
    }
  }

  // 处理文档文件选择
  const handleDocumentSelect = (e) => {
    const file = e.target.files[0] // 只获取第一个文件
    if (!file) return

    const type = file.type.toLowerCase()
    const isValid = type.includes('word') || 
                   type.includes('text') || 
                   type.includes('pdf') ||
                   type.includes('doc') ||
                   type.includes('docx')
    
    if (!isValid) {
      message.warning('只能选择文档类型的文件（Word、Text、PDF）')
      return
    }
    
    setSelectedFiles([{
      file,
      type: 'DOC',
      status: 'uploading',
      response: null
    }])
    // 立即开始上传
    uploadFile(file, 'DOC')
    e.target.value = ''
  }

  // 处理视频文件选择
  const handleVideoSelect = (e) => {
    const file = e.target.files[0] // 只获取第一个文件
    if (!file) return

    const type = file.type.toLowerCase()
    const isValid = type.includes('video/')
    
    if (!isValid) {
      message.warning('只能选择视频类型的文件')
      return
    }
    
    setSelectedFiles([{
      file,
      type: 'VIDEO',
      status: 'uploading',
      response: null
    }])
    // 立即开始上传
    uploadFile(file, 'VIDEO')
    e.target.value = ''
  }

  // 删除选中的文件
  const handleRemoveFile = () => {
    setSelectedFiles([])
  }

  // 获取文件状态图标
  const getFileStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <LoadingOutlined className="text-blue-500" />
      case 'error':
        return <DeleteOutlined className="text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* 已选择的文件列表 */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map((fileData, index) => (
            <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              {fileData.type === 'DOC' ? <FileTextOutlined /> : <VideoCameraOutlined />}
              <span className="text-sm text-gray-600">{fileData.file.name}</span>
              {/* {getFileStatusIcon(fileData.status)} */}
              <button
                onClick={handleRemoveFile}
                className="text-gray-500 hover:text-red-500 ml-1"
                disabled={fileData.status === 'uploading'}
              >
                <DeleteOutlined />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <div className="flex-1 flex items-end">
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder="输入消息... (Shift + Enter 换行，Enter 发送)"
            className="w-full p-2 border rounded-lg resize-none min-h-[24px] max-h-[96px] overflow-y-auto"
            disabled={disabled}
          />
        </div>
        
        <div className="flex gap-2 items-end">
          {/* 文档上传按钮 */}
          <label className={`cursor-pointer ${disabled || selectedFiles.length > 0 ? 'opacity-50' : ''}`}>
            <input
              type="file"
              accept=".doc,.docx,.txt,.pdf"
              onChange={handleDocumentSelect}
              className="hidden"
              disabled={disabled || selectedFiles.length > 0}
            />
            <div className={`p-2 rounded-lg border ${
              disabled || selectedFiles.length > 0 ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}>
              <FileTextOutlined className="text-xl" />
            </div>
          </label>
          
          {/* 视频上传按钮 */}
          <label className={`cursor-pointer ${disabled || selectedFiles.length > 0 ? 'opacity-50' : ''}`}>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
              disabled={disabled || selectedFiles.length > 0}
            />
            <div className={`p-2 rounded-lg border ${
              disabled || selectedFiles.length > 0 ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}>
              <VideoCameraOutlined className="text-xl" />
            </div>
          </label>

          {/* 发送按钮 */}
          <button
            onClick={handleSubmit}
            disabled={disabled || (!messageText.trim() && !selectedFiles.some(f => f.status === 'success'))}
            className={`px-4 py-2 rounded-lg ${
              disabled || (!messageText.trim() && !selectedFiles.some(f => f.status === 'success'))
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
} 