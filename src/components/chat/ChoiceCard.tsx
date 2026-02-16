// src/components/chat/ChoiceCard.tsx
import { useChatStore } from '../../stores/chat'
import type { ChoiceOption } from '../../types'
import { Pencil, Presentation, Edit, FileText, Calculator, type LucideIcon } from 'lucide-react'

interface ChoiceCardProps {
  choices: ChoiceOption[]
}

const iconMap: Record<string, LucideIcon> = {
  Pencil,
  Presentation,
  Edit,
  FileText,
  Calculator,
}

export function ChoiceCard({ choices }: ChoiceCardProps) {
  const { selectChoice } = useChatStore()

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {choices.map((choice) => {
        const IconComponent = choice.icon ? iconMap[choice.icon] : null
        
        return (
          <button
            key={choice.id}
            onClick={() => selectChoice(choice.id)}
            className="
              flex items-center gap-2 p-3
              bg-gray-50 dark:bg-gray-700/50
              hover:bg-primary-50 dark:hover:bg-primary-900/20
              border border-gray-200 dark:border-gray-600
              hover:border-primary-300 dark:hover:border-primary-700
              rounded-lg
              text-left
              transition-all duration-200
              group
            "
          >
            {IconComponent && (
              <IconComponent size={18} className="text-primary-500" />
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600">
                {choice.label}
              </div>
              {choice.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {choice.description}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
