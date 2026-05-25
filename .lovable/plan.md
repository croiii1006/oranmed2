## 目标

OranGen（SkillsModule）与 OranMed 中所有"已选达人"统一以卡片形式展示头像 + 基础信息，点击单张卡片可在原位展开查看完整资料。

---

## 改动一：新增共享组件 `SelectedCreatorList`

新文件：`src/components/modules/skills/SelectedCreatorList.tsx`

- 输入：`creators: CreatorLibraryItem[]`（从 `creatorLibrary.ts` 解析得到，调用方传完整对象即可，避免重复 lookup）。
- 渲染：水平 flex-wrap 的小卡片，每张包含：
  - 头像（圆角 8px，36×36）
  - 主行：`name` + 性别/区域小标签
  - 副行：`@handle · followers 粉丝 · 均播 avgViews`
- 交互：点击卡片 → 该卡片就地"展开"，高度增长，露出：
  - `niche`（领域）
  - `region` 完整文本
  - 一句话简介（取 `creatorLibrary` 现有字段，无则隐藏）
  - 右上角"收起"按钮（再次点击卡片也可收起）
- 受控展开：组件内部维护 `expandedId`，同时只允许一张展开。
- 视觉沿用 `CreatorSelectionDialog` 的圆角/字号体系，确保与现有卡片一致。

> 不引入新依赖，不改 `creatorLibrary.ts` 数据结构。

---

## 改动二：SkillsModule 接入

文件：`src/components/modules/skills/SetupSummary.tsx`

- 把现有 `达人库 (N) @handle1、@handle2…` 单行文字替换为：
  - 上面保留 `Users` 图标 + `达人库 (N)` 小标题；
  - 下面一行用新的 `SelectedCreatorList` 渲染所有已选达人卡片；
  - 未选择时维持当前 `达人库未选择` 文案。
- 由于 `SetupSummary` 当前是横向 chip 容器，需将外层改为竖向 stack（其他字段 image/category/sellingPoints/memory 保留为顶部 chip 行，达人区域作为第二行）。

> 不动 `useSkillsEngine` 与 setup 数据流。

---

## 改动三：OranMed 接入

文件：`src/components/modules/ai-toolbox/oran-med/OranMed.tsx`

1. **`JumpToOranGenCard` 中的"达人"区块（约 1762–1786 行）**：
   - 移除当前的小圆头像 chip + `slice(0, 6)` 截断；
   - 改为渲染 `SelectedCreatorList`，由于 `CREATORS`（med 内）继承自 `creatorLibraryItems`，可直接通过 id 反查得到 `CreatorLibraryItem`，传给共享组件。
2. **`TaskMiniCard`（约 1518 行）页脚"X 位达人"**：
   - 保留汇总文字，但旁边新增最多 3 个达人的迷你头像堆叠（hover 时显示 name tooltip）。不展开，仅为概览；点击仍走原 `onClick`（打开任务详情）。
3. **发布计划页（约 2288 行 `creatorNames`）**：
   - 将拼接的姓名串改为 `SelectedCreatorList`，保持同样的"展开看全部信息"行为，方便用户在排期前最后确认达人。

> 不改 OranMed 任务数据结构、不动资产/计划逻辑。

---

## 不在范围内

- 不修改 `creatorLibrary.ts` 数据。
- 不改 `CreatorSelectionDialog`（选择阶段的弹窗）。
- 不增加新的后端字段或持久化。
- 不调整非 oran-med 来源的 SkillsModule 业务流。

---

## 技术细节

```text
SelectedCreatorList(creators)
 ├── 卡片 1 (collapsed)  [click → expandedId = id1]
 │      头像  name  handle  followers
 ├── 卡片 2 (expanded)
 │      头像  name  handle  followers
 │      ─────────────────────────────
 │      niche / region / 简介
 └── …
```

调用方负责把 id → CreatorLibraryItem 解析好（保持组件纯展示）。

请确认是否同意按此方案实施。
