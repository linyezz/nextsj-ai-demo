'use client'

import { useState, useEffect } from 'react'
import { Button, Avatar, Card, Space, Typography, Skeleton } from 'antd'
import { 
  RedoOutlined, 
  StopOutlined, 
  UserOutlined, 
  RobotOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons'
import MessageContent from './MessageContent'
import UserMessage from './UserMessage'
import { useHasMounted } from '@/app/hooks/useHasMounted'

const { Text } = Typography

export default function ChatMessage({ 
  role, 
  content,
  answerList = [],
  onRegenerate,
  onStop,
  isGenerating = false,
  showAnimation = true
}) {
  const hasMounted = useHasMounted()
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0)
  
  const displayContent = answerList.length > 0 
    ? answerList[currentAnswerIndex]?.content || ''
    : content

  const handlePrevAnswer = () => {
    setCurrentAnswerIndex(prev => Math.max(0, prev - 1))
  }

  const handleNextAnswer = () => {
    setCurrentAnswerIndex(prev => Math.min(answerList.length - 1, prev + 1))
  }

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
              <MessageContent 
                content={displayContent} 
                showAnimation={showAnimation}
              />
            )}
            
            {!isUser && answerList.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-4 border-t pt-2">
                <Button 
                  type="text" 
                  icon={<LeftOutlined />} 
                  onClick={handlePrevAnswer}
                  disabled={currentAnswerIndex === 0}
                  size="small"
                />
                <Text type="secondary" className="select-none">
                  {currentAnswerIndex + 1} / {answerList.length}
                </Text>
                <Button 
                  type="text" 
                  icon={<RightOutlined />} 
                  onClick={handleNextAnswer}
                  disabled={currentAnswerIndex === answerList.length - 1}
                  size="small"
                />
              </div>
            )}
          </Card>
          
          {!isUser && (
            <Space className="mt-2">
              {!isGenerating && (
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