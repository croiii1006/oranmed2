import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreatorLibraryItem } from './creatorLibrary';

interface SelectedCreatorListProps {
  creators: CreatorLibraryItem[];
  className?: string;
}

export function SelectedCreatorList({ creators, className }: SelectedCreatorListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (creators.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {creators.map((c) => {
        const expanded = expandedId === c.id;
        const territory =
          c.region.trim().toUpperCase() === 'CN' || c.region.includes('中国') ? '中国' : '海外';
        const genderLabel = c.gender === 'female' ? '女' : '男';

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setExpandedId(expanded ? null : c.id)}
            className={cn(
              'group relative flex w-[220px] flex-col rounded-xl border bg-background/80 px-2.5 py-2 text-left align-top transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/15',
              expanded
                ? 'border-foreground/25 bg-foreground/[0.02] shadow-sm'
                : 'border-border/40 hover:border-foreground/15 hover:bg-muted/30',
            )}
          >
            <div className="flex items-center gap-2">
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
            </div>

            {expanded ? (
              <div className="mt-2.5 space-y-1 border-t border-border/40 pt-2 text-[11px] text-foreground/80">
                <DetailRow label="领域" value={c.niche} />
                <DetailRow label="地区" value={c.region} />
                <DetailRow label="粉丝" value={c.followers} />
                <DetailRow label="均播" value={c.avgViews} />
                <DetailRow label="账号" value={c.handle} />
              </div>
            ) : null}
          </button>
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
