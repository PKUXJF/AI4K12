'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, GraduationCap, Zap, ChevronRight, Check, RotateCcw } from 'lucide-react';

/* ═══════════════════════════════════════════════════
   localStorage 键名 — 用到 ai4edu_* 的统一管理
   ═══════════════════════════════════════════════════ */
const STORAGE_KEYS = {
  conversations: 'ai4edu_conversations',
  apiKey: 'ai4edu_api_key',
  apiModel: 'ai4edu_api_model',
  teacherProfile: 'ai4edu_teacher_profile',
  theme: 'ai4edu_theme',
  initialized: 'ai4edu_initialized',
} as const;

const DEFAULT_API_KEY = 'sk-lqduodenmjylybzcjmquritedcnaojyjnbjmjatvtehqyuzo';
const DEFAULT_MODEL = 'Pro/moonshotai/Kimi-K2.5';

/* ─── 粒子系统 ──────────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Feature 卡片 ─────────────────────────────── */
const FEATURES = [
  {
    icon: GraduationCap,
    title: '智能教学',
    desc: '理解您的教学风格，提供个性化辅助',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Sparkles,
    title: '主动沟通',
    desc: 'AI会先了解需求细节，再精准执行',
    color: 'from-violet-500 to-purple-400',
  },
  {
    icon: Zap,
    title: '高效备课',
    desc: '出题、课件、教案一键生成',
    color: 'from-amber-500 to-orange-400',
  },
];

/* ═══════════════════════════════════════════════════
   初始化覆盖层
   ═══════════════════════════════════════════════════ */
interface InitializationOverlayProps {
  /** 仅用于设置里的"重置"场景，不显示跳过按钮 */
  isReset?: boolean;
  onComplete: () => void;
}

type Step = 'welcome' | 'features' | 'initializing' | 'done';

