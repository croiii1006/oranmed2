import { Paperclip, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  STATUS_LABEL,
  STATUS_TONE,
  type CreatorResponse,
  type CreatorPublishDecision,
  type CreatorTaskDecision,
  type OranMedTask,
} from '@/components/modules/ai-toolbox/oran-med/types';

interface Props {
  tasks: OranMedTask[];
  getResponse: (t: OranMedTask) => CreatorResponse;
  updateResponse: (taskId: string, patch: Partial<CreatorResponse>) => void;
  canAct: boolean;
}

const TASK_DECISION_LABEL: Record<CreatorTaskDecision, string> = {
  pending: '待处理',
  accepted: '已接受',
  rejected: '已拒绝',
};

const PUBLISH_DECISION_LABEL: Record<CreatorPublishDecision, string> = {
  pending: '待处理',
  agreed: '已同意',
  rejected: '已拒绝',
};

export function TaskInboxSection({ tasks, getResponse, updateResponse, canAct }: Props) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">我的任务</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!canAct && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
            完成入驻认证后才能接收任务。
          </div>
        )}
        {tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
            暂无品牌任务推送
          </div>
        ) : (
          tasks.map((task) => {
            const r = getResponse(task);
            const isApproved = task.status === 'approved' || task.status === 'published';
            return (
              <div
                key={task.id}
                className="space-y-2.5 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {task.brief.title || '未命名任务'}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {task.brief.brandName || '—'} · {task.brief.platform}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn('shrink-0 border-0 text-[10px]', STATUS_TONE[task.status])}
                  >
                    {STATUS_LABEL[task.status]}
                  </Badge>
                </div>

                {task.assets[0] && (
                  <div className="flex items-center gap-1.5 truncate rounded-md bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">
                    <Paperclip className="h-3 w-3 shrink-0" />
                    <span className="truncate">{task.assets[0].title}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <StatusLine label="任务" value={TASK_DECISION_LABEL[r.taskDecision]} tone={r.taskDecision} />
                  <StatusLine
                    label="发布"
                    value={PUBLISH_DECISION_LABEL[r.publishDecision]}
                    tone={r.publishDecision === 'agreed' ? 'accepted' : r.publishDecision}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
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
                        onClick={() =>
                          updateResponse(task.id, { taskDecision: 'rejected' })
                        }
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
                        onClick={() =>
                          updateResponse(task.id, { publishDecision: 'rejected' })
                        }
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
                  {r.publishedAt && (
                    <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      已发布 · 积分 +{r.points ?? 0} · 账单 ¥{r.billAmount ?? 0}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function StatusLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'pending' | 'accepted' | 'rejected';
}) {
  const toneClass =
    tone === 'accepted'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'rejected'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-muted-foreground';
  return (
    <div>
      <span className="text-muted-foreground/70">{label}：</span>
      <span className={toneClass}>{value}</span>
    </div>
  );
}
