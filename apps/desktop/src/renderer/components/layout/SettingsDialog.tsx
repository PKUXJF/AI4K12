'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TeacherProfilePanel } from '@/components/settings/TeacherProfilePanel';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySaved?: () => void;
  initialTab?: 'teacher' | 'appearance' | 'about';
}

export default function SettingsDialog({
  open,
  onOpenChange,
  onApiKeySaved,
  initialTab = 'teacher',
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<'teacher' | 'appearance' | 'about'>(initialTab);
  const [theme, setThemeState] = useState<string>(() => {
    try {
      return localStorage.getItem('ai4edu_theme') || 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  const handleThemeChange = useCallback((value: string) => {
    setThemeState(value);
    localStorage.setItem('ai4edu_theme', value);
    const root = document.documentElement;
    if (value === 'dark' || (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const handleDone = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="settings-dialog"
        onOpenAutoFocus={(e: React.FocusEvent) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>AI4Edu 设置</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex items-end justify-between border-b border-border">
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setActiveTab('teacher')}
                className={`pb-3 px-1 font-medium text-sm transition-colors ${
                  activeTab === 'teacher'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                教师配置
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`pb-3 px-1 font-medium text-sm transition-colors ${
                  activeTab === 'appearance'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                外观
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-3 px-1 font-medium text-sm transition-colors ${
                  activeTab === 'about'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                关于
              </button>
            </div>
          </div>

          {activeTab === 'teacher' && (
            <div className="space-y-6">
              <TeacherProfilePanel onSaved={onApiKeySaved} />
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="font-medium text-foreground">主题</div>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  选择应用外观。选择"跟随系统"将自动匹配您的操作系统设置。
                </p>
                <div
                  className="mt-4 flex rounded-lg border border-border bg-muted p-1"
                  role="radiogroup"
                  aria-label="Theme preference"
                >
                  {([
                    { value: 'system', label: '跟随系统' },
                    { value: 'light', label: '浅色' },
                    { value: 'dark', label: '深色' },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      role="radio"
                      aria-checked={theme === option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        theme === option.value
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-lg font-semibold text-foreground">AI4Edu 智能教学助手</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      基于AI的教学辅助工具，帮助教师高效完成出题、备课、分析等教学任务
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">版本</div>
                    <div className="font-medium">1.0.0</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleDone}
              className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              data-testid="settings-done-button"
            >
              完成
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
