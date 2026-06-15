## 目标
基于 PRD v1.1 在前端实现「邀请好友」功能 demo（UI + 本地状态联动，无后端）。覆盖核心：邀请码生成、链接/文案复制、奖励规则展示、剩余额度、邀请记录、注册页 invite_code 带入与校验。

## 范围
- 实现：邀请好友入口 + 弹窗、邀请码与链接复制、奖励规则与剩余额度、邀请记录（mock）、模拟"邀请成功"按钮触发积分增加与计数；演示注册页（含邀请码字段）。
- 不实现：真实注册/积分后端、渠道分销互斥后端、风控、运营后台、每日上限。

## 改动一览

### 1. 新增邀请相关 context 与 mock 数据
- `src/contexts/InviteContext.tsx`
  - `inviteCode`（首次进入弹窗时懒生成，存 localStorage，8 位大写字母数字）
  - `inviteUrl = ${origin}/register?invite_code=${inviteCode}`
  - `invitedCount`、`rewardedCount`（≤10）、`totalEarnedCredits`
  - `inviteRecords[]`：{ id, inviteeName, registeredAt, status: 'rewarded' | 'capped' | 'failed', credits }
  - `simulateInvite(name)`：mock 新增一条记录，未达上限时 +30 积分到 CreditsContext 并 rewardedCount++；达上限后记录 status='capped'
  - 所有状态 persist 到 localStorage

### 2. TopNav 新增"邀请好友"入口
- `src/components/layout/TopNav.tsx`
  - 在「记忆库」按钮左侧新增按钮：`<Gift /> 邀请好友`（橙色 `hsl(20 95% 55%)` 描边，呼应站内 CTA 色）
  - 点击打开 `InviteDialog`

### 3. 新增 InviteDialog 组件
- `src/components/invite/InviteDialog.tsx`
  - 头部：标题「邀请好友 · 双方得积分」+ 说明
  - 区块 A：奖励规则卡片（好友注册成功，你得 30 积分、好友得 50 积分；每人累计最多 10 次邀请奖励）
  - 区块 B：你的专属邀请码（大字号显示 + 复制按钮）
  - 区块 C：邀请链接（input + 复制按钮）
  - 区块 D：分享文案（textarea + 一键复制完整文案，文案按 PRD 5.4 模板）
  - 区块 E：剩余额度进度条 `rewardedCount / 10`，累计获得积分
  - 区块 F：邀请记录列表（最近 N 条，含状态 badge：已奖励 / 已达上限 / 失败）
  - 区块 G（demo 用）：「模拟好友注册成功」按钮 → 调 simulateInvite
  - 区块 H：底部小字「使用邀请码注册的好友不会被绑定到渠道来源」（PRD 4.2 互斥说明）
  - 颜色：主 CTA 使用项目橙 `hsl(20 95% 55%)`，与现有按钮风格一致

### 4. 新增注册页 demo（路由 `/register`）
- `src/pages/RegisterDemo.tsx` + 在 `src/App.tsx` 注册路由
- 字段：邮箱、密码、邀请码（选填）
- 进入时读取 URL `?invite_code=xxx` 自动填充并显示绿色「已识别邀请人邀请码，注册成功你将获得 50 积分」
- 邀请码格式校验：8 位字母数字；若不匹配本地 `inviteCode`，提交时显示「邀请码无效，可清空后继续注册」（不阻塞）
- 提交按钮：mock 注册成功 → 跳回 toolbox 并 toast 提示获得积分
- 顶部说明该页为 demo，仅用于展示 PRD 5.3 链路

### 5. 复制交互
- 统一使用 `navigator.clipboard.writeText` + `toast` 提示「已复制」

### 6. 国际化
- 在 `public/locales/zh/*` 与 `en/*` 中添加 invite 相关 key（若项目使用 i18n 文件结构）；或在组件内提供 zh/en 两套文案沿用现有 t() 模式。先以中文为主，英文做基本翻译。

## 技术细节
- 邀请码生成：`Array.from({length:8}, () => CHARSET[rand]).join('')`，CHARSET = `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`（去掉易混淆字符）
- localStorage key：`oran.invite.v1`
- 与 `CreditsContext` 联动：在 simulateInvite 内调用其新增 `addCredits(amount, reason)`；若 context 没有此方法，扩展一个安全 setter。
- 弹窗使用项目已有的 `Dialog` shadcn 组件 + 现有设计 token（`bg-card`、`border-border`、`text-foreground`、`text-muted-foreground`），主 CTA 用项目橙色。
- 注册页 demo 不接入 Auth，仅前端模拟。

## 验收
1. 点击顶部"邀请好友"打开弹窗，首次自动生成邀请码并展示。
2. 复制邀请码 / 链接 / 文案三个按钮均能复制并 toast 提示。
3. 点击"模拟好友注册成功"：剩余次数 10→9，积分 +30，记录新增一条 status=已奖励。连续 10 次后第 11 次记录 status=已达上限，积分不增加。
4. 在浏览器打开 `/register?invite_code=<本地邀请码>`：邀请码字段自动带入并出现绿色识别提示。
5. 邀请码字段手动改为乱码提交：显示「邀请码无效」提示但不阻塞。
6. 刷新页面，邀请码、计数、记录持久化保留。