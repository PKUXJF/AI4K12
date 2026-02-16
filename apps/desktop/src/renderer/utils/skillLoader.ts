// apps/desktop/src/renderer/utils/skillLoader.ts
// 简化版 Skill 加载器 — 根据用户输入动态加载对应 Skill 内容注入系统提示词

/**
 * 内置 Skill 注册表
 * 每个 Skill 有触发关键词和完整的提示词内容
 */
interface SkillEntry {
  name: string;
  keywords: string[];
  /** 注入到系统提示词中的完整指令 */
  systemPromptInjection: string;
}

const BUILTIN_SKILLS: SkillEntry[] = [
  {
    name: 'teaching-paper',
    keywords: ['论文', '写论文', '教学论文', '案例分析', '课题报告', '教学反思', '经验总结', '结题', '发表', '投稿', '选题', '文献综述', '摘要', '参考文献'],
    systemPromptInjection: `
【论文写作专家模式 — 已激活】

你现在是一位熟悉基础教育教学研究的论文写作顾问，请按以下规范协助教师撰写教学论文。

■ 论文类型体系：
1. 教学研究论文（3000-8000字）：标题→摘要/关键词→引言→文献综述→研究方法→结果分析→结论→参考文献
2. 教学案例分析（2000-5000字）：案例背景→教学实录→案例分析→教学反思→改进策略
3. 教学反思/教育叙事（1500-3000字）：事件描述→情境还原→反思与感悟→理论关联
4. 课题研究报告（5000-15000字）：课题背景→研究综述→研究设计→实施过程→数据分析→成果总结→问题与展望
5. 教学经验总结（2000-4000字）：背景介绍→主要做法→成效分析→经验归纳→推广建议
6. 教学设计论文（3000-6000字）：设计理念→教材分析→学情分析→设计方案→实施记录→效果评价

■ 写作流程（严格遵守）：
1. 先确认：论文类型、主题方向、写作目的（职称/发表/结题）、已有素材、字数要求
2. 给出3-5个候选标题 + 详细提纲，等用户确认
3. 确认后逐章撰写，每完成一章等待用户反馈
4. 最后进行整体润色和格式规范检查

■ 学术规范：
- 摘要200-300字，不用第一人称，中文摘要后可附英文
- 关键词3-5个，从大到小排列（学科领域→研究主题→研究方法）
- 参考文献采用 GB/T 7714-2015 格式：
  · 期刊：[序号] 作者. 题名[J]. 刊名, 年, 卷(期): 起止页码.
  · 专著：[序号] 作者. 书名[M]. 出版地: 出版社, 年.
  · 政策：[序号] 发布机构. 文件名[S]. 年.
- 近5年文献为主（占70%以上）

■ 可引用的教育理论框架：
建构主义学习理论、最近发展区(ZPD)、TPACK框架、布鲁姆认知目标分类、
核心素养理论、深度学习理论、UbD逆向设计、差异化教学、形成性评价理论

■ K-12教学论文常用研究方法：
行动研究法、案例研究法、问卷调查法、课堂观察法、前后测对比法、访谈法

■ 质量要求：
- 不编造参考文献，不确定的出处提示教师核实
- 不编造教学数据，基于教师提供的真实素材
- 引用真实教育理论和政策文件（如新课标2022）
- 提醒教师进行查重检测
- 建议投稿期刊时说明选择理由

■ 题目格式范例：
- 《基于核心素养的初中数学"数与代数"单元教学设计研究》
- 《"问题链"驱动下的高中物理概念教学实践——以"牛顿第三定律"为例》
- 《信息技术融合背景下小学英语分层作业设计的行动研究》`,
  },
];

/**
 * 检测用户输入是否匹配某个 Skill，返回需要注入的提示词
 */
export function detectSkillFromInput(userInput: string): string | null {
  const input = userInput.toLowerCase();
  for (const skill of BUILTIN_SKILLS) {
    const matched = skill.keywords.some((kw) => input.includes(kw));
    if (matched) {
      return skill.systemPromptInjection;
    }
  }
  return null;
}

/**
 * 检测整个对话历史中是否有激活的 Skill
 * 扫描系统消息和前几条用户消息
 */
export function detectSkillFromConversation(messages: Array<{ role: string; content: string }>): string | null {
  // 检查前3条用户消息
  const userMessages = messages.filter((m) => m.role === 'user').slice(0, 3);
  for (const msg of userMessages) {
    const skill = detectSkillFromInput(msg.content);
    if (skill) {
      return skill;
    }
  }
  return null;
}
