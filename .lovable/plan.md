## 目标

当用户在 OranMed 的"无资产"流程中选择「让 OranGen 生成」时：
1. 在 OranMed 内上传商品白底图后，**带着达人信息 + 产品信息 + Brief 内容**直接跳转到 OranGen（Skills 模块）；
2. OranGen 中原本的「读取记忆库」步骤改为「读取 Brief 内容」；
3. 生成完成后的视频自动回流到 OranMed，作为资产用于发布。

---

## 改动一：扩展 OranGenPrefill 上下文

文件：`src/contexts/OranGenPrefillContext.tsx`

新增字段（保持向后兼容，均可选）：

```ts
export interface OranGenPrefill {
  attachmentIds: string[];
  attachmentNames: string[];
  category?: string;
  sellingPoints?: string;
  // 新增：来源回跳
  source?: 'oran-med';
  returnTaskId?: string;
  // 新增：Brief / 达人 / 产品
  brief?: {
    title: string; brandName: string; brandCategory: string;
    audience: string; goal: string; styleRequirements: string;
    brandTags: string; platform: string;
  };
  creators?: Array<{ id: string; name: string; avatar?: string; platform?: string }>;
  productImage?: { name: string; url: string };
}
```

---

## 改动二：OranMed 的「OranGen 生成」入口替换为"上传白底图 → 跳转"

文件：`src/components/modules/ai-toolbox/oran-med/OranMed.tsx`

- 当 `assetMode === 'orangen'` 且 `assets.length === 0` 时，不再渲染 `OranGenInlinePanel`；改为渲染一个紧凑卡片：
  - 显示当前 Brief 摘要（标签 chips + 平台 + 品牌）+ 已选达人头像；
  - 一个「上传商品白底图」上传区（沿用现有 `LocalUploadZone` 的样式，但限定单图）；
  - 上传完成后底部出现「前往 OranGen 生成 →」按钮；
  - 点击按钮：
    ```ts
    setOranGenPrefill({
      attachmentIds: [], attachmentNames: [],
      category: brief.brandCategory,
      sellingPoints: brief.brandTags,
      source: 'oran-med',
      returnTaskId: currentTask.id,
      brief, creators: selectedCreators, productImage,
    });
    onNavigate('skills');
    ```
- `WorkflowView` 需要拿到 `onNavigate`。从 `OranMed` 顶层注入（`AIToolboxModule.tsx` 已传 `onNavigate`）。
- 保留 `OranGenInlinePanel` 代码不删除，但 UI 入口暂不使用（防御性，未来可恢复）。

---

## 改动三：SkillsModule 中的"读取 Brief"模式

文件：`src/components/modules/skills/SkillsModule.tsx`

- `useEffect(consumeOranGenPrefill)` 中，如果 `prefill.source === 'oran-med'`，保存到本地状态：
  - `oranMedBrief`、`oranMedCreators`、`oranMedProductImage`、`returnTaskId`。
- 把 agent-02（"记忆库专家"）的描述与展示在 oran-med 来源时切换为：
  - 名称：`Brief 专家` / 描述：`你是一名 Brief 专家，需要根据上一步 OranMed 的 Brief（品牌：xxx · 卖点：xxx · 受众：xxx · 风格：xxx）和指定达人风格，提炼内容方向并为后续生成提供品牌一致性保障。`
  - 在 `getAgentDescriptions` 中根据是否存在 oran-med 来源切换文案；展示侧（agent 展开内容）显示 Brief 标签 + 达人卡片 + 产品白底图缩略图，替代原来的"记忆库条目"列表。
- 「读取记忆库」相关的 prefilledMemoryIds 流程在 oran-med 模式下跳过（不传 memory），改为传 brief 给后续 prompt 生成。

注：保持非 oran-med 来源的旧逻辑不变。

---

## 改动四：生成完成后回流到 OranMed

- 在 SkillsModule 的「视频生成完成」状态（`snapshot.generatedVideoUrl` 或同等字段）下，如果存在 `returnTaskId`，在结果卡片底部新增按钮：
  - `回到 OranMed 发布`
- 点击后：
  1. 调用 `OranMedContext` 新增的 `addAssetToTask(taskId, asset)`（asset 来源 `orangen`，`videoUrl` 指向生成结果，`creatorId` 依次分配给已选达人）；
  2. `onNavigate('oran-med')` 并通过 URL 参数 `?view=workflow&taskId=...` 让 OranMed 直接打开该任务的资产步骤。

文件改动：
- `src/components/modules/ai-toolbox/oran-med/context/OranMedContext.tsx`：新增 `addAssetToTask(taskId, asset)`（与现有 `addAsset` 同形，但允许指定 taskId，并在内部 setCurrentTask）。
- `src/components/modules/ai-toolbox/oran-med/OranMed.tsx`：解析 `taskId` 参数；如携带则进入 workflow 视图并跳到 `step='asset'`。

---

## 技术细节

```text
OranMed                                  Skills (OranGen)
─────────                                ─────────────────
无资产 → 选 OranGen                  
   │
   ▼
上传白底图 + 看到 Brief 摘要 + 达人
   │  (setOranGenPrefill, onNavigate)
   ▼
                                    ┌── 读取 Prefill ──┐
                                    ▼                 │
                                Agent-02 显示          │
                                "读取 Brief 内容"      │
                                    │                 │
                                    ▼                 │
                                生成视频               │
                                    │                 │
                                    ▼                 │
                          ┌── 回到 OranMed 发布 ──────┘
                          │  (addAssetToTask + navigate)
                          ▼
OranMed workflow asset 步骤显示新增视频 → 进入发布计划
```

---

## 不在范围内

- 不修改预测仿真（OranSimulation）流程。
- 不修改 OranMed 的「我已有资产」本地上传流程。
- 不持久化产品白底图到后端（仅 ObjectURL，刷新会丢失，保持与现状一致）。

请确认是否同意按以上方案实施。