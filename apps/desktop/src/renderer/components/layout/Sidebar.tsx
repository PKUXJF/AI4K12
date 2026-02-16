'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/stores/chatStore';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import SettingsDialog from './SettingsDialog';
import { Settings, MessageSquarePlus, MessageCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const { conversations, loadConversations, deleteConversation } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleNewConversation = () => {
    navigate('/');
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
    if (location.pathname === `/chat/${id}`) {
      navigate('/');
    }
  };

  return (
    <>
      <div className="flex h-screen w-[260px] flex-col border-r border-border bg-card pt-12">
        {/* Action Buttons */}
        <div className="px-3 py-3 border-b border-border flex gap-2">
          <Button
            data-testid="sidebar-new-task-button"
            onClick={handleNewConversation}
            variant="default"
            size="sm"
            className="flex-1 justify-center gap-2"
            title="新建对话"
          >
            <MessageSquarePlus className="h-4 w-4" />
            新建对话
          </Button>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <AnimatePresence mode="wait">
              {conversations.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  还没有对话记录
                </motion.div>
              ) : (
                <motion.div
                  key="chat-list"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-1"
                >
                  {conversations.map((conv) => {
                    const isActive = location.pathname === `/chat/${conv.id}`;
                    return (
                      <motion.div
                        key={conv.id}
                        variants={staggerItem}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/chat/${conv.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/chat/${conv.id}`);
                          }
                        }}
                        title={conv.title}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200',
                          'text-foreground hover:bg-accent hover:text-accent-foreground',
                          'flex items-center gap-2 group relative cursor-pointer',
                          isActive && 'bg-accent text-accent-foreground'
                        )}
                      >
                        <MessageCircle className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="block truncate flex-1">{conv.title}</span>
                        <button
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          className={cn(
                            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                            'p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20',
                            'text-zinc-400 hover:text-red-600 dark:hover:text-red-400',
                            'shrink-0'
                          )}
                          aria-label="删除对话"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Bottom Section - Logo and Settings */}
        <div className="px-3 py-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-semibold text-foreground" style={{ paddingLeft: '6px' }}>AI4Edu</span>
          </div>
          <Button
            data-testid="sidebar-settings-button"
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            title="设置"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}
