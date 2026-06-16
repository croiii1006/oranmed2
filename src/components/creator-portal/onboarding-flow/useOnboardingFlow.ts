import { useCallback, useEffect, useState } from 'react';
import { initialFlowState, type OnboardingFlowState } from './types';

const STORAGE_KEY = 'creator_onboarding_flow_v1';

function load(): OnboardingFlowState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialFlowState, ...JSON.parse(raw) };
  } catch {}
  return initialFlowState;
}

export function useOnboardingFlow() {
  const [state, setState] = useState<OnboardingFlowState>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const patch = useCallback((p: Partial<OnboardingFlowState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  const goTo = useCallback((step: OnboardingFlowState['currentStep']) => {
    setState((s) => ({ ...s, currentStep: step }));
  }, []);

  const reset = useCallback(() => setState(initialFlowState), []);

  return { state, patch, goTo, reset };
}
