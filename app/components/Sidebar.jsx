'use client'

import { Button, List, Typography, Space, Tooltip, Empty } from 'antd'
import { PlusOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons'
import { useState } from 'react'

const { Text } = Typography

export default function Sidebar({ 
  conversations = [], 
  onNewChat, 
  onSelectChat, 
  onDeleteChat,
  currentChatId,
  loading = false
}) {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <div className="w-72 h-screen bg-white border-r flex flex-col">
      <div className="px-6 py-4 border-b bg-gray-50/50">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onNewChat}
          block
          size="large"
          className="hover:scale-[1.02] transition-transform"
        >
          新建对话
        </Button>
      </div>
      
      <List
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
        dataSource={conversations || []}
        loading={loading}
        locale={{
          emptyText: (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="暂无对话"
              className="mt-20"
            />
          )
        }}
        renderItem={(chat) => (
          <List.Item
            key={chat.id}
            className={`cursor-pointer transition-all duration-200 border-0 hover:bg-gray-50 group
              ${currentChatId === chat.id ? 'bg-blue-50 hover:bg-blue-50' : ''}
            `}
            onClick={() => onSelectChat(chat.id)}
            onMouseEnter={() => setHoveredId(chat.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex items-start px-6 py-2 w-full">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0
                ${currentChatId === chat.id ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}
              `}>
                <MessageOutlined className={`text-base
                  ${currentChatId === chat.id ? 'text-blue-500' : 'text-gray-500'}
                `}/>
              </div>
              
              <div className="flex-1 min-w-0 ml-3">
                <div className="flex items-center justify-between">
                  <Text ellipsis className="max-w-[180px]">
                    {chat.title || '新对话'}
                  </Text>
                  {hoveredId === chat.id && (
                    <Tooltip title="删除对话" placement="right">
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteChat(chat.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-1"
                        danger
                      />
                    </Tooltip>
                  )}
                </div>
                <Text type="secondary" className="text-xs block">
                  {chat.updateTime ? new Date(chat.updateTime).toLocaleString('zh-CN', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                  }) : ''}
                </Text>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  )
} 