import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { newDraftTask, type Brief, type ContentAsset, type OranMedTask, type PublishPlanItem, type TaskStatus } from '../types';
import { MOCK_TASKS } from '../data/mockTasks';

const STORAGE_KEY = 'oran-med:tasks:v2';
const CURRENT_KEY = 'oran-med:current:v2';

interface OranMedContextValue {
  tasks: OranMedTask[];
  currentTaskId: string;
  currentTask: OranMedTask;
  startNewTask: () => void;
  loadTask: (id: string) => void;
  updateBrief: (brief: Partial<Brief>) => void;
  saveBrief: () => void;
  toggleCreator: (id: string) => void;
  setCreators: (ids: string[]) => void;
  setAssetMode: (mode: 'local' | 'orangen' | null) => void;
  addAsset: (asset: ContentAsset) => void;
  addAssetToTask: (taskId: string, asset: ContentAsset) => void;
  removeAsset: (id: string) => void;
  updatePlanItem: (assetId: string, patch: Partial<PublishPlanItem>) => void;
  confirmPlan: () => void;
  setCompliance: (ok: boolean) => void;
  submitForReview: () => void;
  setStatus: (status: TaskStatus) => void;
  deleteTask: (id: string) => void;
}

const OranMedContext = createContext<OranMedContextValue | undefined>(undefined);

const loadFromStorage = (): { tasks: OranMedTask[]; current: string | null } => {
  if (typeof window === 'undefined') return { tasks: MOCK_TASKS, current: null };
  try {
    const rawTasks = localStorage.getItem(STORAGE_KEY);
    const rawCurrent = localStorage.getItem(CURRENT_KEY);
    const storedTasks = rawTasks ? (JSON.parse(rawTasks) as OranMedTask[]) : MOCK_TASKS;
    const tasks = storedTasks.map((task) => {
      if (task.status !== 'rejected' || task.rejectionReason) return task;
      const sourceTask = MOCK_TASKS.find((mockTask) => mockTask.id === task.id);
      return sourceTask?.rejectionReason ? { ...task, rejectionReason: sourceTask.rejectionReason } : task;
    });
    return { tasks, current: rawCurrent };
  } catch {
    return { tasks: MOCK_TASKS, current: null };
  }
};

