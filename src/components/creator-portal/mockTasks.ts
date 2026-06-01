import type { OranMedTask } from '@/components/modules/ai-toolbox/oran-med/types';

const iso = (offsetHours: number) =>
  new Date(Date.now() - offsetHours * 3600 * 1000).toISOString();

export function buildCreatorMockTasks(creatorId: string): OranMedTask[] {
  return [
    // 1) 待接受
    {
      id: `mock_${creatorId}_pending`,
      status: 'approved',
      createdAt: iso(36),
      updatedAt: iso(2),
      brief: {
        title: '玻色因抗老精华 · 6 月种草',
        platform: 'TikTok',
        goal: '提升新品「玻色因精华」在 25-35 岁女性中的认知与加购',
        brandName: 'OranSkin',
        brandCategory: '护肤',
        brandTags: '抗老,成分',
        audience: '25-35 岁都市女性',
        expectedPublishDate: '2026-06-15',
        targetCreatorCount: 3,
        styleRequirements: '干货测评 / 真实体验',
        categoryRequirements: '护肤',
        budget: '1,500 USD',
      },
      briefSaved: true,
      selectedCreatorIds: [creatorId],
      assetMode: 'orangen',
      assets: [
        {
          id: `mock_${creatorId}_a1`,
          creatorId,
          title: '玻色因精华 30 天打卡脚本 v2',
          source: 'orangen',
          thumbnailColor: 'from-rose-300 to-orange-300',
          status: 'ready',
        },
      ],
      plan: [],
      planConfirmed: true,
      complianceConfirmed: true,
      creatorResponses: {
        [creatorId]: { taskDecision: 'pending', publishDecision: 'pending', updatedAt: iso(2) },
      },
    },
    // 2) 已接受，待同意发布
    {
      id: `mock_${creatorId}_publish`,
      status: 'approved',
      createdAt: iso(120),
      updatedAt: iso(12),
      brief: {
        title: '维生素 C 焕亮面膜 · 春季上新',
        platform: 'TikTok',
        goal: '配合新品上线，强调亮白与温和并存',
        brandName: 'OranGlow',
        brandCategory: '护肤',
        brandTags: '亮白,VC',
        audience: '20-30 岁女性',
        expectedPublishDate: '2026-06-08',
        targetCreatorCount: 2,
        styleRequirements: '日常 vlog / 上妆前后对比',
        categoryRequirements: '护肤',
        budget: '1,200 USD',
      },
      briefSaved: true,
      selectedCreatorIds: [creatorId],
      assetMode: 'orangen',
      assets: [
        {
          id: `mock_${creatorId}_a2`,
          creatorId,
          title: 'VC 面膜 · 7 天亮白对比脚本',
          source: 'orangen',
          thumbnailColor: 'from-amber-300 to-rose-300',
          status: 'ready',
        },
      ],
      plan: [],
      planConfirmed: true,
      complianceConfirmed: true,
      creatorResponses: {
        [creatorId]: { taskDecision: 'accepted', publishDecision: 'pending', updatedAt: iso(12) },
      },
    },
    // 3) 已发布 + 已结算
    {
      id: `mock_${creatorId}_done`,
      status: 'published',
      createdAt: iso(480),
      updatedAt: iso(48),
      brief: {
        title: '舒缓修护乳 · 敏感肌专场',
        platform: 'TikTok',
        goal: '强化敏感肌人群心智，沉淀口碑',
        brandName: 'OranCalm',
        brandCategory: '护肤',
        brandTags: '舒缓,修护',
        audience: '敏感肌人群',
        expectedPublishDate: '2026-05-20',
        targetCreatorCount: 4,
        styleRequirements: '真人成分讲解',
        categoryRequirements: '护肤',
        budget: '2,000 USD',
      },
      briefSaved: true,
      selectedCreatorIds: [creatorId],
      assetMode: 'local',
      assets: [
        {
          id: `mock_${creatorId}_a3`,
          creatorId,
          title: '舒缓修护乳 · 成分拆解视频',
          source: 'local',
          thumbnailColor: 'from-sky-300 to-emerald-300',
          status: 'ready',
        },
      ],
      plan: [],
      planConfirmed: true,
      complianceConfirmed: true,
      creatorResponses: {
        [creatorId]: {
          taskDecision: 'accepted',
          publishDecision: 'agreed',
          publishedAt: iso(48),
          points: 320,
          billAmount: 1800,
          updatedAt: iso(48),
        },
      },
    },
  ];
}
