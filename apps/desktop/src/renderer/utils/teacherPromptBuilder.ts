// apps/desktop/src/renderer/utils/teacherPromptBuilder.ts

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

/**
 * 根据教师配置文件构建动态提示词前缀
 */
export function buildTeacherPromptPrefix(profile?: TeacherProfile | null): string {
  if (!profile || !profile.name) {
    return "你是一位经验丰富的教师，请协助完成教学相关任务。";
  }

  const subjectNames: Record<Subject, string> = {
    math: '数学',
    physics: '物理', 
    chemistry: '化学',
    biology: '生物',
    chinese: '语文',
    english: '英语',
    history: '历史',
    geography: '地理',
    politics: '政治'
  };

  const subjectName = subjectNames[profile.subject];
  
  return `你是${profile.school}的${profile.position}${profile.name}，专业教授${subjectName}。

【教学背景】
- 主要教授：${profile.gradeLevel}${subjectName}
- 使用教材：${profile.textbookVersion}
- 班级规模：${profile.classCount}个班，每班${profile.classSize}人
- 考试地区：${profile.examRegion}

请基于以上背景，为我的教学工作提供专业协助。`;
}

/**
 * 构建针对特定任务的完整提示词
 */
export function buildTaskPrompt(taskType: string, userInput: string, profile?: TeacherProfile | null): string {
  const prefix = buildTeacherPromptPrefix(profile);
  
  // 任务特定的系统提示
  const taskPrompts: Record<string, string> = {
    'question-generator': `
${prefix}

【任务要求】
请根据用户的描述生成符合教学要求的数学题目，要求：
1. 题目难度符合年级水平
2. 知识点覆盖准确
3. 解答步骤详细清晰
4. 符合考试命题规范

【用户需求】
${userInput}`,

    'ppt-generator': `
${prefix}

【任务要求】
请根据用户的描述制作PPT课件，要求：
1. 内容结构清晰
2. 重点突出，易于理解
3. 适合课堂教学使用
4. 符合学科特点

【用户需求】
${userInput}`,

    'lesson-planner': `
${prefix}

【任务要求】
请根据用户的描述制作教案，要求：
1. 教学目标明确
2. 教学过程完整
3. 重点难点突出
4. 符合新课标要求

【用户需求】
${userInput}`,

    'general': `
${prefix}

【任务要求】
${userInput}`
  };

  return taskPrompts[taskType] || taskPrompts['general'];
}

/**
 * 从localStorage获取教师配置
 */
export function getTeacherProfile(): TeacherProfile | null {
  try {
    const stored = localStorage.getItem('ai4edu_teacher_profile');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * 检查是否有教师配置
 */
export function hasTeacherProfile(): boolean {
  const profile = getTeacherProfile();
  return !!(profile && profile.name && profile.school);
}

/**
 * 获取教师配置指导文本
 */
export function getTeacherConfigureTip(): string {
  const profile = getTeacherProfile();
  
  if (!profile) {
    return "建议您先在设置中配置教师信息，以获得更好的个性化体验。";
  }
  
  if (!profile.name || !profile.school) {
    return "请完善您的教师信息配置，以获得更准确的AI协助。";
  }
  
  return `当前配置：${profile.school} ${profile.gradeLevel}${profile.subject === 'math' ? '数学' : profile.subject}教师`;
}