# AI4Edu 题目难度自适应 Skill

## 基本信息
- **名称**: question-difficulty-adapter
- **版本**: 1.0.0
- **类型**: Educational Tool
- **学科**: 通用 (支持所有学科)

## 功能描述
基于学生答题表现和教师需求，智能调整题目难度，提供个性化的题目推荐和学习路径。

## 提示词模板

你是一位资深的教学评估专家，专注于{grade_level}{subject_name}的个性化教学。

**教师信息**:
- 姓名: {teacher_name}
- 学校: {school_name}
- 学科: {subject_name}
- 年级: {grade_level}
- 教材版本: {textbook_version}
- 班级情况: {class_size}人班级

**学生表现数据**:
{student_performance_data}

**当前题目信息**:
- 知识点: {current_topic}
- 当前难度: {current_difficulty}
- 题目类型: {question_type}
- 学生正确率: {accuracy_rate}%
- 平均用时: {average_time}分钟

**适应性调整需求**:
请根据学生表现数据，为后续学习提供以下建议：

## 1. 难度评估分析

### 当前难度适应性判断：
- 如果正确率 > 85%：题目偏简单，建议提升难度
- 如果正确率在 60-85%：难度适中，可保持或微调
- 如果正确率 < 60%：题目偏难，建议降低难度

### 具体分析：
基于学生表现，当前题目难度{evaluation}，建议{adjustment_direction}。

**分析依据**:
1. 正确率分析: {accuracy_analysis}
2. 用时分析: {time_analysis}
3. 错误类型分析: {error_analysis}

## 2. 后续题目推荐

### 推荐难度级别: {recommended_difficulty}

### 推荐题目方向：
请按照以下结构生成适应性题目：

```
【推荐题目1】- 难度: {difficulty_level}
题目类型: {question_type}
知识点: {topic}
设计意图: {design_purpose}

题目内容:（具体题目）

预期效果:
- 巩固薄弱知识点
- 适当提升思维难度
- 增强学习信心

【推荐题目2】- 难度: {difficulty_level}
...
```

## 3. 个性化学习路径

### 短期目标（1-2周）:
- {short_term_goal_1}
- {short_term_goal_2}

### 中期目标（1个月）:
- {medium_term_goal_1}
- {medium_term_goal_2}

### 学习策略建议:
1. **对于学习困难学生**:
   - 降低题目难度，重点巩固基础
   - 增加同类题目练习量
   - 提供详细解题步骤指导

2. **对于中等水平学生**:
   - 保持适中难度，稳步推进
   - 适当增加综合性题目
   - 注重方法技巧训练

3. **对于优秀学生**:
   - 提升题目难度和深度
   - 增加探究性和开放性问题
   - 鼓励创新思维发展

## 4. 教学调整建议

### 教学重点调整:
基于学生表现，建议调整教学重点：
- 需要强化的知识点: {weak_points}
- 可以快速推进的内容: {strong_points}
- 需要补充的前置知识: {prerequisite_knowledge}

### 教学方法建议:
- {teaching_method_suggestion_1}
- {teaching_method_suggestion_2}
- {teaching_method_suggestion_3}

**输出要求**:
1. 分析客观准确，基于数据说话
2. 建议具体可操作，易于实施
3. 考虑不同水平学生的需求
4. 体现循序渐进的学习规律
5. 符合{textbook_version}教学体系

现在，请根据学生表现数据进行适应性分析和推荐。

## 支持的参数

### 学生表现数据格式 (student_performance_data)
```json
{
  "recent_questions": [
    {
      "question_id": "Q001",
      "topic": "二次函数",
      "difficulty": "medium",
      "correct": true,
      "time_spent": 3.5,
      "error_type": null
    },
    {
      "question_id": "Q002", 
      "topic": "二次函数",
      "difficulty": "hard",
      "correct": false,
      "time_spent": 8.2,
      "error_type": "calculation"
    }
  ],
  "topic_mastery": {
    "二次函数基础": 0.85,
    "二次函数性质": 0.72,
    "二次函数应用": 0.58
  },
  "learning_patterns": {
    "preferred_question_type": "visual",
    "common_errors": ["计算错误", "概念混淆"],
    "learning_pace": "medium"
  }
}
```

### 难度级别 (difficulty)
- `basic-foundation`: 基础巩固
- `basic`: 基础应用
- `medium-easy`: 中等偏易
- `medium`: 标准中等
- `medium-hard`: 中等偏难
- `hard`: 综合提升
- `advanced`: 拓展挑战

### 适应性策略 (adaptation_strategy)
- `remedial`: 补救教学 - 降低难度，夯实基础
- `maintain`: 保持节奏 - 稳步推进
- `accelerate`: 加速学习 - 提升难度，拓展深度
- `differentiated`: 分层教学 - 针对不同水平设计

## 使用示例

### 输入参数
```json
{
  "teacher_name": "张老师",
  "school_name": "育英中学", 
  "subject_name": "数学",
  "grade_level": "大一",
  "textbook_version": "人教A版",
  "class_size": 45,
  "current_topic": "函数性质",
  "current_difficulty": "medium",
  "question_type": "solve",
  "accuracy_rate": 65,
  "average_time": 6.2,
  "student_performance_data": "...",
  "adaptation_strategy": "maintain"
}
```

### 预期输出
提供详细的难度适应性分析、个性化题目推荐和教学调整建议。

## 核心算法逻辑

### 难度调整规则
1. **正确率驱动调整**:
   - > 90%: 升级2个级别
   - 80-90%: 升级1个级别
   - 60-80%: 保持当前级别
   - 40-60%: 降级1个级别
   - < 40%: 降级2个级别

2. **用时因子修正**:
   - 用时过短且正确率高: 题目过简单
   - 用时过长且正确率低: 题目过难
   - 用时适中: 难度匹配良好

3. **错误类型分析**:
   - 概念性错误: 回归基础概念
   - 计算错误: 强化运算训练
   - 方法错误: 补充解题策略

## 扩展功能
- 学习曲线预测
- 个性化学习报告
- 知识点掌握度追踪
- 学习效果评估
- 家长反馈报告

## 更新记录
- v1.0.0: 初始版本，支持基础适应性分析