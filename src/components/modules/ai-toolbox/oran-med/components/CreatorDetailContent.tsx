import {
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  BadgeCheck,
  AlertCircle,
  Ban,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Creator } from '../types';
import { cn } from '@/lib/utils';

function pct(v?: number) {
  return v == null ? '—' : `${(v * 100).toFixed(1)}%`;
}

function price(c: Creator) {
  if (c.reportedVideoPrice == null) return '—';
  const sym = c.currency === 'CNY' ? '¥' : c.currency === 'USD' ? '$' : '';
  return `${sym}${c.reportedVideoPrice.toLocaleString()}${c.currency ? ` ${c.currency}` : ''}`;
}

export function PortraitBadge({ status }: { status?: Creator['portraitLicenseStatus'] }) {
  if (!status) return null;
  const map = {
    authorized: { label: '已授权', cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30', Icon: ShieldCheck },
    pending: { label: '待授权', cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30', Icon: ShieldAlert },
    expired: { label: '已过期', cls: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30', Icon: ShieldX },
    unknown: { label: '未知', cls: 'text-muted-foreground bg-muted', Icon: ShieldAlert },
  } as const;
  const { label, cls, Icon } = map[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]', cls)}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

export function AccountBadge({ status }: { status?: Creator['accountStatus'] }) {
  if (!status) return null;
  const map = {
    available: { label: '可合作', cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30', Icon: BadgeCheck },
    paused: { label: '暂停', cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30', Icon: AlertCircle },
    banned: { label: '禁用', cls: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30', Icon: Ban },
  } as const;
  const { label, cls, Icon } = map[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]', cls)}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-[12px]">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 text-right text-foreground/85">{value ?? '—'}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/60 p-3">
      <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">{title}</div>
      <div className="divide-y divide-border/30">{children}</div>
    </div>
  );
}

export interface CreatorDetailContentProps {
  creator: Creator;
  showMatch?: boolean;
  showHeader?: boolean;
}

export function CreatorDetailContent({ creator, showMatch, showHeader = true }: CreatorDetailContentProps) {
  const c = creator;
  const tags = Array.from(
    new Set([...(c.contentCategories ?? []), ...(c.creatorTags ?? []), ...(c.contentStyleTags ?? [])]),
  );

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
            {c.avatarUrl ? <img src={c.avatarUrl} alt={c.name} className="h-full w-full object-cover" /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-base font-medium text-foreground">
              {c.name}
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                {c.tier}
              </Badge>
              <AccountBadge status={c.accountStatus} />
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              {c.profileUrl ? (
                <a
                  href={c.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-foreground/70 hover:text-foreground"
                >
                  {c.handle} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span>{c.handle}</span>
              )}
              <span className="text-muted-foreground/60">·</span>
              <span>{c.platform}</span>
            </div>
          </div>
        </div>
      )}

      {showMatch && c.matchReason ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-[12px] text-foreground/80">
          <div className="flex items-center gap-1.5 text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-medium">匹配度 {c.matchScore}%</span>
          </div>
          <div className="mt-1 text-muted-foreground">{c.matchReason}</div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Section title="基础身份">
          <Row label="国家 / 地区" value={c.country ? `${c.country}${c.accountRegion ? ` · ${c.accountRegion}` : ''}` : '—'} />
          <Row label="语言" value={c.languages?.join(' / ')} />
          <Row label="粉丝量" value={c.followers} />
          <Row label="活跃粉丝占比" value={pct(c.activeFollowerRatio)} />
          <Row label="近30天增长" value={pct(c.followerGrowthRate)} />
        </Section>

        <Section title="表现指标">
          <Row label="平均播放" value={c.avgPlay} />
          <Row label="互动率" value={pct(c.engagementRate)} />
          <Row label="完播率" value={pct(c.videoCompletionRate)} />
          <Row label="平均点赞 / 评论 / 分享" value={`${c.avgLikes ?? '—'} / ${c.avgComments ?? '—'} / ${c.avgShares ?? '—'}`} />
        </Section>

        <Section title="内容画像">
          <Row label="内容垂类" value={c.contentCategories?.join('、')} />
          <Row label="风格标签" value={c.contentStyleTags?.join('、')} />
          <Row label="声音风格" value={c.voiceStyle} />
          <Row label="口播语言 / 口音" value={`${c.voiceLanguage ?? '—'}${c.accent ? ` · ${c.accent}` : ''}`} />
        </Section>

        <Section title="商务 & 合规">
          <Row label="视频报价" value={price(c)} />
          <Row label="是否可议价" value={c.negotiable == null ? '—' : c.negotiable ? '可议价' : '不议价'} />
          <Row label="报价有效期" value={c.rateValidUntil ? `至 ${c.rateValidUntil}` : '—'} />
          <Row label="肖像授权" value={<PortraitBadge status={c.portraitLicenseStatus} />} />
          <Row label="账号状态" value={<AccountBadge status={c.accountStatus} />} />
        </Section>
      </div>

      {tags.length ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
        <Clock className="h-3 w-3" /> 数据更新于 {c.dataUpdatedAt ?? '—'}
      </div>
    </div>
  );
}
