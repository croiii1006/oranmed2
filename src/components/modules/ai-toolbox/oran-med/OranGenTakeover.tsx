import { useEffect } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { SkillsModule } from '@/components/modules/skills/SkillsModule';
import { useOranGenPrefill } from '@/contexts/OranGenPrefillContext';

interface Props {
  prefill: {
    category?: string;
    sellingPoints?: string;
    attachmentIds?: string[];
    attachmentNames?: string[];
  };
  onClose: () => void;
  onFinish: () => void;
}

/**
 * Full-screen takeover that embeds the complete ORANGEN (Skills) workflow
 * inside an OranMed task. Used when assetMode === 'orangen'.
 *
 * Lives above the OranMed workflow page; preserves OranMed state behind it.
 */
export function OranGenTakeover({ prefill, onClose, onFinish }: Props) {
  const { setPrefill } = useOranGenPrefill();

  useEffect(() => {
    setPrefill({
      attachmentIds: prefill.attachmentIds ?? [],
      attachmentNames: prefill.attachmentNames ?? [],
      category: prefill.category,
      sellingPoints: prefill.sellingPoints,
    });
  }, [prefill.category, prefill.sellingPoints, prefill.attachmentIds, prefill.attachmentNames, setPrefill]);

  return (
    <div className="fixed inset-0 left-[64px] top-14 z-40 flex flex-col bg-background">
      {/* Slim top bar – overlays the SkillsModule top area */}
      <div className="flex items-center justify-between border-b border-border/30 bg-background/95 px-4 py-2 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>返回投放任务</span>
        </button>
        <div className="text-xs text-muted-foreground">
          ORAN GEN · 为 <span className="text-foreground">{prefill.category || '本次任务'}</span> 生成内容
        </div>
        <button
          onClick={onFinish}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#FF5500]/30 bg-white px-4 py-1.5 text-xs font-medium text-[#FF5500] shadow-sm transition-all hover:bg-[#FF5500]/5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          完成生成并加入素材
        </button>
      </div>
      {/* Skills module fills the rest */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <SkillsModule />
      </div>
    </div>
  );
}
