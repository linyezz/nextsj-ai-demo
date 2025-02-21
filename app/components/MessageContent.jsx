'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { Typography, Table, Collapse, theme, Button, Space } from 'antd'
import { 
  BulbOutlined, 
  CopyOutlined,
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
import { useHasMounted } from '@/app/hooks/useHasMounted'
import 'highlight.js/styles/github-dark.css'

const { Text, Link } = Typography
const { Panel } = Collapse

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
  // 如果不是字符串类型，直接返回 null
  if (typeof content !== 'string') {
    console.log('Content is not string:', content);
    return null;
  }

  try {
    // 尝试判断是否是 JSON 字符串
    if (!content.trim().startsWith('{')) {
      return null;
    }

    const fileData = JSON.parse(content);
    console.log('Parsed file data:', fileData);

    // 严格判断是否为文件消息
    if (fileData && 
        typeof fileData === 'object' && 
        fileData.messageType === 'FILE' && 
        typeof fileData.fileName === 'string' && 
        typeof fileData.url === 'string') {
      
      console.log('Valid file message detected:', {
        fileName: fileData.fileName,
        url: fileData.url,
        type: fileData.messageType
      });

      return (
        <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors w-fit">
          <div className="text-blue-500">
            {getFileIcon(fileData.fileName)}
          </div>
          <Link href={fileData.url} target="_blank" className="hover:text-blue-500 transition-colors">
            {fileData.fileName}
          </Link>
        </div>
      );
    }

    console.log('Not a valid file message:', fileData);
    return null;
  } catch (e) {
    console.log('Failed to parse content as JSON:', e.message);
    return null;
  }
};

// Markdown 组件配置
const markdownComponents = {
  // 代码块
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const codeContent = String(children).replace(/\n$/, '')
    
    if (!inline && match) {
      return (
        <div className="relative rounded-md overflow-hidden group">
          <div className="absolute right-0 top-0 flex items-center space-x-2 p-2 text-xs bg-gray-800/50">
            <span className="text-gray-300">{match[1]}</span>
            <button
              onClick={() => navigator.clipboard.writeText(codeContent)}
              className="text-gray-300 hover:text-white transition-colors"
              title="复制代码"
            >
              <CopyOutlined />
            </button>
          </div>
          <pre className={`${className} !my-0 !bg-gray-900 p-4`} {...props}>
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      )
    }
    return (
      <Text code {...props}>
        {children}
      </Text>
    )
  },
  // 表格
  table({ children }) {
    return (
      <div className="my-4 overflow-x-auto">
        <Table
          size="small"
          pagination={false}
          bordered
          components={{
            table: ({ children, ...props }) => (
              <table {...props}>{children}</table>
            ),
          }}
        >
          {children}
        </Table>
      </div>
    )
  },
  // 链接
  a({ node, children, href, ...props }) {
    return (
      <Link href={href} target="_blank" {...props}>
        {children}
      </Link>
    )
  },
  // 列表项
  li({ children, className, ...props }) {
    if (className === 'task-list-item') {
      return (
        <li className="flex items-start my-1" {...props}>
          <input 
            type="checkbox" 
            className="mt-1.5 mr-2" 
            disabled 
          />
          <span>{children}</span>
        </li>
      )
    }
    return <li className="my-1" {...props}>{children}</li>
  },
  // 段落
  p({ children }) {
    return <p className="my-2 leading-relaxed">{children}</p>
  },
  // 标题
  h1: ({ children }) => <h1 className="text-2xl font-bold my-4">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-bold my-3">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-bold my-3">{children}</h3>,
  h4: ({ children }) => <h4 className="text-base font-bold my-2">{children}</h4>,
  h5: ({ children }) => <h5 className="text-sm font-bold my-2">{children}</h5>,
  h6: ({ children }) => <h6 className="text-sm font-bold my-2">{children}</h6>,
  // 引用块
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-200 pl-4 my-4 text-gray-700">
      {children}
    </blockquote>
  ),
  // 强调
  em: ({ children }) => <em className="italic">{children}</em>,
  // 加粗
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  // 水平线
  hr: () => <hr className="my-4 border-gray-200" />,
  // 图片
  img: ({ src, alt, ...props }) => (
    <img 
      src={src} 
      alt={alt} 
      className="max-w-full h-auto rounded-lg my-4" 
      {...props}
    />
  )
}

