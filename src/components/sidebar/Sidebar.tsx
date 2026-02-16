import { useState } from 'react'
import { useChatStore } from '../../stores/chat'
import { MessageSquare, Plus, Trash2, Settings, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { conversations, currentConversationId, loadConversation, createConversation, deleteConversation } = useChatStore()
  const [activeTab, setActiveTab] = useState<'chats' | 'quick'>('quick')

  return (
    <>
      {/* 侧边栏 */}
      <aside
        className={`
          ${isOpen ? 'w-72' : 'w-0'}
          transition-all duration-300 ease-in-out
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          flex flex-col
          overflow-hidden
        `}
      >
        {/* 顶部 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                AI4Edu
              </span>
            </div>
          </div>

          {/* 新建对话按钮 */}
          <button
            onClick={() => createConversation()}
            className="
              w-full flex items-center justify-center gap-2
              py-2 px-4
              bg-primary-500 hover:bg-primary-600
              text-white rounded-lg
              transition-colors
            "
          >
            <Plus size={18} />
            <span>新建对话</span>
          </button>
        </div>

        {/* 标签切换 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('quick')}
            className={`
              flex-1 py-2 text-sm font-medium
              ${activeTab === 'quick'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            快捷操作
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`
              flex-1 py-2 text-sm font-medium
              ${activeTab === 'chats'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            历史记录
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'quick' ? (
            <QuickActions />
          ) : (
            <ConversationList
              conversations={conversations}
              currentId={currentConversationId}
              onSelect={loadConversation}
              onDelete={deleteConversation}
            />
          )}
        </div>

        {/* 底部 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900">
            <Settings size={18} />
            <span>设置</span>
          </button>
        </div>
      </aside>

      {/* 展开/收起按钮 */}
      <button
        onClick={onToggle}
        className={`
          fixed left-${isOpen ? '72' : '0'} top-1/2 -translate-y-1/2 z-50
          p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          rounded-r-lg shadow-md
          transition-all duration-300
        `}
        style={{ left: isOpen ? '288px' : '0' }}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </>
  )
}

// 快捷操作组件
function QuickActions() {
  const actions = [
    { icon: 'Calculator', label: '智能出题', desc: '函数、几何、导数...' },
    { icon: 'Presentation', label: '试卷讲评', desc: '错题分析PPT' },
    { icon: 'Edit', label: '改编题目', desc: '提升或降低难度' },
    { icon: 'FileText', label: '生成教案', desc: '教学设计辅助' },
  ]

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        高中数学
      </h3>
      {actions.map((action) => (
        <button
          key={action.label}
          className="
            w-full flex items-start gap-3 p-3
            rounded-lg
            hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors
            text-left
          "
        >
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 text-sm">{action.icon[0]}</span>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white text-sm">
              {action.label}
            </div>
            <div className="text-xs text-gray-500">
              {action.desc}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// 对话列表组件
interface ConversationListProps {
  conversations: Array<{ id: string; title: string; updatedAt: string }>
  currentId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function ConversationList({ conversations, currentId, onSelect, onDelete }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">暂无历史记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={`
            group flex items-center gap-2 p-2 rounded-lg cursor-pointer
            ${currentId === conv.id
              ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }
          `}
        >
          <button
            onClick={() => onSelect(conv.id)}
            className="flex-1 flex items-center gap-2 text-left"
          >
            <MessageSquare size={16} className="text-gray-400" />
            <span className="truncate text-sm text-gray-700 dark:text-gray-300">
              {conv.title}
            </span>
          </button>
          <button
            onClick={() => onDelete(conv.id)}
            className="
              opacity-0 group-hover:opacity-100
              p-1 text-gray-400 hover:text-red-500
              transition-opacity
            "
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
