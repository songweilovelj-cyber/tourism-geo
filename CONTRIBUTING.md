# 贡献指南

感谢您对文旅GEO项目的关注！我们非常欢迎各种形式的贡献，无论是报告bug、提交功能建议、改进文档，还是直接贡献代码。

## 📋 目录

- [行为准则](#行为准则)
- [开始贡献](#开始贡献)
- [开发环境设置](#开发环境设置)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交信息规范](#提交信息规范)
- [Pull Request 流程](#pull-request-流程)
- [报告Bug](#报告bug)
- [功能建议](#功能建议)

## 行为准则

请阅读我们的 [行为准则](CODE_OF_CONDUCT.md)，并在参与社区活动时遵守。

## 开始贡献

1. **Fork 仓库** - 点击仓库页面右上角的 "Fork" 按钮
2. **克隆你的 Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tourism-geo.git
   cd tourism-geo
   ```
3. **添加上游仓库**
   ```bash
   git remote add upstream https://github.com/tourism-geo/tourism-geo.git
   ```
4. **创建特性分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 开发环境设置

### 前置要求
- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0
- Git

### 安装依赖

```bash
# 安装所有依赖
cd backend && npm install
cd ../frontend && npm install
```

### 配置环境变量

按照 `.env.example` 文件创建 `.env` 文件，并填写必要的配置。

### 启动开发服务器

```bash
# 后端开发服务器 (端口 3001)
cd backend
npm run dev

# 前端开发服务器 (端口 5173)
cd frontend
npm run dev
```

## 开发流程

### 1. 保持同步

在开始新功能或修复之前，确保你的 fork 与上游仓库保持同步：

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### 2. 创建分支

为每个功能或修复创建独立的分支：

```bash
git checkout -b feature/add-new-feature
# 或者
git checkout -b fix/issue-description
```

### 3. 编写代码

- 遵循项目的代码规范
- 确保代码可以通过 lint 检查
- 为新功能编写测试（如果有）

### 4. 提交更改

```bash
git add .
git commit -m "feat: add new feature"
```

### 5. 推送更改

```bash
git push origin feature/add-new-feature
```

### 6. 创建 Pull Request

在 GitHub 上打开你的 fork 仓库，点击 "New pull request" 按钮。

## 代码规范

### 通用规范

- 使用 **TypeScript** 进行开发
- 使用 **2个空格** 进行缩进
- 使用 **单引号** 作为字符串字面量
- 在文件末尾添加**空行**
- 最大行长不超过 **120 个字符**

### 命名规范

#### 变量和函数
- 使用 **camelCase** 命名变量和函数
- 使用 **PascalCase** 命名 React 组件和类型
- 使用 **SCREAMING_SNAKE_CASE** 命名常量

#### 文件命名
- React 组件文件：`PascalCase.tsx`
- 普通 TypeScript 文件：`camelCase.ts`
- 测试文件：`*.test.ts` 或 `*.spec.ts`

### React 组件规范

```tsx
// ✅ 推荐
interface ButtonProps {
  label: string
  onClick: () => void
}

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  )
}

// ❌ 避免
const button = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>
}
```

### CSS 规范

- 使用 Tailwind CSS 工具类
- 避免使用内联样式
- 优先使用 CSS 变量管理主题颜色

## 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `build`: 构建或依赖更新
- `ci`: CI 配置
- `chore`: 其他更改

### 示例

```
feat(resource): add image upload support

- 支持上传 JPEG、PNG、GIF 格式
- 支持视频上传
- 添加上传进度条

Closes #123
```

```
fix(auth): resolve JWT token expiration issue

Token refresh logic was not working correctly.
Now properly handles token refresh on 401 errors.
```

## Pull Request 流程

### PR 标题

使用与提交信息相同的格式：

```
feat(resource): add new resource type for hotels
```

### PR 描述模板

```markdown
## 描述
<!-- 简要描述这个 PR 做了什么 -->

## 改动内容
<!-- 详细列出你的改动 -->
- 
- 

## 相关 Issue
<!-- 关联的 Issue 编号 -->
Fixes #

## 测试
<!-- 描述你如何测试这些改动 -->
- [ ] 我已经测试过这些改动
- [ ] 添加了新的测试用例

## 截图
<!-- 如果有 UI 改动，添加截图 -->
```

### Code Review

- 等待 maintainers 进行 code review
- 根据反馈进行必要的修改
- 确保所有 CI 检查通过
- 保持 PR 的整洁和专注

## 报告Bug

如果你发现了 bug，请按以下格式提交：

```markdown
## Bug 描述
<!-- 清晰简洁地描述 bug -->

## 复现步骤
<!-- 如何复现这个 bug -->
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## 预期行为
<!-- 你期望发生什么 -->

## 实际行为
<!-- 实际发生了什么 -->

## 环境信息
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. 1.0.0]

## 截图
<!-- 如果有的话 -->
```

## 功能建议

我们非常欢迎新的功能建议！请按以下格式提交：

```markdown
## 功能描述
<!-- 简要描述你建议的功能 -->

## 使用场景
<!-- 这个功能将在什么场景下使用 -->

## 解决方案
<!-- 你觉得应该如何实现 -->

## 替代方案
<!-- 你考虑过的其他解决方案 -->

## 其他信息
<!-- 其他相关信息 -->
```

## 许可证

通过贡献代码，你同意将你的贡献以 MIT 许可证开源。

## 问题？

如果你有任何问题，请：
- 查看 [FAQ](docs/FAQ.md)
- 在 [GitHub Issues](https://github.com/tourism-geo/tourism-geo/issues) 中搜索
- 创建新的 Issue 进行提问

感谢你的贡献！ 🎉
