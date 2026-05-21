## 目标
解决 Brief 卡片字段（目标人群 / 内容风格 / 品牌卖点 / 预算）标签数量过多时换行撑高、与下方字段重叠的问题。

## 方案：截断 + "+N" 折叠
- 标签区由 `flex-wrap` 改为单行 `flex-nowrap overflow-hidden`，固定一行高度。
- 测量可用宽度，仅渲染能完整放下的前 N 个标签 + 末尾输入框；剩余标签合并为一个灰色 chip `+{剩余数}`。
- 点击 `+N` 弹出 Popover（用现成 `@/components/ui/popover`），在浮层内展示全部标签，每个标签同样支持点击编辑、× 删除；浮层底部带一个"添加"输入框，方便溢出后继续添加。
- 已存在的"点击标签编辑 / ×删除 / 输入框回车或逗号添加 / Backspace 删除末尾"逻辑全部保留，溢出标签的交互在 Popover 内沿用。

## 改动范围
文件：`src/components/modules/ai-toolbox/oran-med/OranMed.tsx`

仅修改 `MetaField` 组件（约 648–779 行）：
1. 容器外层增加 `ref`，用 `ResizeObserver` 监听宽度变化。
2. 标签行：`flex flex-nowrap items-center gap-1.5 overflow-hidden min-w-0`。
3. 渲染流程：
   - 先在隐藏度量层渲染全部标签计算各自宽度（或用简化估算：按字符数 × 字宽 + padding），保留末尾输入框 ~70px + `+N` chip ~36px 的预留宽度；
   - 取能放下的前 N 个直接渲染；
   - `tags.length - N > 0` 时渲染 `+{差额}` chip（与现有标签同款样式但浅灰、`cursor-pointer`），点击触发 Popover。
4. Popover 内容：
   - 标题"全部 {label}（{count}）"。
   - 网格/wrap 列出全部标签，复用现有 `span` + × 渲染与 `startEdit / removeTag` 行为。
   - 底部输入框：复用 `draft / addTag` 逻辑（同一份 state）。
5. `date` 与 `PlainField`（发布要求）不改。

## 视觉细节
- 单行高度与现有 `py-2 + leading-5` 保持一致，整张 Brief 卡片高度不再被撑大。
- `+N` chip 配色：`border-border/40 bg-muted/60 text-muted-foreground hover:text-foreground hover:border-accent/40`。
- Popover：`w-[280px] p-3 rounded-xl`，与品牌玻璃质感一致；标签区 `flex flex-wrap gap-1.5`。

## 验收
- 多于 3 个标签的字段在 1444 视口下保持单行，下方字段不再被挤压。
- 点击 `+N` 可看到全部标签并能编辑/删除/继续添加。
- 容器宽度变化（左侧达人面板展开/收起）时，可见标签数量自适应。
