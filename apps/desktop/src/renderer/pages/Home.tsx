'use client';

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TaskInputBar from '../components/landing/TaskInputBar';
import SettingsDialog from '../components/layout/SettingsDialog';
import { springs, staggerContainer, staggerItem } from '../lib/animations';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { getSiliconFlowConfig } from '@/services/siliconflow';
import { useChatStore } from '@/stores/chatStore';

// Education-focused use case examples (no images needed)
const EDU_USE_CASES = [
  {
    icon: '📝',
    title: '出题组卷',
    description: '根据知识点和难度，智能生成练习题',
    prompt: '请帮我生成5道高一数学函数性质的选择题，难度为中等，符合新高考要求，包含详细解答。',
  },
  {
    icon: '📊',
    title: '课件大纲',
    description: '自动生成教学PPT大纲和内容',
    prompt: '请帮我制作一份高一数学"三角函数"新授课的PPT大纲，45分钟课时，包含导入、讲解、练习和总结环节。',
  },
  {
    icon: '🔍',
    title: '试卷分析',
    description: '分析学生成绩，找出薄弱知识点',
    prompt: '请帮我分析本次月考数学成绩，班级平均分82分，最高98分最低43分。哪些知识点需要重点补习？给出教学建议。',
  },
  {
    icon: '📋',
    title: '教案设计',
    description: '生成完整的教学设计方案',
    prompt: '请帮我设计一份高二数学"数列求和"的教案，要求包含教学目标、重难点、教学过程和板书设计。',
  },
  {
    icon: '✍️',
    title: '作业布置',
    description: '分层布置课后练习',
    prompt: '请帮我布置课后作业，主题：二次函数。基础题3道、提高题2道、挑战题1道，适合高一学生。',
  },
  {
    icon: '💡',
    title: '解题指导',
    description: '分析解题思路，总结方法技巧',
    prompt: '请详细讲解这道高考真题的解题思路：已知函数f(x)=x³-3x+1，求函数在区间[-2,2]上的最大值和最小值。',
  },
];

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [showExamples, setShowExamples] = useState(true);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'providers' | 'voice' | 'skills' | 'connectors' | 'teacher'>('teacher');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleOpenSpeechSettings = useCallback(() => {
    setSettingsInitialTab('voice');
    setShowSettingsDialog(true);
  }, []);

  const handleOpenModelSettings = useCallback(() => {
    setSettingsInitialTab('teacher');
    setShowSettingsDialog(true);
  }, []);

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
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={handleSettingsDialogChange}
        onApiKeySaved={handleApiKeySaved}
        initialTab={settingsInitialTab}
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
            告诉我您的教学需求，让AI帮您完成
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
                placeholder="描述您的教学需求，例如：帮我出5道函数题..."
                large={true}
                autoFocus={true}
                onOpenSpeechSettings={handleOpenSpeechSettings}
                onOpenSettings={(tab) => {
                  setSettingsInitialTab(tab);
                  setShowSettingsDialog(true);
                }}
                onOpenModelSettings={handleOpenModelSettings}
                hideModelWhenNoModel={true}
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
