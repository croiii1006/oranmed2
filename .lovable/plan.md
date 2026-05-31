# 计划：理顺三端逻辑 + 拆出独立达人端

## 一、三端逻辑梳理（输出文档）

新增 `docs/oran-med-three-end-flow.md`，把上传 demo 中混在一起的逻辑拆成清晰的状态机文档，作为后续开发蓝本。

三端职责：
- **品牌端（已存在 = 当前 OranMed）**：填 Brief → AI 推荐达人 → 勾选达人 → 选择内容资产 → 提交平台审核 → 查看回执与账单
- **平台端（暂不实现）**：审核任务、审核达人入驻、达人库管理、统一状态中心
- **达人端（本次新建）**：入驻认证 → 接任务 → 授权发布 → 查看积分/发布/账单

任务全局状态机（与 OranMed 现有 `TaskStatus` 对齐并扩展）：
```text
draft → reviewing → approved → [creator: accepted | rejected]
                              → [creator: publishAuthorized | publishRejected]
                              → published → billed
            └→ rejected
```

每个任务新增字段（写入 `oran-med:tasks:v2` 中的 `OranMedTask`）：
- `creatorResponses: Record<creatorId, { taskDecision, publishDecision, publishedAt?, points?, billAmount? }>`
- 不破坏现有字段，仅追加，老数据兼容。

达人入驻独立存储 `oran-med:creators:v1`：
- `{ creatorId, name, idNo, idPhoto, scanVerified, contractSigned, tiktokHandle, onboardingStatus: 'draft'|'submitted'|'approved'|'rejected' }`
- 与现有 `creatorLibrary` 通过 `creatorId` 关联。

## 二、新建独立达人端页面

### 路由
- 在 `src/App.tsx` 新增 `<Route path="/creator-portal" element={<CreatorPortal />} />`
- 不挂在 `ModuleProvider/AppShell` 下，渲染纯净的「达人 App」外壳（顶部品牌条 + 达人切换下拉 + 内容区）
- 移动端优先布局（max-width ~480px 居中），桌面端也可用

### 文件结构
```
src/pages/CreatorPortal.tsx                 // 入口，含达人切换 + 路由内 tab
src/components/creator-portal/
  CreatorPortalShell.tsx                    // 顶栏 + 达人选择器 + 状态徽标
  OnboardingSection.tsx                     // 基本信息/扫脸/合同/TikTok/提交入驻
  TaskInboxSection.tsx                      // 待确认任务列表（来自 oran-med:tasks:v2）
  TaskDetailDrawer.tsx                      // 接受/拒绝 + 同意/拒绝发布 + 内容预览
  CreatorStatsSection.tsx                   // 积分 / 发布 / 账单
  useCreatorPortalState.ts                  // 读写 localStorage、订阅 storage 事件
```

### 与现有系统联动
- `useCreatorPortalState` 直接读 `oran-med:tasks:v2`，筛选 `selectedCreatorIds` 含当前达人且 `status==='approved'` 的任务，作为「待确认任务」
- 达人「接受任务 / 同意发布」回写到任务的 `creatorResponses[currentCreatorId]`
- 监听 `window.storage` 事件，品牌端在另一标签页操作后达人端自动刷新
- 反向：在 `OranMedContext` 的状态展示里，新增一个 helper 读取 `creatorResponses` 用于将来在品牌端 "达人接受状态 / 发布授权 / 实际花费" 行展示真实数据（本次仅落字段，不强行改品牌端 UI，除非顺手能填）
- 达人切换：顶栏下拉来源 `creatorLibraryItems`（已被 OranMed 共用），URL 同步 `?creatorId=xxx` 便于分享

### 入驻流程（达人端独有）
完全照搬 demo 顺序，写入 `oran-med:creators:v1`：
1. 基本信息表单
2. 扫脸认证按钮（mock，置 `scanVerified=true`）
3. 签署合同（前置：扫脸完成）
4. 上传 TikTok 账号信息 + 提交入驻申请（前置：合同已签）
5. 状态徽标显示 `待入驻 / 已提交 / 已通过 / 已拒绝`（平台端暂未做，提供一个隐藏的"模拟通过"按钮便于演示，或在 OranMed 设置里加入口——本次只放在达人端右上角小齿轮内）

### 任务流程
- 列表项展示：任务标题、品牌、内容资产缩略、平台
- 操作：接受 / 拒绝任务 → 同意发布 / 拒绝发布 → 标记已发布 → 显示账单
- 所有动作仅修改 `creatorResponses`，不动任务主状态

## 三、技术细节

- 全部用现有 shadcn 组件 + 设计 token，不引入新依赖
- localStorage key 常量集中在 `src/components/creator-portal/storage.ts`，复用 OranMed 现有的 `STORAGE_KEY = 'oran-med:tasks:v2'`
- 类型：从 `oran-med/types.ts` 重新导出 `OranMedTask` 等，避免重复定义；在 `types.ts` 末尾追加 `CreatorResponse` 与 `CreatorOnboarding` 接口
- 不动品牌端 UI 与业务逻辑（除追加可选字段读取 helper）
- 不接 Cloud、不接 Auth

## 交付物
1. `docs/oran-med-three-end-flow.md`
2. 新路由 `/creator-portal` + 上述组件 + state hook
3. `oran-med/types.ts` 追加两个接口与可选字段
4. README 或 docs 链接里加一行入口说明
