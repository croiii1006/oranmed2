## 目标

在品牌端「任务详情」弹窗里，点击达人列表行进入达人子页面（`view.kind === 'creator'`）时，呈现的信息要与「手动选择达人」时弹出的 `CreatorDetailDialog` 完全一致（基础身份 / 表现指标 / 内容画像 / 商务 & 合规等多分组卡片），而不是当前只展示层级、粉丝、平均播放、标签、推荐理由的极简 6 行布局。

## 改动范围

只改前端展示，不改数据、状态机、任务/达人 ID 映射。

### 1. 抽出可复用的「达人详情内容块」

将 `src/components/modules/ai-toolbox/oran-med/components/CreatorDetailDialog.tsx` 中 Dialog body 内的视觉内容（头像头部 + Section / Row 分组：基础身份、表现指标、内容画像、声音、商务 & 合规、推荐理由、数据更新时间）抽到一个新组件：

```text
src/components/modules/ai-toolbox/oran-med/components/CreatorDetailContent.tsx
```

- 接收 `creator: Creator` 与 `showMatch?: boolean`。
- 不包含 `Dialog` / `DialogHeader` 外壳，纯内容，方便在任务详情子页中内嵌。
- `CreatorDetailDialog.tsx` 改为内部直接渲染 `<CreatorDetailContent />`，外部 API 不变，所有现有调用方（OranMed.tsx、CreatorSelectionDialog、SelectedCreatorList）零修改。

### 2. 任务详情中达人子页面替换为完整卡片

文件：`src/components/modules/ai-toolbox/oran-med/OranMed.tsx`，约 4185–4210 行（`{view.kind === 'creator' && activeCreator && (...)}` 分支）。

- 移除当前的简化 header + 2 列 DetailRow 网格。
- 改为渲染 `<CreatorDetailContent creator={activeCreator} showMatch />`，与手动选择达人时的弹窗内容完全一致。
- 顶部「返回任务详情」面包屑、Dialog 标题（达人姓名）、状态徽章保持不变。

## 验收

- 任务详情中点击任一达人 → 子页内容与「手动选择达人」点开的卡片视觉一致：含国家/语言/粉丝/活跃占比/近30天增长、平均播放/互动率/完播率/平均点赞评论分享、内容品类/风格/声音、报价/可议价/报价有效期、肖像授权状态、账号状态、数据更新时间、推荐理由。
- 手动选择达人弹窗与达人库列表中的 `CreatorDetailDialog` 仍然正常工作（因为只是把内部 body 抽成子组件复用）。
