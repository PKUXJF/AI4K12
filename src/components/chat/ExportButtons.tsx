// src/components/chat/ExportButtons.tsx
import { FileText, Presentation } from 'lucide-react'
import { useState } from 'react'

interface ExportButtonsProps {
  content: string
  title?: string
}

export function ExportButtons({ content, title = '导出内容' }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportDOCX = async () => {
    setIsExporting(true)
    
    // 模拟导出过程
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 创建简单的 HTML 内容
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: "SimSun", "宋体", serif; font-size: 12pt; line-height: 1.5; }
          .title { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 20px; }
          .content { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="title">${title}</div>
        <div class="content">${content.replace(/\n/g, '<br/>')}</div>
      </body>
      </html>
    `
    
    // 创建 Blob 并下载
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setIsExporting(false)
  }

  const handleExportPPTX = async () => {
    alert('PPT 导出功能开发中，敬请期待！')
  }

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={handleExportDOCX}
        disabled={isExporting}
        className="
          flex items-center gap-1.5 px-3 py-1.5
          bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30
          text-blue-600 dark:text-blue-400
          rounded-md text-sm font-medium
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {isExporting ? (
          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <FileText size={14} />
        )}
        导出 Word
      </button>
      
      <button
        onClick={handleExportPPTX}
        className="
          flex items-center gap-1.5 px-3 py-1.5
          bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30
          text-orange-600 dark:text-orange-400
          rounded-md text-sm font-medium
          transition-colors
        "
      >
        <Presentation size={14} />
        导出 PPT
      </button>
    </div>
  )
}