export default function InitializationOverlay({ isReset = false, onComplete }: InitializationOverlayProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [progress, setProgress] = useState(0);
  const [initMessages, setInitMessages] = useState<string[]>([]);

  /* 自动执行初始化序列 */
  const runInitialization = useCallback(() => {
    setStep('initializing');
    setProgress(0);
    setInitMessages([]);

    const steps = [
      { msg: '正在清除旧数据...', action: () => resetAllData() },
      { msg: '配置 AI 模型 (Kimi-K2.5)...' },
      { msg: '初始化 API 连接...' },
      { msg: '加载教学提示词模板...' },
      { msg: '准备交互规则...' },
      { msg: '系统就绪 ✓' },
    ];

    let i = 0;
    const tick = () => {
      if (i < steps.length) {
        const s = steps[i];
        setInitMessages((prev) => [...prev, s.msg]);
        setProgress(Math.round(((i + 1) / steps.length) * 100));
        s.action?.();
        i++;
        setTimeout(tick, 400 + Math.random() * 300);
      } else {
        // 标记为已初始化
        localStorage.setItem(STORAGE_KEYS.initialized, 'true');
        setTimeout(() => setStep('done'), 400);
      }
    };
    tick();
  }, []);

  /* 欢迎步骤 → features → 初始化 */
  const handleNext = () => {
    if (step === 'welcome') {
      setStep('features');
    } else if (step === 'features') {
      runInitialization();
    }
  };

  /* 跳过引导直接初始化 */
  const handleSkip = () => {
    runInitialization();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* 背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <Particles />

        {/* 顶部光条 */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* ─── Welcome Step ──── */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            className="relative z-10 flex flex-col items-center gap-8 px-8 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* 动态图标 */}
            <motion.div
              className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-2xl shadow-primary/10"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <GraduationCap className="h-14 w-14 text-primary" />
              </motion.div>
              {/* 光圈 */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-primary/20"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.div>

            <div>
              <motion.h1
                className="text-4xl font-bold tracking-tight text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {isReset ? '重新初始化' : '欢迎使用'}{' '}
                <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                  AI4Edu
                </span>
              </motion.h1>
              <motion.p
                className="mt-3 text-lg text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {isReset
                  ? '将清除所有数据并恢复默认设置'
                  : '智能教学助手，让备课更轻松'}
              </motion.p>
            </div>

            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <button
                onClick={handleNext}
                className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isReset ? '开始重置' : '开始体验'}
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </button>
              {!isReset && (
                <button
                  onClick={handleSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  跳过引导
                </button>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ─── Features Step ──── */}
        {step === 'features' && (
          <motion.div
            key="features"
            className="relative z-10 flex flex-col items-center gap-8 px-8"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <h2 className="text-2xl font-bold text-foreground">核心能力</h2>
            <div className="grid grid-cols-3 gap-5 max-w-2xl">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-md p-6 text-center transition-colors hover:border-primary/30"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, type: 'spring', stiffness: 300, damping: 25 }}
                  whileHover={{ y: -4 }}
                >
                  {/* 渐变光效 */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${f.color}`} />
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-semibold text-foreground">{f.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
                </motion.div>
              ))}
            </div>
            <button
              onClick={handleNext}
              className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              初始化系统
              <Zap className="h-5 w-5 transition-transform group-hover:rotate-12" />
            </button>
          </motion.div>
        )}

        {/* ─── Initializing Step ──── */}
        {step === 'initializing' && (
          <motion.div
            key="initializing"
            className="relative z-10 flex flex-col items-center gap-6 px-8 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* 旋转指示器 */}
            <motion.div
              className="relative flex h-20 w-20 items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
              <Zap className="h-8 w-8 text-primary" />
            </motion.div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">正在初始化</h2>
              <p className="mt-1 text-sm text-muted-foreground">请稍候...</p>
            </div>

            {/* 进度条 */}
            <div className="w-full">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="mt-2 text-right text-xs text-muted-foreground">{progress}%</div>
            </div>

            {/* 日志行 */}
            <div className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm p-4 font-mono text-xs space-y-1 max-h-[160px] overflow-y-auto">
              {initMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 text-muted-foreground"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-primary/60">▸</span>
                  <span>{msg}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Done Step ──── */}
        {step === 'done' && (
          <motion.div
            key="done"
            className="relative z-10 flex flex-col items-center gap-6 px-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* 成功图标 */}
            <motion.div
              className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
              >
                <Check className="h-12 w-12 text-green-500" strokeWidth={3} />
              </motion.div>
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">初始化完成！</h2>
              <p className="mt-2 text-muted-foreground">
                {isReset ? '系统已恢复默认设置，可以重新开始使用' : '一切就绪，开始您的智能教学之旅'}
              </p>
            </div>

            <motion.button
              onClick={onComplete}
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isReset ? '返回首页' : '开始使用'}
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── 重置所有数据工具函数 ─── */
export function resetAllData() {
  const keys = Object.values(STORAGE_KEYS);
  for (const key of keys) {
    localStorage.removeItem(key);
  }
  // 重新写入默认 API 配置
  localStorage.setItem(STORAGE_KEYS.apiKey, DEFAULT_API_KEY);
  localStorage.setItem(STORAGE_KEYS.apiModel, DEFAULT_MODEL);
}

/** 检查是否需要显示初始化界面 */
export function needsInitialization(): boolean {
  return localStorage.getItem(STORAGE_KEYS.initialized) !== 'true';
}

/** 设置已初始化标志 */
export function markInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}

/* ─── 用于设置面板的重置按钮（独立导出） ─── */
interface ResetButtonProps {
  onResetRequest: () => void;
}

export function ResetSystemButton({ onResetRequest }: ResetButtonProps) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (confirming) {
      const timer = setTimeout(() => setConfirming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirming]);

  const handleClick = () => {
    if (confirming) {
      onResetRequest();
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        confirming
          ? 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 scale-[1.02]'
          : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:border-destructive/50 hover:bg-destructive/5'
      }`}
    >
      <RotateCcw className={`h-4 w-4 ${confirming ? 'animate-spin' : ''}`} />
      {confirming ? '再次点击确认重置' : '重置系统'}
    </button>
  );
}
