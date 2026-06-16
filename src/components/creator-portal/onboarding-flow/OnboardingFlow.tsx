import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingFlow } from './useOnboardingFlow';
import { StepSidebar } from './StepSidebar';
import { Stage1Auth } from './stages/Stage1Auth';
import { Stage2KYC } from './stages/Stage2KYC';
import { Stage3Pricing } from './stages/Stage3Pricing';
import { Stage4Review } from './stages/Stage4Review';
import { Stage5Contract } from './stages/Stage5Contract';

export function OnboardingFlow() {
  const { state, patch, goTo, reset } = useOnboardingFlow();

  // Compute the furthest unlocked step based on completed work
  const maxUnlocked = (() => {
    if (state.contractSigned) return 6;
    if (state.reviewStatus === 'approved') return 5;
    if (state.rate) return 4;
    if (state.tosAccepted && state.idFileName) return 3;
    if (state.tiktokConnected) return 2;
    return 1;
  })();

  const goNext = (n: 2 | 3 | 4 | 5 | 6) => goTo(n);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-muted/40 via-background to-muted/20">
      <StepSidebar
        current={state.currentStep}
        maxUnlocked={maxUnlocked}
        onSelect={(s) => goTo(s as 1 | 2 | 3 | 4 | 5)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-10">
          {/* Top hint */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                ORAN MED · Onboarding
              </div>
              <h1 className="mt-1.5 text-[15px] font-medium tracking-tight text-foreground">
                完成 5 步入驻流程以接收品牌任务
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              重置流程
            </Button>
          </div>

          {state.currentStep === 1 && (
            <Stage1Auth state={state} patch={patch} onNext={() => goNext(2)} />
          )}
          {state.currentStep === 2 && (
            <Stage2KYC state={state} patch={patch} onNext={() => goNext(3)} />
          )}
          {state.currentStep === 3 && (
            <Stage3Pricing state={state} patch={patch} onNext={() => goNext(4)} />
          )}
          {state.currentStep === 4 && (
            <Stage4Review state={state} patch={patch} onNext={() => goNext(5)} />
          )}
          {state.currentStep === 5 && (
            <Stage5Contract state={state} patch={patch} onComplete={() => goNext(6)} />
          )}
          {state.currentStep === 6 && <Completion />}
        </div>
      </main>
    </div>
  );
}

function Completion() {
  return (
    <section className="animate-in fade-in zoom-in-95 duration-500 rounded-2xl border border-border/60 bg-card p-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_28px_-12px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Sparkles className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 text-xl font-medium tracking-tight text-foreground">
        入驻完成
      </h2>
      <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
        恭喜！您已完成全部入驻流程，平台将很快为您推送匹配的品牌任务。
      </p>
      <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[11.5px] text-emerald-600">
        <Check className="h-3.5 w-3.5" /> 合同已生效 · 任务大厅即将开放
      </div>
    </section>
  );
}
