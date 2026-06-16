import { useEffect } from 'react';
import { Search, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StageShell } from '../StageShell';
import { cn } from '@/lib/utils';
import type { OnboardingFlowState } from '../types';

interface Props {
  state: OnboardingFlowState;
  patch: (p: Partial<OnboardingFlowState>) => void;
  onNext: () => void;
}

export function Stage4Review({ state, patch, onNext }: Props) {
  // Auto-advance pending → reviewing
  useEffect(() => {
    if (state.reviewStatus === 'pending') {
      const t = setTimeout(() => patch({ reviewStatus: 'reviewing' }), 600);
      return () => clearTimeout(t);
    }
  }, [state.reviewStatus, patch]);

  const approved = state.reviewStatus === 'approved';
  const steps = [
    { key: 'submitted', label: '资料已提交', done: true },
    { key: 'review', label: '运营审核中', done: approved, active: !approved },
    { key: 'approved', label: '审核通过', done: approved, active: false },
  ];

  return (
    <StageShell
      index="04"
      title="平台审核"
      subtitle="您的资料已提交，正在等待平台运营审核"
      badge={
        approved
          ? { label: '已通过', tone: 'success' }
          : { label: '审核中', tone: 'warning' }
      }
    >
      <div className="flex flex-col items-center py-6 text-center">
        <div className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full border transition-colors duration-500',
          approved
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
            : 'border-amber-500/30 bg-amber-500/10 text-amber-600',
        )}>
          {approved ? <Check className="h-7 w-7" strokeWidth={1.5} /> : <Search className="h-7 w-7 animate-pulse" strokeWidth={1.5} />}
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">
          {approved ? '审核已通过' : '资料审核中'}
        </h3>
        <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
          {approved
            ? '恭喜！您的入驻资料已通过平台审核，现在可以进入合同签署。'
            : '平台运营正在审核您的达人资质、内容质量和报价合理性。审核周期通常为 1-3 个工作日。'}
        </p>

        {/* Progress steps */}
        <div className="mt-7 flex items-center gap-3">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] transition-colors',
                  s.done && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600',
                  s.active && !s.done && 'border-amber-500/40 bg-amber-500/10 text-amber-600',
                  !s.done && !s.active && 'border-border bg-muted/30 text-muted-foreground',
                )}>
                  {s.done ? <Check className="h-3.5 w-3.5" /> : s.active ? <Clock className="h-3 w-3 animate-pulse" /> : i + 1}
                </div>
                <div className="text-[10.5px] text-foreground/80">{s.label}</div>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'mt-[-14px] h-px w-12 transition-colors',
                  s.done ? 'bg-emerald-500/40' : 'bg-border',
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 max-w-md rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-left text-[11.5px] leading-relaxed text-amber-700 dark:text-amber-300">
          <div className="mb-1 font-medium">审核期间</div>
          <div>• 您暂时无法访问任务大厅和品牌邀约</div>
          <div>• 审核结果将通过邮件和站内通知推送</div>
          <div>• 审核通过后将自动进入合同签署环节</div>
        </div>

        {!approved ? (
          <div className="mt-7">
            <Button
              variant="outline"
              size="sm"
              className="text-[11.5px] text-muted-foreground"
              onClick={() => patch({ reviewStatus: 'approved' })}
            >
              [模拟] 标记审核通过
            </Button>
            <div className="mt-2 text-[10.5px] text-muted-foreground/70">
              此按钮仅用于演示，实际环境由运营后台操作
            </div>
          </div>
        ) : (
          <div className="mt-7">
            <Button onClick={onNext}>进入合同签署 →</Button>
          </div>
        )}
      </div>
    </StageShell>
  );
}
