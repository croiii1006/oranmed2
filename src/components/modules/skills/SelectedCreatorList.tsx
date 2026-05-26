import { useState } from 'react';
import { ChevronDown, X, Film, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreatorLibraryItem } from './creatorLibrary';
import type { CandidateVideo } from './useSkillsEngine';

interface SelectedCreatorListProps {
  creators: CreatorLibraryItem[];
  className?: string;
  candidateVideos?: CandidateVideo[];
  bindings?: Record<string, string>;
  onPickVideo?: (creatorId: string, videoId: string) => void;
  onClearVideo?: (creatorId: string) => void;
  disabled?: boolean;
}

export function SelectedCreatorList({
  creators,
  className,
  candidateVideos = [],
  bindings = {},
  onPickVideo,
  onClearVideo,
  disabled = false,
}: SelectedCreatorListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (creators.length === 0) return null;

  const canPick = candidateVideos.length > 0 && !!onPickVideo && !disabled;

  return (
    <div className={cn('flex flex-wrap items-start gap-2', className)}>
      {creators.map((c) => {
        const expanded = expandedId === c.id;
        const territory =
          c.region.trim().toUpperCase() === 'CN' || c.region.includes('中国') ? '中国' : '海外';
        const genderLabel = c.gender === 'female' ? '女' : '男';
        const boundVideoId = bindings[c.id];
        const boundVideo = boundVideoId ? candidateVideos.find((v) => v.id === boundVideoId) : null;

        return (
          <div
            key={c.id}
            className={cn(
              'group relative flex w-[220px] flex-col rounded-xl border bg-background/80 px-2.5 py-2 text-left align-top transition-all',
              expanded
                ? 'border-foreground/25 bg-foreground/[0.02] shadow-sm'
                : 'border-border/40 hover:border-foreground/15 hover:bg-muted/30',
            )}
          >
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : c.id)}
              className="flex items-center gap-2 text-left focus-visible:outline-none"
            >
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img src={c.avatarUrl} alt={c.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[12px] font-medium text-foreground">{c.name}</span>
                  <span className="rounded-full bg-muted/60 px-1.5 py-px text-[9px] text-muted-foreground">
                    {territory}·{genderLabel}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[10px] text-muted-foreground/80">
                  {c.handle} · {c.followers} 粉丝
                </div>
              </div>
              {expanded ? (
                <X className="h-3 w-3 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/60 transition-transform group-hover:text-muted-foreground" />
              )}
            </button>

            {/* Bound video chip (collapsed) */}
            {!expanded && boundVideo && (
              <div className="mt-1.5 flex items-center gap-1 truncate rounded-md bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] text-foreground/70">
                <Film className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                <span className="truncate">复刻：{boundVideo.title}</span>
              </div>
            )}

            {expanded ? (
              <div className="mt-2.5 space-y-2 border-t border-border/40 pt-2 text-[11px] text-foreground/80">
                <div className="space-y-1">
                  <DetailRow label="领域" value={c.niche} />
                  <DetailRow label="地区" value={c.region} />
                  <DetailRow label="粉丝" value={c.followers} />
                  <DetailRow label="均播" value={c.avgViews} />
                  <DetailRow label="账号" value={c.handle} />
                </div>

                {/* Per-creator video picker */}
                {candidateVideos.length > 0 && (
                  <div className="space-y-1 border-t border-border/30 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground/70">选择对标视频</span>
                      {boundVideo && onClearVideo && !disabled && (
                        <button
                          type="button"
                          onClick={() => onClearVideo(c.id)}
                          className="text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          清空
                        </button>
                      )}
                    </div>
                    <div className="max-h-[180px] space-y-1 overflow-y-auto pr-0.5">
                      {candidateVideos.map((v, idx) => {
                        const active = boundVideoId === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            disabled={!canPick}
                            onClick={() => onPickVideo?.(c.id, v.id)}
                            className={cn(
                              'flex w-full items-center gap-1.5 rounded-md border px-1.5 py-1 text-left text-[10px] transition-colors',
                              active
                                ? 'border-foreground/40 bg-foreground/[0.06] text-foreground'
                                : 'border-border/30 hover:border-foreground/20 hover:bg-muted/40 text-foreground/75',
                              !canPick && 'cursor-not-allowed opacity-60',
                            )}
                          >
                            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted/70 text-[9px] font-mono text-muted-foreground">
                              {idx + 1}
                            </span>
                            <span className="min-w-0 flex-1 truncate">{v.title}</span>
                            {active && <Check className="h-3 w-3 shrink-0 text-foreground/70" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
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
