import { ArrowRight, Music2, Sparkles, Users, Heart, Video, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StageShell } from '../StageShell';
import { MOCK_TIKTOK_PROFILE } from '../types';
import type { OnboardingFlowState } from '../types';

interface Props {
  state: OnboardingFlowState;
  patch: (p: Partial<OnboardingFlowState>) => void;
  onNext: () => void;
}

export function Stage1Auth({ state, patch, onNext }: Props) {
  const p = MOCK_TIKTOK_PROFILE;

  return (
    <StageShell
      index="01"
      title="授权与数据同步"
      subtitle="绑定 TikTok 账号，自动同步您的创作者数据"
      badge={
        state.tiktokConnected
          ? { label: '已绑定', tone: 'success' }
          : { label: '进行中', tone: 'active' }
      }
    >
      {/* OAuth trigger */}
      <button
        type="button"
        disabled={state.tiktokConnected}
        onClick={() => patch({ tiktokConnected: true })}
        className={cn(
          'group flex w-full items-center gap-4 rounded-xl border bg-muted/30 px-5 py-4 text-left transition-all duration-300',
          state.tiktokConnected
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-border hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/5 hover:shadow-sm',
        )}
      >
        <div className={cn(
          'flex h-11 w-11 items-center justify-center rounded-lg transition-colors',
          state.tiktokConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-foreground/5 text-foreground/80 group-hover:bg-accent/10 group-hover:text-accent',
        )}>
          <Music2 className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground">
            绑定 TikTok 账号 <span className="ml-1 text-accent">*</span>
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            通过 TikTok 开放平台 OAuth 授权，自动同步粉丝、互动率等核心数据
          </div>
        </div>
        <span className={cn(
          'rounded-full border px-2.5 py-1 text-[10.5px] font-medium',
          state.tiktokConnected
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
            : 'border-border bg-card text-muted-foreground',
        )}>
          {state.tiktokConnected ? '✓ 已绑定' : '未绑定'}
        </span>
      </button>

      {state.tiktokConnected && (
        <div className="mt-7 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
            <h3 className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              数据画像 · 来自 TikTok
            </h3>
          </div>

          {/* Creator profile header */}
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-gradient-to-br from-muted/30 to-transparent px-5 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-base font-medium text-accent">
              A
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-medium text-foreground">{p.name}</div>
              <div className="text-[11.5px] text-muted-foreground">{p.bio}</div>
              <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground/70">{p.openId}</div>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-medium text-emerald-600">
              ✓ 已绑定
            </span>
          </div>

          {/* Metric grid */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            <Metric icon={Users} label="粉丝数" value={fmt(p.followers)} />
            <Metric icon={Heart} label="总获赞" value={fmt(p.totalLikes)} />
            <Metric icon={Video} label="视频数" value={p.videoCount.toString()} />
            <Metric icon={TrendingUp} label="互动率" value={p.engagement} />
            <Metric label="平均播放 (30d)" value={fmt(p.avgViews)} />
            <Metric label="平均点赞 (30d)" value={fmt(p.avgLikes)} />
            <Metric label="关注数" value={p.following.toString()} />
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
              <div className="text-[10px] text-muted-foreground">内容垂直领域</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {p.vertical.map((v) => (
                  <span key={v} className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Health bar */}
          <div className="mt-4 flex items-center gap-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-[11.5px]">
            <HealthItem label="账号状态" value={`✓ ${p.health.status}`} />
            <span className="h-3 w-px bg-border" />
            <HealthItem label="违规记录" value={p.health.violations.toString()} />
            <span className="h-3 w-px bg-border" />
            <HealthItem label="内容合规率" value={p.health.compliance} />
          </div>

          <div className="mt-7 flex justify-end">
            <Button onClick={onNext} className="group gap-1.5">
              下一步
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      )}
    </StageShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" strokeWidth={1.5} />}
        {label}
      </div>
      <div className="mt-1 text-[15px] font-medium tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function HealthItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground/90">{value}</span>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}
