# AI4Edu Educational Skills Implementation

This directory contains the Skill definitions for the AI4Edu educational assistant system, designed to work with the Accomplish framework.

## Core Educational Skills

### 1. Math Question Generator (`math-question-generator`)
- **Purpose**: Generate mathematics questions based on teacher profile and curriculum requirements
- **Key Features**:
  - Supports multiple difficulty levels (basic, medium, hard, competition)
  - Various question types (multiple choice, fill-in-blank, problem solving)
  - Curriculum-aligned content (人教A版, 苏教版 etc.)
  - LaTeX formula support
  - Detailed solution steps

### 2. PPT Generator (`ppt-generator`)
- **Purpose**: Create educational PowerPoint presentation outlines
- **Key Features**:
  - Subject-agnostic design (math, physics, chemistry, etc.)
  - Structured lesson planning
  - Interactive elements suggestions
  - Time-based content allocation
  - Visual design recommendations

### 3. Question Difficulty Adapter (`question-difficulty-adapter`)
- **Purpose**: Intelligently adjust question difficulty based on student performance
- **Key Features**:
  - Performance data analysis
  - Personalized learning paths
  - Adaptive difficulty scaling
  - Error pattern recognition
  - Teaching strategy recommendations

## Technical Architecture

### Skill Integration Pattern
```typescript
// Skills are integrated as prompt-based tools
interface EducationalSkill {
  name: string;
  version: string;
  subject?: string;
  promptTemplate: string;
  parameters: SkillParameter[];
}

// Teacher profile provides context for all skills
interface TeacherContext {
  name: string;
  school: string;
  subject: Subject;
  gradeLevel: string;
  textbookVersion: string;
  examRegion: string;
}
```

### Dynamic Prompt Injection
Each skill receives teacher context automatically:
- Personal information (name, school, position)
- Subject expertise and grade level
- Textbook version and exam requirements
- Class size and teaching environment

### Usage in Accomplish Framework

1. **Teacher configures profile** in Settings → 教师配置
2. **Skills inherit teacher context** automatically
3. **Natural language prompts** trigger appropriate skills
4. **AI generates contextual responses** based on teacher profile

## Skill Development Guidelines

### 1. Prompt Template Structure
```markdown
# Skill Header
你是{teacher_role}，专注于{grade_level}{subject_name}教学。

# Teacher Context
**教师信息**:
- 姓名: {teacher_name}
- 学校: {school_name}
- (其他配置信息)

# Task Description
**任务要求**:
(具体任务描述)

# Output Format
**输出格式**:
(严格的输出格式要求)

# Quality Requirements
**要求标准**:
(质量标准和注意事项)
```

### 2. Parameter System
- **Required**: Essential for skill function
- **Optional**: Enhance output quality
- **Contextual**: Derived from teacher profile
- **Dynamic**: Adapted based on usage patterns

### 3. Localization Support
- Primary language: Chinese (中文)
- Educational terminology: Standard Chinese education terms
- Curriculum alignment: Chinese national standards
- Regional variations: Support for different exam regions

## File Organization

```
docs/skills/
├── README.md                           # This file
├── math-question-generator.md          # Math question generation
├── ppt-generator.md                    # PPT outline creation
├── question-difficulty-adapter.md      # Adaptive difficulty system
└── templates/
    ├── skill-template.md              # Skill creation template
    └── parameter-schema.json          # Parameter definition schema
```

## Integration with Accomplish

### 1. Settings Integration
- Teacher profile stored in local storage
- Accessible via Settings → 教师配置 tab
- Automatically loads into skill contexts

### 2. Task Launcher Enhancement
- Educational prompts trigger relevant skills
- Context-aware suggestions based on teacher profile
- Subject-specific skill recommendations

### 3. Natural Language Processing
Examples of skill activation:
- "生成5道高一数学函数题" → `math-question-generator`
- "制作三角函数课件大纲" → `ppt-generator`
- "分析学生答题情况调整难度" → `question-difficulty-adapter`

## Future Enhancements

### Phase 2 Skills
- `exam-paper-generator`: Complete exam paper creation
- `lesson-plan-generator`: Detailed lesson planning
- `student-assessment-analyzer`: Performance analysis
- `homework-assignment-creator`: Homework design

### Phase 3 Integration
- Real-time student performance tracking
- Multi-teacher collaboration features
- Parent-teacher communication tools
- Learning analytics dashboard

## Testing and Validation

### Quality Assurance
1. **Content accuracy**: Educational content validation
2. **Curriculum alignment**: Standards compliance checking
3. **Cultural sensitivity**: Appropriate language and examples
4. **Technical integration**: Accomplish framework compatibility

### User Acceptance Testing
- Teacher usability testing
- Student learning outcome measurement
- Performance benchmarking
- Feedback collection and iteration

---

These skills transform AI4Edu from a general chatbot into a specialized educational assistant that understands Chinese educational contexts and provides culturally and pedagogically appropriate responses.