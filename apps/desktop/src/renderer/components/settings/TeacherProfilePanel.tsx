// apps/desktop/src/renderer/components/settings/TeacherProfilePanel.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SaveIcon, School, User, BookOpen, Users, GraduationCap, Key, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TeacherProfile {
  name: string;
  school: string;
  position: string;
  subject: Subject;
  gradeLevel: string;
  classSize: number;
  classCount: number;
  textbookVersion: string;
  examRegion: string;
  updatedAt: string;
}

type Subject = 'math' | 'physics' | 'chemistry' | 'biology' | 
               'chinese' | 'english' | 'history' | 'geography' | 'politics';

const SUBJECTS = [
  { id: 'math', name: '数学', icon: '📐', category: 'science' },
  { id: 'physics', name: '物理', icon: '⚛️', category: 'science' },
  { id: 'chemistry', name: '化学', icon: '🧪', category: 'science' },
  { id: 'biology', name: '生物', icon: '🧬', category: 'science' },
  { id: 'chinese', name: '语文', icon: '📝', category: 'arts' },
  { id: 'english', name: '英语', icon: '🌍', category: 'arts' },
  { id: 'history', name: '历史', icon: '📜', category: 'arts' },
  { id: 'geography', name: '地理', icon: '🌏', category: 'arts' },
  { id: 'politics', name: '政治', icon: '🏛️', category: 'arts' },
];

const GRADE_LEVELS = [
  '高一', '高二', '高三', '初一', '初二', '初三', '六年级', '五年级', '四年级', '三年级', '二年级', '一年级'
];

const TEXTBOOK_VERSIONS = {
  math: ['人教A版', '人教B版', '北师大版', '苏教版', '湘教版'],
  chinese: ['人教版', '苏教版', '语文S版', '北师大版'],
  english: ['人教版', '外研版', '译林版', '仁爱版'],
  physics: ['人教版', '鲁科版', '粤教版', '教科版'],
  chemistry: ['人教版', '鲁科版', '苏教版'],
  biology: ['人教版', '苏教版', '浙科版'],
  history: ['人教版', '岳麓版', '人民版'],
  geography: ['人教版', '中图版', '湘教版'],
  politics: ['人教版', '粤教版']
};

