// src/components/layout/Header.tsx
import { useState } from 'react'
import { Menu, BookOpen, ChevronDown, Settings, X } from 'lucide-react'
import { APISettings } from '../settings/APISettings'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        {/* 左侧 */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* 学科选择器 */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <BookOpen size={18} className="text-primary-600" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900 dark:text-white">
                高中数学
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* 右侧 */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* 设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
            <APISettings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </>
  )
}
