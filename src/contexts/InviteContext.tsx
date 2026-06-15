import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useCredits } from './CreditsContext';

const STORAGE_KEY = 'oran.invite.v1';
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITER_REWARD = 30;
const INVITEE_REWARD = 50;
const DEFAULT_NEW_USER_CREDITS = 20;
const TOTAL_REWARD_LIMIT = 10;

export type InviteRecordStatus = 'rewarded' | 'capped' | 'failed';

export interface InviteRecord {
  id: string;
  inviteeName: string;
  registeredAt: string;
  status: InviteRecordStatus;
  inviterCredits: number;
  inviteeCredits: number;
}

interface InvitePersisted {
  inviteCode: string;
  rewardedCount: number;
  totalEarnedCredits: number;
  records: InviteRecord[];
}

interface InviteContextValue {
  inviteCode: string;
  inviteUrl: string;
  shareText: string;
  rewardedCount: number;
  totalEarnedCredits: number;
  invitedCount: number;
  records: InviteRecord[];
  rewardLimit: number;
  inviterReward: number;
  inviteeReward: number;
  defaultNewUserCredits: number;
  remainingRewards: number;
  isCapped: boolean;
  simulateInvite: (name?: string) => InviteRecord;
  validateCode: (code: string) => 'valid' | 'invalid' | 'empty';
  reset: () => void;
}

const InviteContext = createContext<InviteContextValue | null>(null);

function generateCode(): string {
  let s = '';
  for (let i = 0; i < 8; i++) s += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  return s;
}

function loadInitial(): InvitePersisted {
  if (typeof window === 'undefined') {
    return { inviteCode: generateCode(), rewardedCount: 0, totalEarnedCredits: 0, records: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as InvitePersisted;
      if (parsed.inviteCode) return parsed;
    }
  } catch {
    // ignore
  }
  const init: InvitePersisted = {
    inviteCode: generateCode(),
    rewardedCount: 0,
    totalEarnedCredits: 0,
    records: [],
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
  } catch {
    // ignore
  }
  return init;
}

const SAMPLE_NAMES = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Robin'];

export function InviteProvider({ children }: { children: ReactNode }) {
  const { addGift } = useCredits();
  const [state, setState] = useState<InvitePersisted>(() => loadInitial());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const inviteUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://toolbox.oran.cn';
    return `${origin}/register?invite_code=${state.inviteCode}`;
  }, [state.inviteCode]);

  const shareText = useMemo(
    () =>
      `【OranAI】AI 营销工具箱，帮你快速生成市场洞察、营销策划、图片素材和视频内容。\n通过我的邀请链接注册，可获得 ${INVITEE_REWARD} 免费积分：\n${inviteUrl}\n点击链接直接打开，或复制到浏览器中打开。`,
    [inviteUrl],
  );

  const simulateInvite = useCallback(
    (name?: string): InviteRecord => {
      const inviteeName = name?.trim() || SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
      let newRecord!: InviteRecord;
      setState(prev => {
        const capped = prev.rewardedCount >= TOTAL_REWARD_LIMIT;
        if (capped) {
          newRecord = {
            id: crypto.randomUUID(),
            inviteeName,
            registeredAt: new Date().toISOString(),
            status: 'capped',
            inviterCredits: 0,
            inviteeCredits: DEFAULT_NEW_USER_CREDITS,
          };
          return { ...prev, records: [newRecord, ...prev.records] };
        }
        newRecord = {
          id: crypto.randomUUID(),
          inviteeName,
          registeredAt: new Date().toISOString(),
          status: 'rewarded',
          inviterCredits: INVITER_REWARD,
          inviteeCredits: INVITEE_REWARD,
        };
        return {
          ...prev,
          rewardedCount: prev.rewardedCount + 1,
          totalEarnedCredits: prev.totalEarnedCredits + INVITER_REWARD,
          records: [newRecord, ...prev.records],
        };
      });
      if (newRecord!.status === 'rewarded') {
        addGift(INVITER_REWARD, `邀请奖励 · ${inviteeName} 注册成功`);
      }
      return newRecord!;
    },
    [addGift],
  );

  const validateCode = useCallback(
    (code: string): 'valid' | 'invalid' | 'empty' => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return 'empty';
      if (trimmed === state.inviteCode) return 'valid';
      // demo: accept any 8-char alphanumeric as "valid" structure but mark unknown as invalid
      if (/^[A-Z0-9]{8}$/.test(trimmed)) return 'invalid';
      return 'invalid';
    },
    [state.inviteCode],
  );

  const reset = useCallback(() => {
    const fresh: InvitePersisted = {
      inviteCode: generateCode(),
      rewardedCount: 0,
      totalEarnedCredits: 0,
      records: [],
    };
    setState(fresh);
  }, []);

  const value: InviteContextValue = {
    inviteCode: state.inviteCode,
    inviteUrl,
    shareText,
    rewardedCount: state.rewardedCount,
    totalEarnedCredits: state.totalEarnedCredits,
    invitedCount: state.records.length,
    records: state.records,
    rewardLimit: TOTAL_REWARD_LIMIT,
    inviterReward: INVITER_REWARD,
    inviteeReward: INVITEE_REWARD,
    defaultNewUserCredits: DEFAULT_NEW_USER_CREDITS,
    remainingRewards: Math.max(0, TOTAL_REWARD_LIMIT - state.rewardedCount),
    isCapped: state.rewardedCount >= TOTAL_REWARD_LIMIT,
    simulateInvite,
    validateCode,
    reset,
  };

  return <InviteContext.Provider value={value}>{children}</InviteContext.Provider>;
}

export function useInvite() {
  const ctx = useContext(InviteContext);
  if (!ctx) throw new Error('useInvite must be used within InviteProvider');
  return ctx;
}
