import type {
  CreatorOnboarding,
  CreatorResponse,
  OranMedTask,
} from '@/components/modules/ai-toolbox/oran-med/types';

export const TASKS_KEY = 'oran-med:tasks:v2';
export const CREATORS_KEY = 'oran-med:creators:v1';
export const CURRENT_CREATOR_KEY = 'oran-med:current-creator:v1';

export function readTasks(): OranMedTask[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? (JSON.parse(raw) as OranMedTask[]) : [];
  } catch {
    return [];
  }
}

export function writeTasks(tasks: OranMedTask[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export function readOnboardings(): Record<string, CreatorOnboarding> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CREATORS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CreatorOnboarding>) : {};
  } catch {
    return {};
  }
}

export function writeOnboardings(map: Record<string, CreatorOnboarding>) {
  try {
    localStorage.setItem(CREATORS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function patchCreatorResponse(
  tasks: OranMedTask[],
  taskId: string,
  creatorId: string,
  patch: Partial<CreatorResponse>,
): OranMedTask[] {
  return tasks.map((t) => {
    if (t.id !== taskId) return t;
    const prev = t.creatorResponses?.[creatorId] ?? {
      taskDecision: 'pending' as const,
      publishDecision: 'pending' as const,
      updatedAt: new Date().toISOString(),
    };
    return {
      ...t,
      creatorResponses: {
        ...(t.creatorResponses ?? {}),
        [creatorId]: { ...prev, ...patch, updatedAt: new Date().toISOString() },
      },
      updatedAt: new Date().toISOString(),
    };
  });
}