export function TeacherProfilePanel() {
  const [profile, setProfile] = useState<TeacherProfile>({
    name: '',
    school: '',
    position: '教师',
    subject: 'math',
    gradeLevel: '高一',
    classSize: 45,
    classCount: 1,
    textbookVersion: '人教A版',
    examRegion: '新高考I卷',
    updatedAt: new Date().toISOString(),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // SiliconFlow API settings
  const [apiKey, setApiKey] = useState('');
  const [apiModel, setApiModel] = useState('Pro/moonshotai/Kimi-K2.5');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [apiTestMessage, setApiTestMessage] = useState('');

  // Default API configuration
  const DEFAULT_API_KEY = 'sk-lqduodenmjylybzcjmquritedcnaojyjnbjmjatvtehqyuzo';
  const DEFAULT_MODEL = 'Pro/moonshotai/Kimi-K2.5';

  useEffect(() => {
    loadTeacherProfile();
    // Load saved API settings, falling back to defaults
    try {
      const savedKey = localStorage.getItem('ai4edu_api_key');
      const savedModel = localStorage.getItem('ai4edu_api_model');

      // If no API key is saved yet, auto-configure with defaults
      if (!savedKey) {
        localStorage.setItem('ai4edu_api_key', DEFAULT_API_KEY);
        localStorage.setItem('ai4edu_api_model', DEFAULT_MODEL);
        setApiKey(DEFAULT_API_KEY);
        setApiModel(DEFAULT_MODEL);
      } else {
        setApiKey(savedKey);
        setApiModel(savedModel || DEFAULT_MODEL);
      }
    } catch {}
  }, []);

  const loadTeacherProfile = async () => {
    try {
      // TODO: Load from localStorage or database
      const stored = localStorage.getItem('ai4edu_teacher_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
      }
    } catch (error) {
      console.error('Failed to load teacher profile:', error);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedProfile = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('ai4edu_teacher_profile', JSON.stringify(updatedProfile));
      // Save API settings
      localStorage.setItem('ai4edu_api_key', apiKey);
      localStorage.setItem('ai4edu_api_model', apiModel);
      setProfile(updatedProfile);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save teacher profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (updates: Partial<TeacherProfile>) => {
    setProfile(current => ({ ...current, ...updates }));
    setHasUnsavedChanges(true);
  };

  const getTextbookVersionsForSubject = (subject: Subject) => {
    return TEXTBOOK_VERSIONS[subject] || ['标准版'];
  };

  const testApiConnection = async () => {
    if (!apiKey.trim()) {
      setApiTestStatus('error');
      setApiTestMessage('请输入 API Key');
      return;
    }
    setApiTestStatus('testing');
    setApiTestMessage('');
    try {
      const baseUrl = import.meta.env.DEV ? '/api/siliconflow/v1' : 'https://api.siliconflow.cn/v1';
      const resp = await fetch(`${baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (resp.ok) {
        setApiTestStatus('success');
        setApiTestMessage('连接成功！');
      } else {
        setApiTestStatus('error');
        setApiTestMessage(`连接失败 (${resp.status}): 请检查API Key是否正确`);
      }
    } catch (err) {
      setApiTestStatus('error');
      setApiTestMessage('网络错误，请检查网络连接');
    }
  };

  const SILICON_FLOW_MODELS = [
    { id: 'Pro/moonshotai/Kimi-K2.5', name: 'Kimi-K2.5 (默认)', desc: 'Moonshot最新模型，中文教学能力强' },
    { id: 'Pro/Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5-72B', desc: '通义千问，综合能力强' },
    { id: 'Pro/deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3', desc: '深度搜索，逻辑推理佳' },
    { id: 'Pro/01-ai/Yi-1.5-34B-Chat-16K', name: 'Yi-1.5-34B', desc: '零一万物，中文理解优秀' },
    { id: 'Pro/meta-llama/Meta-Llama-3.1-70B-Instruct', name: 'Llama-3.1-70B', desc: 'Meta开源，多任务强' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            教师基本信息
          </CardTitle>
          <CardDescription>
            配置您的教学信息，系统将根据这些信息为您定制AI提示词
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
                placeholder="请输入您的姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">学校</Label>
              <Input
                id="school"
                value={profile.school}
                onChange={(e) => updateProfile({ school: e.target.value })}
                placeholder="请输入学校名称"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">职务</Label>
            <Input
              id="position"
              value={profile.position}
              onChange={(e) => updateProfile({ position: e.target.value })}
              placeholder="如：高中数学教师、年级组长等"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            教学配置
          </CardTitle>
          <CardDescription>
            配置您的主要教学科目和年级信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>主教科目</Label>
              <select
                value={profile.subject}
                onChange={(e) => {
                  const value = e.target.value as Subject;
                  updateProfile({ 
                    subject: value,
                    textbookVersion: getTextbookVersionsForSubject(value)[0]
                  });
                }}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {SUBJECTS.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.icon} {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>主要年级</Label>
              <select
                value={profile.gradeLevel}
                onChange={(e) => updateProfile({ gradeLevel: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {GRADE_LEVELS.map(grade => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>教材版本</Label>
              <select
                value={profile.textbookVersion}
                onChange={(e) => updateProfile({ textbookVersion: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {getTextbookVersionsForSubject(profile.subject).map(version => (
                  <option key={version} value={version}>
                    {version}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            班级信息
          </CardTitle>
          <CardDescription>
            配置您的班级规模和考试区域信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classCount">任教班级数</Label>
              <Input
                id="classCount"
                type="number"
                min={1}
                value={profile.classCount}
                onChange={(e) => updateProfile({ classCount: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classSize">班级人数</Label>
              <Input
                id="classSize"
                type="number"
                min={1}
                value={profile.classSize}
                onChange={(e) => updateProfile({ classSize: Number(e.target.value) || 45 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examRegion">考试地区/卷型</Label>
              <Input
                id="examRegion"
                value={profile.examRegion}
                onChange={(e) => updateProfile({ examRegion: e.target.value })}
                placeholder="如：新高考I卷"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SiliconFlow API 配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            AI 服务配置
          </CardTitle>
          <CardDescription>
            配置 SiliconFlow API 以启用 AI 功能。
            <a href="https://cloud.siliconflow.cn/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">获取 API Key →</a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setHasUnsavedChanges(true); setApiTestStatus('idle'); }}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiModel">模型选择</Label>
            <select
              id="apiModel"
              value={apiModel}
              onChange={(e) => { setApiModel(e.target.value); setHasUnsavedChanges(true); }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {SILICON_FLOW_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — {m.desc}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testApiConnection}
              disabled={apiTestStatus === 'testing'}
            >
              {apiTestStatus === 'testing' ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" />测试中...</>
              ) : (
                '测试连接'
              )}
            </Button>
            {apiTestStatus === 'success' && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />{apiTestMessage}
              </span>
            )}
            {apiTestStatus === 'error' && (
              <span className="flex items-center gap-1 text-sm text-red-600">
                <XCircle className="h-4 w-4" />{apiTestMessage}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={saveProfile}
          disabled={!hasUnsavedChanges || isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <SaveIcon className="h-4 w-4" />
              </motion.div>
              保存中...
            </>
          ) : (
            <>
              <SaveIcon className="h-4 w-4 mr-2" />
              保存配置
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}