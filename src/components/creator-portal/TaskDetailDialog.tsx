import { Play, Calendar, Target, Tag, Users, DollarSign, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  task: OranMedTask | null;
  response: CreatorResponse | null;
  canAct: boolean;
  onOpenChange: (open: boolean) => void;
  updateResponse: (taskId: string, patch: Partial<CreatorResponse>) => void;
}

export function TaskDetailDialog({ task, response, canAct, onOpenChange, updateResponse }: Props) {
  if (!task || !response) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const asset = task.assets[0];
  const r = response;
  const isApproved = task.status === 'approved' || task.status === 'published';

  return (
    <Dialog open={!!task} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] gap-0 overflow-hidden p-0">
        <div className="grid grid-cols-[1fr_360px]">
          {/* Video preview */}
          <div className="relative flex aspect-[9/12] items-center justify-center bg-black">
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-90',
                asset?.thumbnailColor ?? 'from-slate-700 to-slate-900',
              )}
            />
            <button
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-foreground shadow-xl backdrop-blur transition-transform hover:scale-105"
              onClick={() => toast({ title: '演示视频播放（模拟）' })}
            >
              <Play className="ml-1 h-6 w-6 fill-current" />
            </button>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 text-[11px] text-white/90 backdrop-blur">
              <span className="truncate">{asset?.title ?? '未上传素材'}</span>
              <span className="ml-2 shrink-0 rounded-full bg-white/20 px-2 py-0.5">
                {asset?.source === 'orangen' ? 'OranGen' : '本地'}
              </span>
            </div>
          </div>

          {/* Brief / actions */}
          <div className="flex max-h-[640px] flex-col overflow-y-auto">
            <DialogHeader className="space-y-2 border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn('border-0 text-[10px]', STATUS_TONE[task.status])}
                >
                  {STATUS_LABEL[task.status]}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {task.brief.brandName} · {task.brief.platform}
                </span>
              </div>
              <DialogTitle className="text-base font-medium leading-snug">
                {task.brief.title}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 space-y-3 px-5 py-4 text-[12px]">
              <Row icon={Target} label="投放目标" value={task.brief.goal} />
              <Row icon={Users} label="目标人群" value={task.brief.audience} />
              <Row icon={Calendar} label="期望发布" value={task.brief.expectedPublishDate} />
              <Row icon={Tag} label="风格要求" value={task.brief.styleRequirements} />
              <Row icon={Tag} label="品牌卖点" value={task.brief.brandTags} />
              <Row icon={DollarSign} label="预算" value={task.brief.budget} />

              {r.publishedAt && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11px] text-emerald-700 dark:text-emerald-300">
                  <div className="mb-1 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    已完成发布
                  </div>
                  <div className="text-[11px] opacity-80">
                    积分 +{r.points ?? 0} · 账单 ¥{r.billAmount ?? 0}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border/60 bg-muted/30 px-5 py-3">
              {r.taskDecision === 'pending' && isApproved && canAct && (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      updateResponse(task.id, { taskDecision: 'accepted' });
                      toast({ title: '已接受任务' });
                    }}
                  >
                    接受任务
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateResponse(task.id, { taskDecision: 'rejected' })}
                  >
                    拒绝任务
                  </Button>
                </>
              )}
              {r.taskDecision === 'accepted' && r.publishDecision === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      updateResponse(task.id, { publishDecision: 'agreed' });
                      toast({ title: '已同意发布' });
                    }}
                  >
                    同意发布
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateResponse(task.id, { publishDecision: 'rejected' })}
                  >
                    拒绝发布
                  </Button>
                </>
              )}
              {r.publishDecision === 'agreed' && !r.publishedAt && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    updateResponse(task.id, {
                      publishedAt: new Date().toISOString(),
                      points: 200,
                      billAmount: 1500,
                    });
                    toast({ title: '已标记发布完成' });
                  }}
                >
                  标记已发布
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</div>
        <div className="mt-0.5 text-foreground">{value || '—'}</div>
      </div>
    </div>
  );
}
