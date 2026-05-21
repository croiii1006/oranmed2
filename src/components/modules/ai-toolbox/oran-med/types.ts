export type Platform = '小红书' | '抖音' | 'B站' | '微博';

export const PLATFORMS: Platform[] = ['小红书', '抖音', 'B站', '微博'];

export interface Brief {
  title: string;
  platform: Platform;
  goal: string;
  brandName: string;
  brandCategory: string;
  brandTags: string;
  audience: string;
  expectedPublishDate: string;
  targetCreatorCount: number;
  styleRequirements: string;
  categoryRequirements: string;
  budget: string;
}

export type CreatorTier = 'KOL' | 'KOC';

export interface Creator {
  id: string;
  name: string;
  tier: CreatorTier;
  platform: Platform;
  handle: string;
  followers: string;
  avgPlay: string;
  tags: string[];
  matchScore: number;
  matchReason: string;
  avatarUrl?: string;
}

export type AssetSource = 'local' | 'orangen';

export interface ContentAsset {
  id: string;
  creatorId: string;
  title: string;
  source: AssetSource;
  thumbnailColor: string; // gradient class for placeholder
  status: 'ready' | 'generating' | 'pending';
}

export interface PublishPlanItem {
  assetId: string;
  creatorId: string;
  platform: Platform;
  scheduledAt: string;
  caption: string;
  hashtags: string;
  paidPromotion: boolean;
}

export type TaskStatus =
  | 'draft'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'published';

export const STATUS_LABEL: Record<TaskStatus, string> = {
  draft: '草稿',
  reviewing: '审核中',
  approved: '已通过',
  rejected: '已拒绝',
  published: '已发布',
};

export const STATUS_TONE: Record<TaskStatus, string> = {
  draft: 'bg-muted/40 text-muted-foreground',
  reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  published: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
};

export interface OranMedTask {
  id: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  brief: Brief;
  briefSaved: boolean;
  selectedCreatorIds: string[];
  assetMode: AssetSource | null;
  assets: ContentAsset[];
  plan: PublishPlanItem[];
  planConfirmed: boolean;
  complianceConfirmed: boolean;
}

export const emptyBrief = (): Brief => ({
  title: '',
  platform: '小红书',
  goal: '',
  brandName: '',
  brandCategory: '',
  brandTags: '',
  audience: '',
  expectedPublishDate: '',
  targetCreatorCount: 3,
  styleRequirements: '',
  categoryRequirements: '',
  budget: '',
});

export const newDraftTask = (): OranMedTask => {
  const now = new Date().toISOString();
  return {
    id: `task_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    brief: emptyBrief(),
    briefSaved: false,
    selectedCreatorIds: [],
    assetMode: null,
    assets: [],
    plan: [],
    planConfirmed: false,
    complianceConfirmed: false,
  };
};
