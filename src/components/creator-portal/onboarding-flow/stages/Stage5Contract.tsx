import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StageShell } from '../StageShell';
import { cn } from '@/lib/utils';
import type { OnboardingFlowState } from '../types';

interface Props {
  state: OnboardingFlowState;
  patch: (p: Partial<OnboardingFlowState>) => void;
  onComplete: () => void;
}

export function Stage5Contract({ state, patch, onComplete }: Props) {
  const signedTime = useMemo(
    () => state.contractSignedAt ?? new Date().toLocaleString('zh-CN'),
    [state.contractSignedAt],
  );

  const handleSign = () => {
    patch({
      contractSigned: true,
      contractSignedAt: new Date().toLocaleString('zh-CN'),
    });
    setTimeout(onComplete, 900);
  };

  return (
    <StageShell
      index="05"
      title="合同签署"
      subtitle="平台已确认您的报价，以下是基于您信息动态生成的合同"
      badge={
        state.contractSigned
          ? { label: '已签署', tone: 'success' }
          : { label: '待签署', tone: 'default' }
      }
    >
      {/* Terms summary */}
      <div className="rounded-xl border border-border/60 bg-gradient-to-br from-muted/30 to-transparent px-5 py-4">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          您的合作参数 · 平台已确认
        </div>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <SummaryItem label="单次报价" value={state.rate ? `$${state.rate}` : '—'} />
          <SummaryItem label="浮动范围" value={`±${state.flexRange || 0}%`} />
          <SummaryItem label="收款方式" value="PayPal" />
        </div>
      </div>

      {/* Contract text */}
      <div className="mt-5 max-h-72 overflow-y-auto rounded-xl border border-border/60 bg-card px-5 py-4 text-[12px] leading-relaxed text-foreground/85">
        <p className="mb-3 text-center text-[13px] font-semibold text-foreground">
          创作者合作协议
        </p>
        <p className="mb-2">
          甲方（平台）：ORAN MED　　乙方（创作者）：<span className="font-medium">{state.fullName || '—'}</span>
        </p>
        <p className="mb-3">签署日期：{new Date().toLocaleDateString('zh-CN')}</p>

        <p className="mb-1 font-medium text-foreground">第一条 · 合作内容</p>
        <p className="mb-3 text-muted-foreground">
          乙方授权甲方将其 TikTok 账号 <span className="text-foreground/90">@aria.chen</span> 接入平台，参与品牌方推广任务的撮合与履约。
        </p>

        <p className="mb-1 font-medium text-foreground">第二条 · 报酬结算</p>
        <p className="mb-3 text-muted-foreground">
          单次任务基准报酬为 <span className="font-medium text-foreground/90">${state.rate || 0} USD</span>，可接受 ±{state.flexRange || 0}% 浮动。任务完成验收后 T+7 工作日内结算至乙方 PayPal 账户：{state.paypalEmail || '—'}。
        </p>

        <p className="mb-1 font-medium text-foreground">第三条 · 内容标准</p>
        <p className="mb-3 text-muted-foreground">
          乙方须按品牌 Brief 创作原创内容，遵守 TikTok 社区准则及所在地区广告法规。
        </p>

        <p className="mb-1 font-medium text-foreground">第四条 · 提现机制</p>
        <p className="mb-3 text-muted-foreground">
          乙方账户余额满 $50 USD 可发起提现，提现申请将在 3 个工作日内完成。
        </p>

        <p className="mb-1 font-medium text-foreground">第五条 · 协议变更</p>
        <p className="text-muted-foreground">
          任一方需提前 15 天书面通知方可解除本协议。已发生合作的结算责任不受协议解除影响。
        </p>
      </div>

      {!state.contractSigned ? (
        <>
          <label className={cn(
            'mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border px-4 py-3 transition-colors',
            state.contractAccepted ? 'border-accent/40 bg-accent/5' : 'border-border bg-muted/20 hover:bg-muted/30',
          )}>
            <Checkbox
              checked={state.contractAccepted}
              onCheckedChange={(v) => patch({ contractAccepted: !!v })}
              className="mt-0.5"
            />
            <span className="text-[12px] leading-relaxed text-foreground/85">
              我已阅读并理解合同全部条款，包括报酬结算规则及提现机制。
            </span>
          </label>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              拒绝签署
            </Button>
            <Button onClick={handleSign} disabled={!state.contractAccepted}>
              确认签署
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-6 py-7 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
            <Check className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div className="text-[14px] font-medium text-foreground">合同已生效</div>
          <div className="font-mono text-[11px] text-muted-foreground">{signedTime}</div>
        </div>
      )}
    </StageShell>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[15px] font-medium tabular-nums text-foreground">{value}</div>
    </div>
  );
}
