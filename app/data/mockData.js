export const mockConversations = [
  {
    id: '1',
    title: '关于React性能优化的讨论',
    messages: [
      {
        role: 'user',
        content: '你能告诉我一些React性能优化的方法吗？'
      },
      {
        role: 'assistant',
        content: '当然可以，以下是一些常见的React性能优化方法：\n\n1. 使用React.memo()进行组件记忆化\n2. 使用useMemo和useCallback hooks\n3. 虚拟列表优化长列表渲染\n4. 懒加载组件和路由\n5. 合理使用key属性\n\n你想了解哪个方面的具体实现？'
      },
      {
        role: 'user',
        content: '能详细说说React.memo()的使用吗？'
      },
      {
        role: 'assistant',
        content: 'React.memo()是一个高阶组件(HOC)，用于优化函数组件的性能。它的主要作用是：\n\n1. 对组件的props进行浅比较\n2. 如果props没有变化，则复用上次渲染的结果\n3. 避免不必要的重渲染\n\n示例代码：\n```jsx\nconst MyComponent = React.memo(function MyComponent(props) {\n  return <div>{props.name}</div>;\n});\n```\n\n你也可以自定义比较函数：\n```jsx\nfunction areEqual(prevProps, nextProps) {\n  return prevProps.id === nextProps.id;\n}\n\nconst MyComponent = React.memo(Component, areEqual);\n```'
      }
    ]
  },
  {
    id: '2',
    title: 'Next.js项目部署问题咨询',
    messages: [
      {
        role: 'user',
        content: '如何将Next.js项目部署到Vercel上？'
      },
      {
        role: 'assistant',
        content: '将Next.js项目部署到Vercel非常简单，以下是步骤：\n\n1. 确保你的项目在GitHub上\n2. 访问vercel.com并注册账号\n3. 点击"New Project"\n4. 选择你的GitHub仓库\n5. Vercel会自动识别Next.js项目并配置\n6. 点击"Deploy"即可\n\n部署完成后，Vercel会自动为你的项目提供一个域名，并且支持自动化部署。'
      }
    ]
  },
  {
    id: '3',
    title: 'TypeScript类型系统学习',
    messages: [
      {
        role: 'user',
        content: 'TypeScript中的泛型是什么？'
      },
      {
        role: 'assistant',
        content: '泛型是TypeScript中非常重要的特性，它允许你在定义函数、接口或类时，不预先指定具体的类型，而在使用时再指定类型的一种特性。\n\n示例：\n```typescript\n// 泛型函数\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\n// 泛型接口\ninterface GenericIdentityFn<T> {\n  (arg: T): T;\n}\n\n// 泛型类\nclass GenericNumber<T> {\n  zeroValue: T;\n  add: (x: T, y: T) => T;\n}\n```\n\n泛型的主要优势：\n1. 代码复用\n2. 类型安全\n3. 灵活性'
      },
      {
        role: 'user',
        content: '能举个泛型在React中使用的例子吗？'
      },
      {
        role: 'assistant',
        content: '当然可以，这是一个在React中使用泛型的常见例子：\n\n```typescript\ninterface Props<T> {\n  items: T[];\n  renderItem: (item: T) => React.ReactNode;\n}\n\nfunction List<T>({ items, renderItem }: Props<T>) {\n  return (\n    <ul>\n      {items.map((item, index) => (\n        <li key={index}>{renderItem(item)}</li>\n      ))}\n    </ul>\n  );\n}\n\n// 使用示例\ntype User = {\n  id: number;\n  name: string;\n};\n\n<List<User>\n  items={users}\n  renderItem={(user) => <span>{user.name}</span>}\n/>\n```\n\n这样的泛型组件可以处理任何类型的数据，同时保持类型安全。'
      }
    ]
  }
]; 