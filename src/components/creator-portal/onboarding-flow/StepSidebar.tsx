import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STEPS } from './types';

interface Props {
  current: number;
  maxUnlocked: number;
  onSelect: (step: number) => void;
}

export function StepSidebar({ current, maxUnlocked, onSelect }: Props) {
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[11px] font-semibold tracking-wider text-accent-foreground">
          TC
        </div>
        <div className="text-sm font-medium tracking-wide text-foreground">
          创作者工作台
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {STEPS.map((s) => {
          const done = current > s.id || (current === 6 && s.id <= 5);
          const active = current === s.id;
          const locked = s.id > maxUnlocked;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => !locked && onSelect(s.id)}
              disabled={locked}
              className={cn(
                'group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-300',
                active && 'bg-accent/10 ring-1 ring-accent/30',
                !active && !locked && 'hover:bg-muted/60',
                locked && 'cursor-not-allowed opacity-45',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium tabular-nums transition-colors',
                  done && 'border-accent/50 bg-accent text-accent-foreground',
                  active && !done && 'border-accent text-accent',
                  !done && !active && 'border-border text-muted-foreground',
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : locked ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  s.id
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn(
                  'text-[12.5px] leading-tight',
                  active ? 'font-medium text-foreground' : 'text-foreground/80',
                )}>
                  {s.label}
                </div>
                <div className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">
                  {s.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-[10px] tracking-wider text-muted-foreground">
        ORAN MED · Creator Portal
      </div>
    </aside>
  );
}
