# 文物期刊论文写作助手 - 技术架构文档

## 1. 技术栈

| 层级 | 技术选型 | 版本 |
|------|----------|------|
| **框架** | React | 19.x |
| **路由** | React Router | 6.x (HashRouter) |
| **状态管理** | Zustand | 5.x |
| **样式** | Tailwind CSS | 3.x |
| **构建** | Vite | 8.x |
| **类型** | TypeScript | 5.x |

---

## 2. 项目结构

```
src/
├── components/
│   └── heritage/
│       ├── ProjectInfoForm.tsx    # Tab整合表单（新）
│       ├── PaperPreview.tsx        # 论文预览
│       ├── FormatCheckPanel.tsx    # 格式校验
│       ├── StepIndicator.tsx      # 步骤指示器
│       └── ChatMessage.tsx        # 聊天消息
├── pages/
│   └── HeritagePaperPage/
│       └── HeritagePaperPage.tsx  # 主页面
├── stores/
│   └── heritagePaperStore.ts      # 状态管理
├── types/
│   └── heritage.ts                # 类型定义
└── index.css                      # Tailwind入口
```

---

## 3. 状态设计

### 3.1 状态结构

```typescript
interface HeritageState {
  // 当前步骤
  currentStep: 'welcome' | 'project_info' | 'generating' | 'review' | 'final'
  
  // 研究模式
  researchMode: 'single' | 'batch' | 'category'
  
  // 项目信息（合并后的表单）
  projectInfo: {
    // Tab1: 文物信息
    artifacts: Artifact[]           // 支持多件文物
    // Tab2: 研究内容
    researchPurpose: string
    researchMethods: string[]
    keyFindings: string
    innovations: string
    targetJournal: string
    // Tab3: 作者信息
    authorInfo: AuthorInfo
  }
  
  // 生成的论文
  paperData: PaperData | null
  
  // 格式校验结果
  formatCheck: FormatCheckResult | null
  
  // 修订历史
  revisions: Revision[]
}
```

### 3.2 文物类型（扩展）

```typescript
interface Artifact {
  id: string
  name: string
  type: string           // 青铜器/陶瓷器/书画等
  era: string            // 朝代
  origin: string         // 出土地点
  collection: string     // 收藏单位
  description: string   // 描述
  images: string[]       // 图片URLs
}
```

---

## 4. 组件设计

### 4.1 ProjectInfoForm（Tab整合表单）

```tsx
interface ProjectInfoFormProps {
  onSubmit: (data: ProjectInfo) => void
  initialData?: ProjectInfo
}

// Tab结构
const TABS = [
  { key: 'artifacts', label: '📦 文物信息', icon: 'artifacts' },
  { key: 'research', label: '🔬 研究内容', icon: 'research' },
  { key: 'author', label: '👤 作者信息', icon: 'author' }
]
```

### 4.2 批量文物管理

```tsx
// 文物列表（支持添加/删除/编辑）
<ArtifactList>
  <ArtifactCard artifact={art} onEdit={...} onDelete={...} />
  <AddArtifactButton onClick={addNew} />
</ArtifactList>

// 批量模式下显示数量统计
<div className="text-sm text-gray-500">
  已添加 {artifacts.length} 件文物
</div>
```

### 4.3 论文预览（PaperPreview）

```tsx
// 左侧论文编辑 + 右侧格式校验
<div className="grid grid-cols-5 gap-4">
  <div className="col-span-3">
    <PaperContent paper={paperData} editable={true} />
  </div>
  <div className="col-span-2">
    <FormatCheckPanel result={formatCheck} />
  </div>
</div>
```

---

## 5. 论文生成逻辑

### 5.1 单件文物论文结构

