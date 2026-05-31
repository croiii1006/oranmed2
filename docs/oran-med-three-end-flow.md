# OranMed 三端协作流程

整理自 `oranmed-three-end-demo.html`，作为后续开发蓝本。

## 三端职责

| 端 | 当前实现 | 主要职责 |
|---|---|---|
| 品牌端 | ✅ `/ai-toolbox/oran-med` | 填 Brief → AI 推荐达人 → 勾选达人 → 选择内容资产 → 提交审核 → 查看回执 / 账单 |
| 平台端 | ⏸ 暂不实现 | 审核任务 / 审核入驻 / 达人库管理 / 统一状态中心 |
| 达人端 | ✅ `/creator-portal` | 入驻认证 → 接任务 → 授权发布 → 查看积分 / 发布 / 账单 |

## 任务全局状态机

```text
draft ──submit──► reviewing ──approve──► approved ─┐
                       │                            ├─ creatorResponses[creatorId]:
                       └──reject──► rejected        │     taskDecision: pending|accepted|rejected
                                                    │     publishDecision: pending|agreed|rejected
                                                    │     publishedAt? points? billAmount?
                                                    │
                                                    └──► published ──► billed
```

- 任务主状态由品牌端 / 平台端控制，写入 `OranMedTask.status`。
- 每个被选达人独立维护一份 `CreatorResponse`，写入 `OranMedTask.creatorResponses[creatorId]`，互不影响。
- 任务在所有达人确认发布后，再由平台端推进到 `published`（本次未实现）。

## 达人入驻状态机

```text
draft ─info─► scanVerified ─sign─► contractSigned ─tiktok─► submitted ──► approved | rejected
```

- 存储在 `localStorage` key `oran-med:creators:v1`，按 `creatorId` 索引。
- 当前演示阶段，平台端审核未实现，达人端右上角设置提供「模拟通过 / 模拟拒绝」按钮。

## 存储约定

| key | 写入方 | 读取方 |
|---|---|---|
| `oran-med:tasks:v2` | 品牌端（OranMedContext）、达人端（creatorResponses） | 双方 |
| `oran-med:current:v2` | 品牌端 | 品牌端 |
| `oran-med:creators:v1` | 达人端 | 达人端（未来平台端） |

两端通过 `window.storage` 事件实现跨标签页自动刷新。

## 达人端 URL

- `/creator-portal` — 默认使用 `creatorLibraryItems[0]`
- `/creator-portal?creatorId=xxx` — 指定达人，便于演示切换
