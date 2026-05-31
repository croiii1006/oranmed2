import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import type {
  CreatorResponse,
  OranMedTask,
} from '@/components/modules/ai-toolbox/oran-med/types';

interface Props {
  tasks: OranMedTask[];
  getResponse: (t: OranMedTask) => CreatorResponse;
  updateResponse: (taskId: string, patch: Partial<CreatorResponse>) => void;
  canAct: boolean;
}

export function TaskInboxSection({ tasks, getResponse, updateResponse, canAct }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">我的任务</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!canAct && (
          <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-700">
            完成入驻认证后才能接收任务。
          </div>
        )}
        {tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            暂无品牌任务推送
          </div>
        ) : (
          tasks.map((task) => {
            const r = getResponse(task);
            const isApproved = task.status === 'approved' || task.status === 'published';
            return (
              <div
                key={task.id}
                className="space-y-2 rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{task.brief.title || '未命名任务'}</div>
                    <div className="text-xs text-muted-foreground">
                      {task.brief.brandName || '—'} · {task.brief.platform}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {task.status}
                  </Badge>
                </div>

                {task.assets[0] && (
                  <div className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                    📎 {task.assets[0].title}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <StatusLine label="任务" value={r.taskDecision} />
                  <StatusLine label="发布" value={r.publishDecision} />
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
                    <div className="text-[11px] text-emerald-600">
                      ✓ 已发布 · 积分 +{r.points ?? 0} · 账单 ¥{r.billAmount ?? 0}
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

function StatusLine({ label, value }: { label: string; value: string }) {
  const tone =
    value === 'accepted' || value === 'agreed'
      ? 'text-emerald-600'
      : value === 'rejected'
        ? 'text-rose-600'
        : 'text-muted-foreground';
  return (
    <div>
      <span className="text-muted-foreground">{label}：</span>
      <span className={tone}>{value}</span>
    </div>
  );
}
