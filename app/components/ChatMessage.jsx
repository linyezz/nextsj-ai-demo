'use client'

import { useState, useEffect } from 'react'
import { Button, Avatar, Card, Space, Typography, Skeleton } from 'antd'
import { RedoOutlined, StopOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons'
import MessageContent from './MessageContent'
import UserMessage from './UserMessage'
import { useHasMounted } from '@/app/hooks/useHasMounted'

const { Text } = Typography

export default function ChatMessage({ 
  role, 
  content,
  onRegenerate,
  onStop,
  isGenerating = false,
  showAnimation = true
}) {
  const hasMounted = useHasMounted()

  if (!hasMounted) {
    return (
      <div className="mb-4 px-4">
        <Skeleton active avatar paragraph={{ rows: 2 }} />
      </div>
    )
  }

  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
      <Space align="start" className={`max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar 
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          className={isUser ? 'bg-blue-500' : 'bg-green-500'}
        />
        
        <div className="flex-1">
          <Card 
            className={`${isUser ? 'bg-blue-50' : 'bg-gray-50'} border-0`}
            bodyStyle={{ padding: '12px 16px' }}
          >
            {isUser ? (
              <UserMessage content={content} />
            ) : (
              <MessageContent content={content} />
            )}
          </Card>
          
          {!isUser && (
            <Space className="mt-2">
              {isGenerating ? (
                <Button
                  type="text"
                  icon={<StopOutlined />}
                  onClick={onStop}
                  size="small"
                  danger
                >
                  停止回复
                </Button>
              ) : (
                <Button
                  type="text"
                  icon={<RedoOutlined />}
                  onClick={onRegenerate}
                  size="small"
                >
                  重新回复
                </Button>
              )}
            </Space>
          )}
        </div>
      </Space>
    </div>
  )
} 