export default function MessageContent({ content, showAnimation = false }) {
  const hasMounted = useHasMounted()
  const { token } = theme.useToken()
  const [isThinking, setIsThinking] = useState(false)
  const [currentThinkContent, setCurrentThinkContent] = useState('')
  const [processedContent, setProcessedContent] = useState({ mainContent: '', thinkContent: '' })

  // 在组件挂载时动态添加 KaTeX 样式
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
    link.integrity = 'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  // 处理内容变化
  useEffect(() => {
    if (typeof content !== 'string') {
      setProcessedContent({ mainContent: '', thinkContent: '' })
      return
    }

    // 如果正在动画显示中，检查是否遇到 think 标签
    if (showAnimation) {
      const thinkStartMatch = content.match(/<think>/)
      const thinkEndMatch = content.match(/<\/think>/)
      
      if (thinkStartMatch && !thinkEndMatch) {
        setIsThinking(true)
        // 提取到目前为止的思考内容，只取 <think> 标签后的部分
        const beforeThink = content.slice(0, thinkStartMatch.index)
        const thinkContent = content.slice(thinkStartMatch.index + 7)
        setCurrentThinkContent(thinkContent)
        setProcessedContent({ 
          mainContent: beforeThink, 
          thinkContent: thinkContent
        })
        return
      } 
      
      if (thinkEndMatch) {
        // 找到最后一个 <think> 标签的位置
        const lastThinkStart = content.lastIndexOf('<think>')
        // 提取思考内容
        const thinkContent = content.slice(lastThinkStart + 7, thinkEndMatch.index)
        // 提取主要内容（think标签之前和之后的内容）
        const beforeThink = content.slice(0, lastThinkStart)
        const afterThink = content.slice(thinkEndMatch.index + 8)
        
        setIsThinking(false)
        setProcessedContent({ 
          mainContent: beforeThink + afterThink,
          thinkContent: thinkContent
        })
        return
      }

      // 如果没有 think 标签，所有内容都是主要内容
      setProcessedContent({
        mainContent: content,
        thinkContent: ''
      })
      return
    }

    // 非动画显示时的正常处理
    const thinkMatch = content.match(/<think>(.*?)<\/think>/s)
    if (!thinkMatch) {
      setProcessedContent({ mainContent: content, thinkContent: '' })
      return
    }

    const beforeThink = content.slice(0, content.indexOf('<think>'))
    const thinkContent = thinkMatch[1]
    const afterThink = content.slice(content.indexOf('</think>') + 8)
    const mainContent = beforeThink + afterThink
    setProcessedContent({ mainContent, thinkContent })
  }, [content, showAnimation, isThinking])

  return (
    <div>
      {(processedContent.thinkContent || isThinking) && (
        <Collapse
          className="mb-2"
          size="small"
          defaultActiveKey={['1']}
          items={[
            {
              key: '1',
              label: (
                <Space className="text-gray-500 text-xs">
                  <BulbOutlined className={isThinking ? 'animate-pulse' : ''} />
                  <span>{isThinking ? '正在深度思考...' : '思考过程'}</span>
                </Space>
              ),
              children: (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
                    components={{
                      ...markdownComponents,
                      p: ({ children }) => (
                        <p className="my-1 leading-relaxed text-gray-500 text-xs">{children}</p>
                      ),
                      li: ({ children, className, ...props }) => {
                        if (className === 'task-list-item') {
                          return (
                            <li className="flex items-start my-1 text-gray-500 text-xs" {...props}>
                              <input 
                                type="checkbox" 
                                className="mt-1 mr-2" 
                                disabled 
                              />
                              <span>{children}</span>
                            </li>
                          )
                        }
                        return <li className="my-1 text-gray-500 text-xs" {...props}>{children}</li>
                      },
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-200 pl-4 my-2 text-gray-500 text-xs">
                          {children}
                        </blockquote>
                      )
                    }}
                  >
                    {processedContent.thinkContent}
                  </ReactMarkdown>
                </div>
              )
            }
          ]}
        />
      )}
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
        components={markdownComponents}
      >
        {processedContent.mainContent}
      </ReactMarkdown>
    </div>
  )
} 