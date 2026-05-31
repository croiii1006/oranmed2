import { useSearchParams } from 'react-router-dom';
import { useCreatorPortalState } from '@/components/creator-portal/useCreatorPortalState';
import { CreatorPortalShell } from '@/components/creator-portal/CreatorPortalShell';
import { OnboardingSection } from '@/components/creator-portal/OnboardingSection';
import { TaskInboxSection } from '@/components/creator-portal/TaskInboxSection';
import { CreatorStatsSection } from '@/components/creator-portal/CreatorStatsSection';

export default function CreatorPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('creatorId') ?? undefined;
  const {
    creators,
    currentCreator,
    setCurrentCreatorId,
    onboarding,
    patchOnboarding,
    inboxTasks,
    getResponse,
    updateTaskResponse,
    stats,
  } = useCreatorPortalState(initialId);

  const handleChange = (id: string) => {
    setCurrentCreatorId(id);
    setSearchParams({ creatorId: id }, { replace: true });
  };

  const canAct = onboarding.onboardingStatus === 'approved';

  return (
    <div className="min-h-screen bg-muted/30">
      <CreatorPortalShell
        creators={creators}
        currentCreator={currentCreator}
        onChange={handleChange}
        onboardingStatus={onboarding.onboardingStatus}
      />
      <main className="mx-auto max-w-[520px] space-y-4 px-4 py-4 pb-12">
        <OnboardingSection onboarding={onboarding} patch={patchOnboarding} />
        <TaskInboxSection
          tasks={inboxTasks}
          getResponse={getResponse}
          updateResponse={updateTaskResponse}
          canAct={canAct}
        />
        <CreatorStatsSection stats={stats} />
        <div className="pt-2 text-center text-[10px] text-muted-foreground">
          OranMed 达人端 · 数据与品牌端 (/ai-toolbox/oran-med) 实时同步
        </div>
      </main>
    </div>
  );
}
