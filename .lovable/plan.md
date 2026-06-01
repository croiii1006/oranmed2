## 目标
当前展开卡片把 12 个字段一视同仁地按 `label · value` 平铺，重要数据（粉丝/均播/互动/完播/报价）淹没在一堆次要字段里。按"重要级别"重排版面，让一眼能抓到的指标先出现，次要的画像/风格信息退到底部。

## 信息层级

**L1 — 身份头部（已有）**：头像、姓名、海外·女、handle
保持现状。

**L2 — 核心数据（Hero metrics）**
- 粉丝 `124.8K`
- 均播 `14.6万`

用 2 列大数字网格呈现：数值用 `15-16px font-semibold tracking-tight`，下方 `10px text-muted` 小标签。视觉上明显比下面的指标重。

**L3 — 表现指标（KPI row）**
- 互动 `5.8%`
- 完播 `69%`
- 报价 `$3.7k`

3 列等宽小卡，`12px` 数值 + `10px` 标签，背景 `bg-muted/30 rounded-md`，让它们成一组。

**L4 — 画像标签（Meta）**
- 领域：彩妆教程
- 地区：AU
- 画像：KOC · TikTok · 美国 · English

合并成一行 chip 流：`[彩妆教程] [AU] [KOC] [TikTok] [English]`，淡灰底圆角小标签，不再用 label/value 两列。

**L5 — 风格 & 账号（Footer）**
- 风格：开箱、口播
- 账号：@chloe.makeupbook

最弱化：`10px text-muted-foreground/70`，单行截断，紧贴底部。账号其实头部已有，可直接删除这一行。

## 视觉示意

```text
┌──────────────────────────────┐
│ [img] Chloe Sim…  海外·女  × │
│       @chloe.makeupbook      │
├──────────────────────────────┤
│   124.8K            14.6万   │   ← L2 hero
│   粉丝              均播      │
├──────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌──────┐    │   ← L3 KPI
│ │5.8% │ │ 69% │ │$3.7k │    │
│ │互动 │ │完播 │ │报价  │    │
│ └─────┘ └─────┘ └──────┘    │
│                              │
│ 彩妆教程·AU·KOC·TikTok·EN   │   ← L4 chips
│                              │
│ 开箱、口播                    │   ← L5 footer
└──────────────────────────────┘
```

## 改动点
- `src/components/modules/skills/SelectedCreatorList.tsx`：展开区从单一 `DetailRow` 列表，改为三段式（Hero / KPI / Meta+Footer）。新增可选 props 让调用方传入分组数据，或在内部按字段语义分组渲染。
- `src/components/modules/ai-toolbox/oran-med/OranMed.tsx`：调整 `extraDetails` 结构以匹配新分组（hero / kpi / meta / footer），不再扁平传 7 行。
- skills 模块其他调用方（`SetupSummary.tsx`）保持向后兼容：未传分组数据时回退到旧的 `DetailRow` 列表。

## 范围外
- 不改折叠态的卡片样式
- 不改 CreatorDetailDialog
- 不改数据源
