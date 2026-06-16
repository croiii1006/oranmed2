export type StageStatus = 'locked' | 'active' | 'done';

export type ReviewStatus = 'pending' | 'reviewing' | 'approved';

export interface OnboardingFlowState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  // Stage 1
  tiktokConnected: boolean;
  // Stage 2
  fullName: string;
  country: string;
  idType: string;
  paypalEmail: string;
  idFileName: string;
  tosAccepted: boolean;
  // Stage 3
  rate: string;
  flexRange: string;
  // Stage 4
  reviewStatus: ReviewStatus;
  // Stage 5
  contractAccepted: boolean;
  contractSigned: boolean;
  contractSignedAt?: string;
}

export const initialFlowState: OnboardingFlowState = {
  currentStep: 1,
  tiktokConnected: false,
  fullName: '',
  country: '',
  idType: '',
  paypalEmail: '',
  idFileName: '',
  tosAccepted: false,
  rate: '',
  flexRange: '20',
  reviewStatus: 'pending',
  contractAccepted: false,
  contractSigned: false,
};

export const STEPS = [
  { id: 1, label: '授权与数据', desc: 'TikTok 授权，同步数据' },
  { id: 2, label: '资质提交', desc: '证件 · 税务 · 收款 · 服务条款' },
  { id: 3, label: '报价设置', desc: '期望报价与浮动范围' },
  { id: 4, label: '平台审核', desc: '等待运营审核通过' },
  { id: 5, label: '合同签署', desc: '动态合同电子签名' },
] as const;

// Mock TikTok profile (synced after OAuth)
export const MOCK_TIKTOK_PROFILE = {
  handle: '@aria.chen',
  name: 'Aria Chen',
  bio: 'Beauty & Lifestyle Creator · NYC',
  openId: 'ou_8a2c7b4d1e5f9036',
  followers: 248_300,
  totalLikes: 4_120_000,
  videoCount: 312,
  engagement: '6.8%',
  avgViews: 184_500,
  avgLikes: 12_400,
  following: 286,
  vertical: ['美妆', '生活方式', '穿搭'],
  health: { status: '良好', violations: 0, compliance: '100%' },
};