```typescript
const generateSinglePaper = (artifacts: Artifact[], research: ResearchInfo): PaperData => {
  const artifact = artifacts[0]
  return {
    title: `${artifact.era}${artifact.name}的初步研究`,
    abstract: {
      purpose: `对${artifact.era}时期${artifact.name}进行系统研究...`,
      methods: `采用${research.researchMethods.join('、')}等方法...`,
      results: `研究发现该${artifact.type}具有...`,
      conclusion: `本研究对于理解...具有重要意义`
    },
    keywords: [artifact.name, artifact.era, artifact.type, ...],
    sections: {
      introduction: generateIntro(artifact, research),
      materials: generateMaterials(artifact),
      results: generateResults(artifact, research),
      discussion: generateDiscussion(artifact, research),
      conclusion: generateConclusion(artifact, research)
    },
    references: generateReferences(research)
  }
}
```

### 5.2 批量文物论文结构

```typescript
const generateBatchPaper = (artifacts: Artifact[], research: ResearchInfo): PaperData => {
  return {
    title: `${artifacts[0].era}${artifacts[0].type}对比研究`,
    abstract: {
      purpose: `对${artifacts.length}件${artifacts[0].type}进行对比分析...`,
      methods: `采用类型学、比较研究等方法...`,
      results: `归纳出${artifacts.length}件文物的共性与差异...`,
      conclusion: `揭示了${artifacts[0].era}时期...的演变规律`
    },
    sections: {
      introduction: `本研究选取了${artifacts.length}件${artifacts[0].type}...`,
      comparativeAnalysis: generateComparativeAnalysis(artifacts),
      typology: generateTypology(artifacts),
      conclusion: generateBatchConclusion(artifacts)
    }
  }
}
```

---

## 6. 格式校验规则

```typescript
const formatRules: FormatRule[] = [
  {
    id: 'title_length',
    name: '标题字数',
    check: (paper) => paper.title.length <= 25,
    suggestion: '标题建议控制在25字以内'
  },
  {
    id: 'abstract_structure',
    name: '摘要结构',
    check: (paper) => {
      const abs = paper.abstract
      return abs.purpose && abs.methods && abs.results && abs.conclusion
    },
    suggestion: '摘要应包含目的、方法、结果、结论四部分'
  },
  {
    id: 'keyword_count',
    name: '关键词数量',
    check: (paper) => paper.keywords.length >= 3 && paper.keywords.length <= 8,
    suggestion: '建议设置3-8个关键词'
  },
  {
    id: 'reference_count',
    name: '参考文献数量',
    check: (paper) => paper.references.length >= 5,
    suggestion: '建议引用至少5篇参考文献'
  }
]
```

---

## 7. 样式变量

```css
:root {
  /* 主色调 - 赭石棕 */
  --color-primary: #8B5A2B;
  --color-primary-light: #A67C52;
  --color-primary-dark: #6B4423;
  
  /* 辅助色 - 青铜绿 */
  --color-secondary: #4A7C59;
  --color-secondary-light: #6B9B7A;
  --color-secondary-dark: #3A6147;
  
  /* 点缀色 - 朱砂红 */
  --color-accent: #C84C31;
  
  /* 背景色 */
  --color-bg-light: #FAF7F2;
  --color-bg-dark: #1C1917;
  
  /* 阴影 */
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-button: 0 2px 8px rgba(139, 90, 43, 0.3);
  
  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
```

---

## 8. 单文件打包

### 8.1 构建配置

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        format: 'iife'
      }
    }
  }
})
```

### 8.2 内联脚本

```javascript
// build-single-file.cjs
// 1. 构建IIFE格式产物
// 2. 提取CSS内容内联到<style>
// 3. 提取JS内容内联到<script>
// 4. 转义JS中的</script>字符串
// 5. 生成最终单文件HTML
```

---

## 9. 路由定义

| 路由 | 组件 | 说明 |
|------|------|------|
| `/heritage-paper` | HeritagePaperPage | 主页面 |
| `/dashboard` | DashboardPage | 仪表盘（返回） |

---

## 10. 待优化项

- [ ] 实现批量文物添加/编辑功能
- [ ] 实现类型研究模式
- [ ] 添加PDF导出功能
- [ ] 优化论文生成算法（更智能的内容生成）
- [ ] 添加修订历史记录
