import { useEffect, useState } from 'react'
import { ChatContainer } from './components/chat/ChatContainer'
import { Sidebar } from './components/sidebar/Sidebar'
import { Header } from './components/layout/Header'
import { TeacherOnboarding } from './components/settings/TeacherOnboarding'
import { hasTeacherProfile } from './services/teacherProfile'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    setShowOnboarding(!hasTeacherProfile())
  }, [])

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* 左侧边栏 */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 overflow-hidden">
          <ChatContainer />
        </main>
      </div>

      {showOnboarding && (
        <TeacherOnboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  )
}

export default App
