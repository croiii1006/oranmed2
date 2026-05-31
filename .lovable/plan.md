## 目标

让用户在「AI 推荐 / 手动选择达人」面板中，一眼看到每位达人的关键数据（粉丝、均播、报价），并把已选达人的关键指标累加汇总，便于评估预算与触达量。

## 改动范围

仅前端展示，限定在 `src/components/modules/ai-toolbox/oran-med/OranMed.tsx` 的达人选择面板（约 444–626 行）。不改业务逻辑、不动数据结构。

## 设计

### 1. 卡片上常亮的关键指标
当前粉丝/均播/报价/互动率只在 hover 蒙层里展示。改为：
- 卡片底部新增一行常亮的「微型指标条」：粉丝 · 均播 · 报价。
- 字号小、低对比度，不抢头像与名字焦点。
- Hover 蒙层保留完整指标（互动/完播/标签/匹配理由）。

```text
┌─────────────────────┐
│        avatar       │
│        Name         │
│       @handle       │
│  12.4w · 均播 2.1w  │ ← 新增
│       ¥8.0k         │
└─────────────────────┘
```

### 2. 已选达人的累加汇总条
在面板顶部「已选 X 位」右侧不再只显示数字，改为浮现一条汇总信息（仅当 `selectedCreatorIds.length > 0`）：

```text
已选 3 位 · 触达 38.6w 粉丝 · 预估均播 7.2w · 报价合计 ¥24.0k
```

放置位置：保留现有 header 行，把右侧文本扩展为一个紧凑的汇总条；空间不足时换行到 header 下方一行（h-5，font-light，text-[11px]）。

汇总规则：
- 粉丝合计：解析 `c.followers`（形如 `12.4w`）累加，结果统一格式化为 `w / 万`。
- 均播合计：同上解析 `c.avgPlay` 累加。
- 报价合计：累加 `c.reportedVideoPrice`，按币种分组（CNY → `¥`，USD → `$`），如同时存在多种币种则分别展示，例如 `¥18.0k + $1.2k`。
- 未填报价的达人在合计行加 `(N 位待询价)` 提示，避免误导。

### 3. 与目标人数的对比
header 右侧汇总条前增加一个细微的进度提示：`3 / 目标 5`，达到/超出目标时变为 `foreground/70`，未达成保持 `muted-foreground`。数据来自 `brief.targetCreatorCount`。

## 技术细节

- 新增纯函数 `parseFollowersToWan(str)`、`formatWan(n)`：处理 `w/W/万/K/M` 单位（已在 `data/creators.ts` 有 `parseFollowers`，可在 OranMed 内复用一个本地版本，避免改公共导出）。
- 新增 `summarizeSelected(creators)`：返回 `{ fans, plays, priceByCurrency, missingPrice }`。
- 渲染层只在 header 与卡片内插入展示，不引入新组件文件。
- 不修改 `Creator` 类型、不动 `creators.ts` 数据生成逻辑。

## 不做的事

- 不新增筛选/排序按钮。
- 不改右侧抽屉 `CreatorDetailDialog`。
- 不改后续步骤（资产/计划）中已选达人列表的展示——本次仅限选择阶段。
