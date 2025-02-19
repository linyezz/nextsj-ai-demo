'use client'

import React from 'react'
import { Typography } from 'antd'
import { 
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  AudioOutlined
} from '@ant-design/icons'

const { Link } = Typography

// 文件类型图标映射
const fileIconMap = {
  // 视频文件
  mp4: VideoCameraOutlined,
  avi: VideoCameraOutlined,
  mov: VideoCameraOutlined,
  wmv: VideoCameraOutlined,
  // 音频文件
  mp3: AudioOutlined,
  wav: AudioOutlined,
  // 文档文件
  pdf: FilePdfOutlined,
  doc: FileWordOutlined,
  docx: FileWordOutlined,
  xls: FileExcelOutlined,
  xlsx: FileExcelOutlined,
  ppt: FilePptOutlined,
  pptx: FilePptOutlined,
  // 图片文件
  jpg: FileImageOutlined,
  jpeg: FileImageOutlined,
  png: FileImageOutlined,
  gif: FileImageOutlined,
  // 压缩文件
  zip: FileZipOutlined,
  rar: FileZipOutlined,
  '7z': FileZipOutlined,
  // 文本文件
  txt: FileTextOutlined,
  // 默认文件图标
  default: FileOutlined
}

// 获取文件图标
const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  const IconComponent = fileIconMap[extension] || fileIconMap.default
  return <IconComponent className="text-lg" />
}

// 处理文件消息
const FileMessage = ({ content }) => {
  try {
    const fileData = JSON.parse(content)
    if (fileData && 
        typeof fileData === 'object' && 
        fileData.messageType === 'FILE' && 
        typeof fileData.fileName === 'string' && 
        typeof fileData.url === 'string') {
      
      return (
        <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors w-fit">
          <div className="text-blue-500">
            {getFileIcon(fileData.fileName)}
          </div>
          <Link href={fileData.url} target="_blank" className="hover:text-blue-500 transition-colors">
            {fileData.fileName}
          </Link>
        </div>
      )
    }
  } catch (e) {
    // 如果解析失败，说明不是文件消息
    return null
  }
  return null
}

export default function UserMessage({ content }) {
  // 尝试解析文件消息
  const fileMessage = <FileMessage content={content} />
  if (fileMessage?.props?.children) {
    return fileMessage
  }

  // 普通文本消息
  return (
    <div className="whitespace-pre-wrap break-words">
      {content}
    </div>
  )
} 