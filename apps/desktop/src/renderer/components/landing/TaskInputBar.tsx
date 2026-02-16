'use client';

import { useRef, useEffect } from 'react';
import { CornerDownLeft, Loader2, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  large?: boolean;
  autoFocus?: boolean;
  onOpenSettings?: () => void;
}

export default function TaskInputBar({
  value,
  onChange,
  onSubmit,
  placeholder = '描述您的教学需求...',
  isLoading = false,
  disabled = false,
  large = false,
  autoFocus = false,
  onOpenSettings,
}: TaskInputBarProps) {
  const isDisabled = disabled || isLoading;
  const canSubmit = !!value.trim() && !isDisabled;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ignore Enter during IME composition (Chinese/Japanese input)
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Input container */}
      <div className="rounded-xl border border-border bg-background shadow-sm transition-all duration-200 ease-accomplish focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
        {/* Textarea area */}
        <div className="px-4 pt-3 pb-2">
          <textarea
            data-testid="task-input-textarea"
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={large ? 3 : 1}
            className="w-full max-h-[160px] resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border/50">
          {/* Settings button on left */}
          {onOpenSettings && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="设置"
                  onClick={onOpenSettings}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>设置</TooltipContent>
            </Tooltip>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Submit button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-testid="task-input-submit"
                type="button"
                aria-label="发送"
                onClick={onSubmit}
                disabled={!canSubmit}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-200 ease-accomplish hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CornerDownLeft className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <span>{!value.trim() ? '请输入内容' : '发送'}</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
