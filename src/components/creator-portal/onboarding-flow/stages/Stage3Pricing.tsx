import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StageShell } from '../StageShell';
import type { OnboardingFlowState } from '../types';

interface Props {
  state: OnboardingFlowState;
  patch: (p: Partial<OnboardingFlowState>) => void;
  onNext: () => void;
}

export function Stage3Pricing({ state, patch, onNext }: Props) {
  const rate = Number(state.rate);
  const flex = Number(state.flexRange) || 0;
  const canNext = rate > 0;
  const low = rate ? Math.round(rate * (1 - flex / 100)) : 0;
  const high = rate ? Math.round(rate * (1 + flex / 100)) : 0;

  return (
    <StageShell
      index="03"
      title="报价设置"
      subtitle="设置您的期望报价及可接受的价格浮动范围"
      badge={{ label: canNext ? '已设置' : '待填写', tone: canNext ? 'success' : 'default' }}
    >
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <div className="space-y-1.5">
          <Label className="text-[11.5px] text-muted-foreground">期望单次报价 (USD)</Label>
          <Input
            type="number"
            value={state.rate}
            onChange={(e) => patch({ rate: e.target.value })}
            placeholder="e.g. 500"
          />
          <p className="text-[10.5px] text-muted-foreground">平台将基于此报价与品牌方协商</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11.5px] text-muted-foreground">可接受浮动范围 (%)</Label>
          <Input
            type="number"
            value={state.flexRange}
            onChange={(e) => patch({ flexRange: e.target.value })}
            placeholder="e.g. 20"
          />
          <p className="text-[10.5px] text-muted-foreground">品牌报价在此浮动范围内可自动匹配</p>
        </div>
      </div>

      {canNext && (
        <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 px-5 py-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">报价区间预览</div>
          <div className="mt-1.5 text-xl font-medium tabular-nums text-foreground">
            ${low.toLocaleString()} <span className="text-muted-foreground">—</span> ${high.toLocaleString()}
            <span className="ml-2 text-[12px] font-normal text-muted-foreground">USD / post</span>
          </div>
        </div>
      )}

      <div className="mt-7 flex justify-end">
        <Button onClick={onNext} disabled={!canNext} className="group gap-1.5">
          提交并进入审核
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </StageShell>
  );
}