export function OranMedProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<OranMedTask[]>(() => loadFromStorage().tasks);
  const [currentTaskId, setCurrentTaskId] = useState<string>(() => {
    const stored = loadFromStorage().current;
    if (stored && loadFromStorage().tasks.some((t) => t.id === stored)) return stored;
    const draft = newDraftTask();
    return draft.id;
  });

  // Ensure current draft exists.
  useEffect(() => {
    setTasks((prev) => {
      if (prev.some((t) => t.id === currentTaskId)) return prev;
      return [newDraftTask(), ...prev].map((t, i) => (i === 0 ? { ...t, id: currentTaskId } : t));
    });
  }, [currentTaskId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      localStorage.setItem(CURRENT_KEY, currentTaskId);
    } catch {
      // ignore
    }
  }, [tasks, currentTaskId]);

  const currentTask = useMemo(
    () => tasks.find((t) => t.id === currentTaskId) ?? tasks[0],
    [tasks, currentTaskId],
  );

  const patchCurrent = useCallback(
    (patch: (task: OranMedTask) => OranMedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === currentTaskId ? { ...patch(t), updatedAt: new Date().toISOString() } : t)),
      );
    },
    [currentTaskId],
  );

  const startNewTask = useCallback(() => {
    const draft = newDraftTask();
    setTasks((prev) => [draft, ...prev]);
    setCurrentTaskId(draft.id);
  }, []);

  const loadTask = useCallback((id: string) => setCurrentTaskId(id), []);

  const updateBrief = useCallback(
    (brief: Partial<Brief>) => patchCurrent((t) => ({ ...t, brief: { ...t.brief, ...brief } })),
    [patchCurrent],
  );

  const saveBrief = useCallback(
    () =>
      patchCurrent((t) => ({
        ...t,
        briefSaved: true,
      })),
    [patchCurrent],
  );

  const toggleCreator = useCallback(
    (id: string) =>
      patchCurrent((t) => {
        const selected = t.selectedCreatorIds.includes(id)
          ? t.selectedCreatorIds.filter((c) => c !== id)
          : [...t.selectedCreatorIds, id];
        return { ...t, selectedCreatorIds: selected };
      }),
    [patchCurrent],
  );

  const setCreators = useCallback(
    (ids: string[]) => patchCurrent((t) => ({ ...t, selectedCreatorIds: ids })),
    [patchCurrent],
  );

  const setAssetMode = useCallback(
    (mode: 'local' | 'orangen' | null) =>
      patchCurrent((t) => ({
        ...t,
        assetMode: mode,
      })),
    [patchCurrent],
  );

  const addAsset = useCallback(
    (asset: ContentAsset) => patchCurrent((t) => ({ ...t, assets: [...t.assets, asset] })),
    [patchCurrent],
  );

  const removeAsset = useCallback(
    (id: string) =>
      patchCurrent((t) => ({
        ...t,
        assets: t.assets.filter((a) => a.id !== id),
        plan: t.plan.filter((p) => p.assetId !== id),
      })),
    [patchCurrent],
  );

  const updatePlanItem = useCallback(
    (assetId: string, patch: Partial<PublishPlanItem>) =>
      patchCurrent((t) => {
        const exists = t.plan.find((p) => p.assetId === assetId);
        if (exists) {
          return { ...t, plan: t.plan.map((p) => (p.assetId === assetId ? { ...p, ...patch } : p)) };
        }
        const asset = t.assets.find((a) => a.id === assetId);
        if (!asset) return t;
        const fresh: PublishPlanItem = {
          assetId,
          creatorId: asset.creatorId,
          platform: t.brief.platform,
          scheduledAt: '',
          caption: '',
          hashtags: '',
          paidPromotion: false,
          ...patch,
        };
        return { ...t, plan: [...t.plan, fresh] };
      }),
    [patchCurrent],
  );

  const confirmPlan = useCallback(
    () => patchCurrent((t) => ({ ...t, planConfirmed: true })),
    [patchCurrent],
  );

  const setCompliance = useCallback(
    (ok: boolean) => patchCurrent((t) => ({ ...t, complianceConfirmed: ok })),
    [patchCurrent],
  );

  const submitForReview = useCallback(
    () => patchCurrent((t) => ({ ...t, status: 'reviewing' })),
    [patchCurrent],
  );

  const setStatus = useCallback(
    (status: TaskStatus) => patchCurrent((t) => ({ ...t, status })),
    [patchCurrent],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (id === currentTaskId) {
          const fallback = next.find((t) => t.status === 'draft');
          if (fallback) {
            setCurrentTaskId(fallback.id);
            return next;
          }
          const draft = newDraftTask();
          setCurrentTaskId(draft.id);
          return [draft, ...next];
        }
        return next;
      });
    },
    [currentTaskId],
  );

  const value = useMemo<OranMedContextValue>(
    () => ({
      tasks,
      currentTaskId,
      currentTask,
      startNewTask,
      loadTask,
      updateBrief,
      saveBrief,
      toggleCreator,
      setCreators,
      setAssetMode,
      addAsset,
      removeAsset,
      updatePlanItem,
      confirmPlan,
      setCompliance,
      submitForReview,
      setStatus,
      deleteTask,
    }),
    [tasks, currentTaskId, currentTask, startNewTask, loadTask, updateBrief, saveBrief, toggleCreator, setCreators, setAssetMode, addAsset, removeAsset, updatePlanItem, confirmPlan, setCompliance, submitForReview, setStatus, deleteTask],
  );

  return <OranMedContext.Provider value={value}>{children}</OranMedContext.Provider>;
}

export function useOranMed() {
  const ctx = useContext(OranMedContext);
  if (!ctx) throw new Error('useOranMed must be used within OranMedProvider');
  return ctx;
}
