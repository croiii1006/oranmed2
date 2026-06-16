import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  index: string;
  title: string;
  subtitle: string;
  badge?: { label: string; tone?: 'default' | 'active' | 'warning' | 'success' };
  children: ReactNode;
}

const toneClass: Record<NonNullable<Props['badge']>['tone'] & string, string> = {
  default: 'border-border bg-muted/40 text-muted-foreground',
  active: 'border-accent/40 bg-accent/10 text-accent',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
};

export function StageShell({ index, title, subtitle, badge, children }: Props) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-2xl border border-border/60 bg-card p-7 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_28px_-12px_rgba(0,0,0,0.06)]">
      <header className="mb-6 flex items-start justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            STAGE {index}
          </div>
          <h2 className="mt-1.5 text-xl font-medium tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-[12.5px] text-muted-foreground">{subtitle}</p>
        </div>
        {badge && (
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-medium tracking-wide',
              toneClass[badge.tone ?? 'default'],
            )}
          >
            {badge.label}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}
