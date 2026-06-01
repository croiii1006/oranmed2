import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCreatorPortalState } from '@/components/creator-portal/useCreatorPortalState';
import { OnboardingSection } from '@/components/creator-portal/OnboardingSection';
import { CreatorProfileCard } from '@/components/creator-portal/CreatorProfileCard';
import { TaskBoardCard } from '@/components/creator-portal/TaskBoardCard';
import { TaskDetailDialog } from '@/components/creator-portal/TaskDetailDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function CreatorPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('creatorId') ?? undefined;
  const {
    creators,
    currentCreator,
    setCurrentCreatorId,
    onboarding,
    patchOnboarding,
    resetOnboarding,
    inboxTasks,
    getResponse,
    updateTaskResponse,
    stats,
  } = useCreatorPortalState(initialId);

  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const detailTask = useMemo(
    () => inboxTasks.find((t) => t.id === detailTaskId) ?? null,
    [detailTaskId, inboxTasks],
  );
  const detailResponse = detailTask ? getResponse(detailTask) : null;

  const handleChange = (id: string) => {
    setCurrentCreatorId(id);
    setSearchParams({ creatorId: id }, { replace: true });
  };

  const canAct = onboarding.onboardingStatus === 'approved';
  const isApproved = canAct;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-muted/40 via-background to-muted/20">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-border/60 bg-background/70 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent/40 blur-[3px]" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <h1 className="text-sm font-light tracking-[0.25em] text-foreground">
            ORAN MED · 达人工作台
          </h1>
          <span className="hidden text-[11px] text-muted-foreground md:inline">
            品牌任务接收 / 内容发布 / 收益结算
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={currentCreator.id} onValueChange={handleChange}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="切换达人" />
            </SelectTrigger>
            <SelectContent className="max-h-[60vh]">
              {creators.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Dashboard grid */}
      <main className="flex-1 overflow-hidden p-5">
        <div className="grid h-full grid-cols-[340px_1fr] gap-5">
          {/* Left column */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            <CreatorProfileCard
              creator={currentCreator}
              onboarding={onboarding}
              onReset={() => {
                resetOnboarding();
                toast({ title: '已重置为未入驻状态' });
              }}
            />

            <StatsCard stats={stats} />

            {!isApproved && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-[11px] text-amber-700 dark:text-amber-300">
                请先完成入驻认证后再接收任务。
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex min-h-0 flex-col gap-3">
            <div className="flex items-baseline justify-between px-1">
              <div>
                <h2 className="text-base font-medium text-foreground">我的任务</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  品牌端推送的任务在此呈现，点击卡片查看完整 Brief 与素材
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Legend dot="bg-amber-400" label="待处理" />
                <Legend dot="bg-emerald-500" label="已接受" />
                <Legend dot="bg-violet-500" label="已发布" />
              </div>
            </div>

            {!isApproved ? (
              <div className="flex-1 overflow-y-auto rounded-2xl border border-border/60 bg-card p-5">
                <OnboardingSection onboarding={onboarding} patch={patchOnboarding} />
              </div>
            ) : inboxTasks.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/60 text-xs text-muted-foreground">
                暂无品牌任务推送
              </div>
            ) : (
              <div className="grid flex-1 auto-rows-min grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
                {inboxTasks.map((task) => (
                  <TaskBoardCard
                    key={task.id}
                    task={task}
                    response={getResponse(task)}
                    canAct={canAct}
                    onOpenDetail={() => setDetailTaskId(task.id)}
                    updateResponse={updateTaskResponse}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <TaskDetailDialog
        task={detailTask}
        response={detailResponse}
        canAct={canAct}
        onOpenChange={(o) => !o && setDetailTaskId(null)}
        updateResponse={updateTaskResponse}
      />
    </div>
  );
}

function StatsCard({ stats }: { stats: { points: number; published: number; billed: number } }) {
  const items = [
    { label: '积分', value: stats.points, tone: 'text-amber-600 dark:text-amber-400' },
    { label: '已发布', value: stats.published, tone: 'text-violet-600 dark:text-violet-400' },
    { label: '账单 ¥', value: stats.billed, tone: 'text-emerald-600 dark:text-emerald-400' },
  ];
  return (
    <div className="rounded-[24px] border border-white/40 bg-muted/30 p-4 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">我的数据</h3>
        <span className="text-[10px] text-muted-foreground">实时同步</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-xl border border-border/60 bg-card px-2 py-3 text-center"
          >
            <div className={`text-lg font-semibold tabular-nums ${it.tone}`}>{it.value}</div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
