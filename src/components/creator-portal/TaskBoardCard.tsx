import { Play, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  STATUS_LABEL,
  STATUS_TONE,
  type CreatorResponse,
  type OranMedTask,
} from '@/components/modules/ai-toolbox/oran-med/types';

interface Props {
  task: OranMedTask;
  response: CreatorResponse;
  canAct: boolean;
  onOpenDetail: () => void;
  updateResponse: (taskId: string, patch: Partial<CreatorResponse>) => void;
}

export function TaskBoardCard({ task, response, canAct, onOpenDetail, updateResponse }: Props) {
  const asset = task.assets[0];
  const r = response;
  const isApproved = task.status === 'approved' || task.status === 'published';

  const primaryAction = (() => {
    if (r.taskDecision === 'pending' && isApproved && canAct) {
      return {
        label: '接受任务',
        onClick: () => {
          updateResponse(task.id, { taskDecision: 'accepted' });
          toast({ title: '已接受任务' });
        },
      };
    }
    if (r.taskDecision === 'accepted' && r.publishDecision === 'pending') {
      return {
        label: '同意发布',
        onClick: () => {
          updateResponse(task.id, { publishDecision: 'agreed' });
          toast({ title: '已同意发布' });
        },
      };
    }
    if (r.publishDecision === 'agreed' && !r.publishedAt) {
      return {
        label: '标记已发布',
        onClick: () => {
          updateResponse(task.id, {
            publishedAt: new Date().toISOString(),
            points: 200,
            billAmount: 1500,
          });
          toast({ title: '已标记发布完成' });
        },
      };
    }
    return null;
  })();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:border-foreground/20 hover:shadow-md">
      {/* Thumbnail */}
      <button
        onClick={onOpenDetail}
        className="relative aspect-[16/10] w-full overflow-hidden"
      >
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br',
            asset?.thumbnailColor ?? 'from-slate-300 to-slate-500',
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition-transform group-hover:scale-110">
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            'absolute left-2 top-2 border-0 text-[10px]',
            STATUS_TONE[task.status],
          )}
        >
          {STATUS_LABEL[task.status]}
        </Badge>
        {r.publishedAt && (
          <div className="absolute right-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-medium text-white">
            已结算
          </div>
        )}
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-foreground">
            {task.brief.title}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {task.brief.brandName} · {task.brief.platform}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Dot tone={r.taskDecision} />
          <span>任务 {decisionLabel(r.taskDecision)}</span>
          <span className="text-border">|</span>
          <Dot tone={r.publishDecision === 'agreed' ? 'accepted' : r.publishDecision} />
          <span>发布 {publishLabel(r.publishDecision)}</span>
        </div>

        {r.publishedAt && (
          <div className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-700 dark:text-emerald-300">
            积分 +{r.points ?? 0} · 账单 ¥{r.billAmount ?? 0}
          </div>
        )}

        <div className="mt-auto flex items-center gap-1.5 pt-1">
          {primaryAction ? (
            <Button size="sm" className="h-7 flex-1 text-[11px]" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          ) : (
            <div className="flex-1 text-[10px] text-muted-foreground">
              {r.publishedAt ? '任务已完成' : '等待下一步'}
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[11px]"
            onClick={onOpenDetail}
          >
            <Eye className="mr-1 h-3 w-3" />
            详情
          </Button>
        </div>
      </div>
    </div>
  );
}

function Dot({ tone }: { tone: 'pending' | 'accepted' | 'rejected' }) {
  const cls =
    tone === 'accepted'
      ? 'bg-emerald-500'
      : tone === 'rejected'
        ? 'bg-rose-500'
        : 'bg-muted-foreground/40';
  return <span className={cn('inline-block h-1.5 w-1.5 rounded-full', cls)} />;
}

function decisionLabel(d: 'pending' | 'accepted' | 'rejected') {
  return d === 'pending' ? '待处理' : d === 'accepted' ? '已接受' : '已拒绝';
}
function publishLabel(d: 'pending' | 'agreed' | 'rejected') {
  return d === 'pending' ? '待处理' : d === 'agreed' ? '已同意' : '已拒绝';
}
