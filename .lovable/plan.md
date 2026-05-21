## 目标

新增 ai-toolbox 子模块 **ORAN MED**。点击侧边栏 ORAN MED 直接进入"新任务发起页"。历史任务工作台不占用一级入口，而是放在应用广场的一张 ORAN MED 卡片里。

## 信息架构

- 侧边栏一级入口：`ORAN MED` → `/ai-toolbox/oran-med` → **默认页 = 新任务发起页**
- 历史任务工作台：`/ai-toolbox/oran-med?view=tasks`（URL query 切换 view）
- 应用广场：仅新增 **1 张 ORAN MED 卡片**（标题、简介、入口按钮），按钮直接跳 `/ai-toolbox/oran-med?view=tasks`

## 新任务发起页（默认页，无步骤条）

页面顶部：标题"发起新任务" + 副标题 + 右上角链接 `任务工作台 →`。

主体为 **垂直堆叠的任务卡片**，每张卡 = 一个阶段，状态自驱（未完成 = 描边强调 + CTA；已完成 = 折叠摘要 + 编辑链接）。**不显示数字步骤条**。

卡片顺序：

1. **Brief 卡片**
   - 表单字段：Brief 标题*、发布平台、发布目标*、品牌名称、品牌类目、品牌标签、目标人群、期望发布时间、目标达人数、内容风格要求、类目要求、预算说明
   - 底部 `保存 Brief`；已填则折叠为摘要 chips + `编辑`

2. **达人卡片**
   - 内部 tab：`AI 推荐` / `手动选择`
   - AI 推荐：基于 Brief 输出达人卡片网格（昵称、KOL/KOC、平台·@handle、粉丝数、平均播放、标签、匹配分 + 匹配理由）
   - 手动：达人库网格 + 平台 / 类目 / 粉丝量筛选 + 搜索
   - 已选则折叠为达人头像条 + 数量 + `修改`

3. **内容资产卡片**
   - 顶部 segmented：`我已有资产` / `无资产，用 ORAN GEN 生成`
   - 已有：拖拽上传 + 资产小卡（缩略、归属达人、状态）
   - 无：每位选中达人 × 一张"待生成"子卡片，按钮 `用 ORAN GEN 生成`（mock loading → 完成）
   - 就绪则折叠为内容数 + 缩略图行

4. **发布计划卡片**
   - 每 `达人 × 内容` 一行：平台、计划时间、文案备注、话题 tag、是否投流
   - `一键应用到全部`

5. **提交审核卡片**
   - 汇总 + 合规清单
   - 主按钮 `提交平台审核` → 保存任务，状态 `审核中`，toast + 跳回工作台

## 任务工作台（次级页面）

Task 卡片网格：
- 标题、品牌、平台 chips
- 状态徽章、达人数 / 内容数、期望发布日
- 操作：继续编辑 / 复制 / 删除
- 预置 2–3 条 mock 任务

## 技术细节

- 全部前端 + mock，无后端
- 状态：`OranMedContext`（useReducer）+ `localStorage`（`oran-med-tasks`、`oran-med-current-draft`）
- 复用 `@/components/ui/*`、`lucide-react`；不引入新依赖
- 达人库 mock：10–15 条
- 文件上传：仅 `File` + `URL.createObjectURL` 预览

### 新增 / 修改文件

新增 `src/components/modules/ai-toolbox/oran-med/`：
- `OranMed.tsx`、`NewTaskPage.tsx`、`TasksWorkbench.tsx`、`TaskCard.tsx`
- `cards/BriefCard.tsx`、`CreatorsCard.tsx`、`CreatorTile.tsx`、`ContentAssetsCard.tsx`、`AssetTile.tsx`、`PublishPlanCard.tsx`、`SubmitCard.tsx`
- `context/OranMedContext.tsx`
- `data/creators.ts`、`data/mockTasks.ts`
- `types.ts`

修改：
- `src/navigation.ts`、`src/components/modules/ai-toolbox/AIToolboxModule.tsx`
- `src/components/layout/DynamicSidebar.tsx`（加 `oran-med` 一级条目）
- `src/i18n/locales/zh.json` & `en.json`
- `src/components/modules/ai-toolbox/app-plaza/HeroSection.tsx`（仅加 1 张 ORAN MED 卡片）

## 不在本期

- 真实 AI 匹配 / 平台审核接口、真实对象存储上传、与 ORAN GEN 真正数据互通