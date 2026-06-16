import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingFlow } from './useOnboardingFlow';
import { StepSidebar } from './StepSidebar';
import { Stage1Auth } from './stages/Stage1Auth';
import { Stage2KYC } from './stages/Stage2KYC';
import { Stage3Pricing } from './stages/Stage3Pricing';
import { Stage4Review } from './stages/Stage4Review';
import { Stage5Contract } from './stages/Stage5Contract';
import { useCreatorPortalState } from '@/components/creator-portal/useCreatorPortalState';
import { TaskInboxSection } from '@/components/creator-portal/TaskInboxSection';
import { CreatorStatsSection } from '@/components/creator-portal/CreatorStatsSection';

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
  const isDone = state.currentStep === 6;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-muted/40 via-background to-muted/20">
      <StepSidebar
        current={state.currentStep}
        maxUnlocked={maxUnlocked}
        onSelect={(s) => goTo(s as 1 | 2 | 3 | 4 | 5)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className={`mx-auto ${isDone ? 'max-w-5xl' : 'max-w-3xl'} px-8 py-10`}>
          {/* Top hint */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                ORAN MED · {isDone ? 'Task Hall' : 'Onboarding'}
              </div>
              <h1 className="mt-1.5 text-[15px] font-medium tracking-tight text-foreground">
                {isDone ? '任务大厅' : '完成 5 步入驻流程以接收品牌任务'}
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
          {isDone && <TaskHall />}
        </div>
      </main>
    </div>
  );
}

function TaskHall() {
  const { inboxTasks, getResponse, updateTaskResponse, stats } = useCreatorPortalState();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_28px_-12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Sparkles className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h2 className="text-[14px] font-medium tracking-tight text-foreground">
              入驻完成,欢迎来到任务大厅
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              平台将持续为您推送匹配的品牌任务,请及时处理。
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-600">
            <Check className="h-3 w-3" /> 合同已生效
          </div>
        </div>
      </section>

      <CreatorStatsSection stats={stats} />
      <TaskInboxSection
        tasks={inboxTasks}
        getResponse={getResponse}
        updateResponse={updateTaskResponse}
        canAct
      />
    </div>
  );
}
