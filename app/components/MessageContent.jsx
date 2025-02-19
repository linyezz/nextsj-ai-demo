'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { Typography, Table, Collapse, theme, Button } from 'antd'
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

export default function MessageContent({ content }) {
  const hasMounted = useHasMounted()
  const { token } = theme.useToken()

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

  // 处理可能包含 think 标签的内容
  const processContent = (content) => {
    // 尝试解析文件消息
    const fileMessageComponent = <FileMessage content={content} />;
    
    // 检查组件是否有效
    if (fileMessageComponent && fileMessageComponent.props?.children) {
      console.log('Rendering file message component');
      return fileMessageComponent;
    }

    console.log('Rendering as regular content');
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkMatch) {
      const thinkContent = thinkMatch[1];
      const remainingContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();
      
      return (
        <>
          <Collapse
            ghost
            className="mb-4 bg-yellow-50 rounded-lg"
            style={{
              background: token.colorWarningBg,
              border: `1px solid ${token.colorWarningBorder}`
            }}
          >
            <Panel 
              header={
                <div className="flex items-center text-yellow-800">
                  <BulbOutlined className="mr-2" />
                  <span>思考过程</span>
                </div>
              }
              key="1"
            >
              <div className="text-yellow-700">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
                  components={markdownComponents}
                >
                  {thinkContent}
                </ReactMarkdown>
              </div>
            </Panel>
          </Collapse>
          {remainingContent && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
              components={markdownComponents}
            >
              {remainingContent}
            </ReactMarkdown>
          )}
        </>
      );
    }
    
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    );
  };

  if (!hasMounted) {
    return <div className="min-h-[20px]" />
  }

  return (
    <div className="markdown-body prose prose-slate max-w-none dark:prose-invert">
      {processContent(content)}
    </div>
  )
} 