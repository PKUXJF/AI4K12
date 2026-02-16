'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TaskInputBar from '../components/landing/TaskInputBar';
import SettingsDialog from '../components/layout/SettingsDialog';
import InitializationOverlay from '../components/onboarding/InitializationOverlay';
import { springs, staggerContainer, staggerItem } from '../lib/animations';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { getSiliconFlowConfig } from '@/services/siliconflow';
import { useChatStore } from '@/stores/chatStore';

// Education-focused use case examples — short/ambiguous to trigger AI clarification
const EDU_USE_CASES = [
  {
    icon: '📝',
    title: '出题组卷',
    description: '智能出题，AI会先了解您的需求',
    prompt: '我想出一套练习题',
  },
  {
    icon: '📊',
    title: '课件大纲',
    description: '生成PPT大纲，AI会确认细节',
    prompt: '帮我做一个课件大纲',
  },
  {
    icon: '🔍',
    title: '试卷分析',
    description: '分析成绩，找出薄弱环节',
    prompt: '帮我分析一下最近的考试成绩',
  },
  {
    icon: '📋',
    title: '教案设计',
    description: '生成教学设计方案',
    prompt: '我需要写一份教案',
  },
  {
    icon: '✍️',
    title: '作业布置',
    description: '分层布置课后练习',
    prompt: '帮我布置一下课后作业',
  },
  {
    icon: '💡',
    title: '解题指导',
    description: '分析解题思路和方法',
    prompt: '有道题想请教一下解法',
  },
];

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [showExamples, setShowExamples] = useState(true);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'teacher' | 'appearance' | 'about'>('teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetOverlay, setShowResetOverlay] = useState(false);
  const { createConversation } = useChatStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    // Check if SiliconFlow API is configured (from localStorage)
    const config = getSiliconFlowConfig();
    if (!config || !config.apiKey) {
      // No API key — open teacher settings to configure
      setSettingsInitialTab('teacher');
      setShowSettingsDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      // Create a new conversation and navigate to chat page
      const chatId = createConversation(prompt.trim());
      // Store the initial prompt for the chat page to pick up
      sessionStorage.setItem(`pending_prompt_${chatId}`, prompt.trim());
      navigate(`/chat/${chatId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsDialogChange = (open: boolean) => {
    setShowSettingsDialog(open);
    if (!open) {
      setSettingsInitialTab('teacher');
    }
  };

  const handleApiKeySaved = async () => {
    setShowSettingsDialog(false);
    // After configuring API, try submitting if user had typed something
    if (prompt.trim()) {
      const config = getSiliconFlowConfig();
      if (config?.apiKey) {
        const chatId = createConversation(prompt.trim());
        sessionStorage.setItem(`pending_prompt_${chatId}`, prompt.trim());
        navigate(`/chat/${chatId}`);
      }
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <>
      {showResetOverlay && (
        <InitializationOverlay
          isReset
          onComplete={() => {
            setShowResetOverlay(false);
            window.location.reload();
          }}
        />
      )}
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={handleSettingsDialogChange}
        onApiKeySaved={handleApiKeySaved}
        initialTab={settingsInitialTab}
        onResetSystem={() => setShowResetOverlay(true)}
      />
      <div
        className="h-full flex items-center justify-center p-6 overflow-y-auto bg-accent"
      >
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        {/* Main Title */}
        <motion.div
          data-testid="home-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.gentle}
          className="text-center"
        >
          <h1 className="text-4xl font-light tracking-tight text-foreground">
            AI4Edu 智能教学助手
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            告诉我您的教学需求，我会先了解具体情况再为您服务
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.gentle, delay: 0.1 }}
          className="w-full"
        >
          <Card className="w-full bg-card/95 backdrop-blur-md shadow-xl gap-0 py-0 flex flex-col max-h-[calc(100vh-3rem)]">
            <CardContent className="p-6 pb-4 flex-shrink-0">
              {/* Input Section */}
              <TaskInputBar
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                placeholder="描述您的教学需求，例如：帮我出一套练习题..."
                large={true}
                autoFocus={true}
                onOpenSettings={() => setShowSettingsDialog(true)}
              />
            </CardContent>

            {/* Examples Toggle */}
            <div className="border-t border-border">
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="w-full px-6 py-3 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
              >
                <span>常用教学场景</span>
                <motion.div
                  animate={{ rotate: showExamples ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showExamples && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-6 pt-1 pb-4 overflow-y-auto max-h-[360px]"
                      style={{
                        background: 'linear-gradient(to bottom, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)',
                        backgroundAttachment: 'fixed',
                      }}
                    >
                      <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="grid grid-cols-3 gap-3"
                      >
                        {EDU_USE_CASES.map((example, index) => (
                          <motion.button
                            key={index}
                            data-testid={`home-example-${index}`}
                            variants={staggerItem}
                            transition={springs.gentle}
                            whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleExampleClick(example.prompt)}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-card hover:border-ring hover:bg-muted/50"
                          >
                            <span className="text-2xl">{example.icon}</span>
                            <div className="flex flex-col items-center gap-1 w-full">
                              <div className="font-medium text-xs text-foreground text-center">
                                {example.title}
                              </div>
                              <div className="text-xs text-muted-foreground text-center line-clamp-2">
                                {example.description}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
    </>
  );
}
