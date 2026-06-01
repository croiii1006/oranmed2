import { ShieldCheck, FileSignature, Send, RotateCcw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CreatorLibraryItem } from '@/components/modules/skills/creatorLibrary';
import type {
  CreatorOnboarding,
  CreatorOnboardingStatus,
} from '@/components/modules/ai-toolbox/oran-med/types';

const STATUS_LABEL: Record<CreatorOnboardingStatus, string> = {
  draft: '待入驻',
  submitted: '审核中',
  approved: '已通过',
  rejected: '已拒绝',
};

const STATUS_TONE: Record<CreatorOnboardingStatus, string> = {
  draft: 'bg-muted/60 text-muted-foreground',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
};

interface Props {
  creator: CreatorLibraryItem;
  onboarding: CreatorOnboarding;
  onReset: () => void;
}

export function CreatorProfileCard({ creator, onboarding, onReset }: Props) {
  const steps = [
    { icon: ShieldCheck, label: '扫脸认证', done: onboarding.scanVerified },
    { icon: FileSignature, label: '合同签署', done: onboarding.contractSigned },
    {
      icon: Send,
      label: '入驻提交',
      done:
        onboarding.onboardingStatus === 'approved' ||
        onboarding.onboardingStatus === 'submitted',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/40 bg-muted/30 p-5 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-accent/20 to-transparent blur-2xl" />

      {/* Profile head */}
      <div className="relative flex items-start gap-3">
        <Avatar className="h-14 w-14 ring-2 ring-white/60">
          <AvatarImage src={creator.avatarUrl} alt={creator.name} />
          <AvatarFallback>{creator.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-medium text-foreground">{creator.name}</div>
            <Badge
              variant="secondary"
              className={cn(
                'shrink-0 border-0 text-[10px]',
                STATUS_TONE[onboarding.onboardingStatus],
              )}
            >
              {STATUS_LABEL[onboarding.onboardingStatus]}
            </Badge>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{creator.handle}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-muted-foreground">
            <span>{creator.region}</span>
            <span className="text-border">·</span>
            <span>{creator.niche}</span>
            <span className="text-border">·</span>
            <span>{creator.followers}</span>
          </div>
        </div>
      </div>

      {/* Onboarding steps */}
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {steps.map((s) => (
          <div
            key={s.label}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[10px]',
              s.done
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-border/60 bg-card text-muted-foreground',
            )}
          >
            <s.icon className="h-3.5 w-3.5" />
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Identity info — always visible */}
      <div className="mt-4 rounded-xl border border-border/60 bg-card/80 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-foreground">认证资料</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
            onClick={onReset}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            重置
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
          <Row label="姓名" value={onboarding.name} />
          <Row label="出生年月" value={onboarding.birth} />
          <Row label="国家" value={onboarding.country} />
          <Row label="城市" value={onboarding.city} />
          <Row label="证件号" value={onboarding.idNo} />
          <Row label="证件照" value={onboarding.idPhoto} />
          <Row label="TikTok" value={onboarding.tiktokHandle} full />
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value, full }: { label: string; value?: string; full?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-0.5', full && 'col-span-2')}>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</dt>
      <dd className="truncate text-foreground">{value || '—'}</dd>
    </div>
  );
}
