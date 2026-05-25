import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

export interface OranGenPrefillBrief {
  title: string;
  brandName: string;
  brandCategory: string;
  audience: string;
  goal: string;
  styleRequirements: string;
  brandTags: string;
  platform: string;
}

export interface OranGenPrefillCreator {
  id: string;
  name: string;
  avatarUrl?: string;
  platform?: string;
  tier?: string;
}

export interface OranGenPrefill {
  attachmentIds: string[];
  attachmentNames: string[];
  category?: string;
  sellingPoints?: string;
  /** When set, prefill originated from another module and should round-trip back. */
  source?: 'oran-med';
  returnTaskId?: string;
  brief?: OranGenPrefillBrief;
  creators?: OranGenPrefillCreator[];
  productImage?: { name: string; url: string };
  /** If true, SkillsModule should auto-complete setup using the prefilled data. */
  autoStart?: boolean;
}

interface OranGenPrefillContextValue {
  prefill: OranGenPrefill | null;
  setPrefill: (data: OranGenPrefill) => void;
  consumePrefill: () => OranGenPrefill | null;
}

const OranGenPrefillContext = createContext<OranGenPrefillContextValue | null>(null);

export function OranGenPrefillProvider({ children }: { children: ReactNode }) {
  const [prefill, setPrefillState] = useState<OranGenPrefill | null>(null);

  const setPrefill = useCallback((data: OranGenPrefill) => {
    setPrefillState(data);
  }, []);

  const consumePrefill = useCallback(() => {
    const data = prefill;
    setPrefillState(null);
    return data;
  }, [prefill]);

  return (
    <OranGenPrefillContext.Provider value={{ prefill, setPrefill, consumePrefill }}>
      {children}
    </OranGenPrefillContext.Provider>
  );
}

export function useOranGenPrefill() {
  const ctx = useContext(OranGenPrefillContext);
  if (!ctx) {
    throw new Error('useOranGenPrefill must be used within OranGenPrefillProvider');
  }
  return ctx;
}
