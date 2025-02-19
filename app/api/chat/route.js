import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { message, files } = body

    // 这里是模拟AI响应的逻辑
    // TODO: 替换为实际的AI服务调用
    const mockResponse = {
      message: `这是对"${message}"的模拟回复。\n\n1. 我收到了你的消息\n2. 消息长度是: ${message.length}个字符\n3. ${files?.length ? `收到了${files.length}个文件` : '没有收到文件'}`
    }

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error('处理聊天请求时出错:', error)
    return NextResponse.json(
      { error: '处理请求时发生错误' },
      { status: 500 }
    )
  }
} 