import { useMemo, useState } from 'react';
import { ChevronDown, X, Film, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreatorLibraryItem } from './creatorLibrary';
import type { CandidateVideo } from './useSkillsEngine';
import { CREATORS } from '@/components/modules/ai-toolbox/oran-med/data/creators';
import { CreatorDetailDialog } from '@/components/modules/ai-toolbox/oran-med/components/CreatorDetailDialog';

export interface CreatorExtraDetail {
  label: string;
  value: string;
}

export interface CreatorStructuredDetails {
  /** 2-column big metrics (e.g. 粉丝、均播) */
  hero?: CreatorExtraDetail[];
  /** Small KPI tiles (e.g. 互动、完播、报价) */
  kpi?: CreatorExtraDetail[];
  /** Inline chips (e.g. 领域、地区、画像) — values only, no labels */
  chips?: string[];
  /** Footer faint text (e.g. 风格) */
  footer?: string;
}

interface SelectedCreatorListProps {
  creators: CreatorLibraryItem[];
  className?: string;
  candidateVideos?: CandidateVideo[];
  bindings?: Record<string, string>;
  /** Legacy flat detail rows, used as fallback when no structured data */
  extraDetails?: Record<string, CreatorExtraDetail[]>;
  /** Structured details, grouped by visual importance */
  structuredDetails?: Record<string, CreatorStructuredDetails>;
}

export function SelectedCreatorList({
  creators,
  className,
  candidateVideos = [],
  bindings = {},
  extraDetails,
  structuredDetails,
}: SelectedCreatorListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailCreator = useMemo(
    () => (detailId ? CREATORS.find((c) => c.id === detailId) ?? null : null),
    [detailId],
  );

  if (creators.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-start gap-2', className)}>
      {creators.map((c) => {
        const expanded = expandedId === c.id;
        const territory =
          c.region.trim().toUpperCase() === 'CN' || c.region.includes('中国') ? '中国' : '海外';
        const genderLabel = c.gender === 'female' ? '女' : '男';
        const boundVideoId = bindings[c.id];
        const boundVideo = boundVideoId ? candidateVideos.find((v) => v.id === boundVideoId) : null;
        const sd = structuredDetails?.[c.id];

        return (
          <div
            key={c.id}
            className={cn(
              'group relative flex w-[244px] flex-col rounded-xl border bg-background/80 px-2.5 py-2 text-left align-top transition-all',
              expanded
                ? 'border-foreground/25 bg-foreground/[0.02] shadow-sm'
                : 'border-border/40 hover:border-foreground/15 hover:bg-muted/30',
            )}
          >
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : c.id)}
              className="flex items-start gap-2 pr-7 text-left focus-visible:outline-none"
            >
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img src={c.avatarUrl} alt={c.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium text-foreground">{c.name}</div>
                <div className="mt-0.5 truncate text-[10px] text-muted-foreground/80">
                  {c.handle}
                </div>
                <div className="mt-0.5 truncate text-[9.5px] text-muted-foreground/60">
                  {territory}·{genderLabel} · {c.followers} 粉丝
                </div>
              </div>
            </button>

            {/* Three-dot — open full creator detail dialog */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDetailId(c.id);
              }}
              className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-60 shadow-sm backdrop-blur transition-opacity hover:text-foreground hover:opacity-100 focus-visible:opacity-100"
              aria-label="查看达人详情"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            {/* Bound video chip */}
            {boundVideo && (
              <div className="mt-1.5 flex items-center gap-1 truncate rounded-md bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] text-foreground/70">
                <Film className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                <span className="truncate">复刻：{boundVideo.title}</span>
              </div>
            )}

            {expanded ? (
              sd ? (
                <div className="mt-2.5 space-y-2.5 border-t border-border/40 pt-2.5">
                  {/* L2 Hero */}
                  {sd.hero && sd.hero.length > 0 ? (
                    <div
                      className={cn(
                        'grid gap-2',
                        sd.hero.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
                      )}
                    >
                      {sd.hero.map((h) => (
                        <div key={h.label} className="min-w-0">
                          <div className="truncate text-[15px] font-semibold leading-none tracking-tight text-foreground">
                            {h.value}
                          </div>
                          <div className="mt-1 text-[10px] text-muted-foreground/70">{h.label}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* L3 KPI tiles */}
                  {sd.kpi && sd.kpi.length > 0 ? (
                    <div
                      className="grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${sd.kpi.length}, minmax(0, 1fr))` }}
                    >
                      {sd.kpi.map((k) => (
                        <div
                          key={k.label}
                          className="min-w-0 rounded-md bg-muted/40 px-1.5 py-1 text-center"
                        >
                          <div className="truncate text-[11.5px] font-medium leading-none text-foreground/90">
                            {k.value}
                          </div>
                          <div className="mt-0.5 text-[9px] text-muted-foreground/70">{k.label}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* L4 Chips */}
                  {sd.chips && sd.chips.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {sd.chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full bg-muted/60 px-1.5 py-px text-[9.5px] text-muted-foreground"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* L5 Footer */}
                  {sd.footer ? (
                    <div className="truncate text-[10px] text-muted-foreground/70">{sd.footer}</div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-2.5 space-y-1 border-t border-border/40 pt-2 text-[11px] text-foreground/80">
                  <DetailRow label="领域" value={c.niche} />
                  <DetailRow label="地区" value={c.region} />
                  <DetailRow label="粉丝" value={c.followers} />
                  <DetailRow label="均播" value={c.avgViews} />
                  <DetailRow label="账号" value={c.handle} />
                  {extraDetails?.[c.id]?.map((d) => (
                    <DetailRow key={d.label} label={d.label} value={d.value} />
                  ))}
                </div>
              )
            ) : null}

            {expanded ? (
              <button
                type="button"
                onClick={() => setExpandedId(null)}
                className="mt-2 self-end text-[10px] text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                收起
              </button>
            ) : null}
          </div>
        );
      })}
      <CreatorDetailDialog
        creator={detailCreator}
        open={Boolean(detailCreator)}
        onOpenChange={(o) => { if (!o) setDetailId(null); }}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-9 shrink-0 text-[10px] text-muted-foreground/70">{label}</span>
      <span className="min-w-0 flex-1 truncate text-foreground/85">{value}</span>
    </div>
  );
}
