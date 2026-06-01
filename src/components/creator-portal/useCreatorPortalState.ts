import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CREATORS_KEY,
  CURRENT_CREATOR_KEY,
  TASKS_KEY,
  patchCreatorResponse,
  readOnboardings,
  readTasks,
  writeOnboardings,
  writeTasks,
} from './storage';
import type {
  CreatorOnboarding,
  CreatorResponse,
  OranMedTask,
} from '@/components/modules/ai-toolbox/oran-med/types';
import { creatorLibraryItems } from '@/components/modules/skills/creatorLibrary';

// Demo: every creator starts as 已通过 so we can showcase the full publish flow
const defaultOnboarding = (creatorId: string, name: string): CreatorOnboarding => {
  const creator = creatorLibraryItems.find((c) => c.id === creatorId);
  return {
    creatorId,
    name,
    birth: '1998-06',
    country: creator?.region === 'CN' ? '中国' : 'United States',
    city: creator?.region === 'CN' ? '上海' : 'Los Angeles',
    idNo: 'P' + creatorId.replace(/\D/g, '').padEnd(9, '0'),
    idPhoto: 'passport_front.jpg',
    scanVerified: true,
    contractSigned: true,
    tiktokHandle: creator?.handle ?? '@demo',
    onboardingStatus: 'approved',
    updatedAt: new Date().toISOString(),
  };
};

export function useCreatorPortalState(initialCreatorId?: string) {
  const [tasks, setTasks] = useState<OranMedTask[]>(() => readTasks());
  const [onboardings, setOnboardings] = useState<Record<string, CreatorOnboarding>>(() =>
    readOnboardings(),
  );
  const [currentCreatorId, setCurrentCreatorIdState] = useState<string>(() => {
    if (initialCreatorId && creatorLibraryItems.some((c) => c.id === initialCreatorId)) {
      return initialCreatorId;
    }
    try {
      const stored = localStorage.getItem(CURRENT_CREATOR_KEY);
      if (stored && creatorLibraryItems.some((c) => c.id === stored)) return stored;
    } catch {
      // ignore
    }
    return creatorLibraryItems[0]?.id ?? '';
  });

  // Sync from other tabs / panels
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === TASKS_KEY) setTasks(readTasks());
      if (e.key === CREATORS_KEY) setOnboardings(readOnboardings());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_CREATOR_KEY, currentCreatorId);
    } catch {
      // ignore
    }
  }, [currentCreatorId]);

  const setCurrentCreatorId = useCallback((id: string) => {
    setCurrentCreatorIdState(id);
  }, []);

  const currentCreator = useMemo(
    () => creatorLibraryItems.find((c) => c.id === currentCreatorId) ?? creatorLibraryItems[0],
    [currentCreatorId],
  );

  const onboarding = useMemo<CreatorOnboarding>(() => {
    return (
      onboardings[currentCreator.id] ?? defaultOnboarding(currentCreator.id, currentCreator.name)
    );
  }, [onboardings, currentCreator]);

  const patchOnboarding = useCallback(
    (patch: Partial<CreatorOnboarding>) => {
      setOnboardings((prev) => {
        const base =
          prev[currentCreator.id] ?? defaultOnboarding(currentCreator.id, currentCreator.name);
        const next = {
          ...prev,
          [currentCreator.id]: { ...base, ...patch, updatedAt: new Date().toISOString() },
        };
        writeOnboardings(next);
        return next;
      });
    },
    [currentCreator],
  );

  const resetOnboarding = useCallback(() => {
    setOnboardings((prev) => {
      const next = {
        ...prev,
        [currentCreator.id]: {
          ...defaultOnboarding(currentCreator.id, currentCreator.name),
          scanVerified: false,
          contractSigned: false,
          tiktokHandle: '',
          onboardingStatus: 'draft' as const,
        },
      };
      writeOnboardings(next);
      return next;
    });
  }, [currentCreator]);

  const resetToApproved = useCallback(() => {
    setOnboardings((prev) => {
      const next = {
        ...prev,
        [currentCreator.id]: defaultOnboarding(currentCreator.id, currentCreator.name),
      };
      writeOnboardings(next);
      return next;
    });
  }, [currentCreator]);

  // Tasks where this creator was selected and brand has submitted (reviewing/approved)
  // If brand-side has no tasks for this creator, inject demo mocks covering all stages.
  const inboxTasks = useMemo(() => {
    const real = tasks.filter(
      (t) =>
        t.selectedCreatorIds.includes(currentCreator.id) &&
        (t.status === 'approved' || t.status === 'reviewing' || t.status === 'published'),
    );
    if (real.length > 0) return real;
    return buildCreatorMockTasks(currentCreator.id);
  }, [tasks, currentCreator]);

  const getResponse = useCallback(
    (task: OranMedTask): CreatorResponse => {
      return (
        task.creatorResponses?.[currentCreator.id] ?? {
          taskDecision: 'pending',
          publishDecision: 'pending',
          updatedAt: '',
        }
      );
    },
    [currentCreator],
  );

  const updateTaskResponse = useCallback(
    (taskId: string, patch: Partial<CreatorResponse>) => {
      setTasks((prev) => {
        const next = patchCreatorResponse(prev, taskId, currentCreator.id, patch);
        writeTasks(next);
        return next;
      });
    },
    [currentCreator],
  );

  // Aggregate stats
  const stats = useMemo(() => {
    let points = 0;
    let published = 0;
    let billed = 0;
    for (const t of inboxTasks) {
      const r = t.creatorResponses?.[currentCreator.id];
      if (!r) continue;
      if (r.points) points += r.points;
      if (r.publishedAt) published += 1;
      if (r.billAmount) billed += r.billAmount;
    }
    return { points, published, billed };
  }, [inboxTasks, currentCreator]);

  return {
    creators: creatorLibraryItems,
    currentCreator,
    setCurrentCreatorId,
    onboarding,
    patchOnboarding,
    resetOnboarding,
    resetToApproved,
    inboxTasks,
    getResponse,
    updateTaskResponse,
    stats,
  };
}
