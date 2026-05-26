import { useState, useEffect, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { CandidateVideo } from './useSkillsEngine';

const PROMPT_MAX_LENGTH = 2000;

interface PromptEditorBlockProps {
  prompt: string;
  prompts?: Record<string, string>;
  candidateVideos?: CandidateVideo[];
  creatorVideoBindings?: Record<string, string>;
  onChange: (val: string, videoId?: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  memoryEnabled: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

export function PromptEditorBlock({
  prompt,
  prompts,
  candidateVideos,
  creatorVideoBindings,
  onChange,
  onConfirm,
  onBack,
  memoryEnabled,
  disabled,
  readonly,
}: PromptEditorBlockProps) {
  const promptEntries = useMemo(() => {
    const map = prompts && Object.keys(prompts).length > 0 ? prompts : null;
    if (!map) return [] as { videoId: string; title: string; prompt: string; creatorCount: number }[];
    const usageCount: Record<string, number> = {};
    if (creatorVideoBindings) {
      Object.values(creatorVideoBindings).forEach(vid => {
        usageCount[vid] = (usageCount[vid] || 0) + 1;
      });
    }
    return Object.entries(map).map(([videoId, p]) => {
      const v = candidateVideos?.find(c => c.id === videoId);
      return {
        videoId,
        title: v?.title ? (v.title.length > 16 ? v.title.slice(0, 16) + '…' : v.title) : videoId,
        prompt: p,
        creatorCount: usageCount[videoId] || 0,
      };
    });
  }, [prompts, candidateVideos, creatorVideoBindings]);

  const isMulti = promptEntries.length > 1;
  const [activeVideoId, setActiveVideoId] = useState<string>(
    () => promptEntries[0]?.videoId || ''
  );
  useEffect(() => {
    if (isMulti && !promptEntries.find(e => e.videoId === activeVideoId)) {
      setActiveVideoId(promptEntries[0]?.videoId || '');
    }
  }, [isMulti, promptEntries, activeVideoId]);

  const activeEntry = promptEntries.find(e => e.videoId === activeVideoId);
  const currentText = isMulti ? activeEntry?.prompt ?? '' : prompt;

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleChange = (val: string) => {
    if (val.length > PROMPT_MAX_LENGTH) {
      toast({ title: 'Prompt 超出限制', description: `最多 ${PROMPT_MAX_LENGTH} 个字符`, variant: 'destructive' });
      return;
    }
    onChange(val, isMulti ? activeVideoId : undefined);
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-normal text-foreground">
          生成的爆款复刻 Prompt
          {isMulti && (
            <span className="ml-2 text-[11px] font-light text-muted-foreground">
              · 共 {promptEntries.length} 套
            </span>
          )}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-light text-muted-foreground">{currentText.length}/{PROMPT_MAX_LENGTH}</span>
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
            title="复制 Prompt">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isMulti && (
        <div className="flex flex-wrap gap-1.5 -mt-1">
          {promptEntries.map((e, i) => (
            <button
              key={e.videoId}
              onClick={() => setActiveVideoId(e.videoId)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] border transition-colors',
                e.videoId === activeVideoId
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border/50 hover:border-foreground/40'
              )}
              title={e.title}>
              视频 {i + 1}
              {e.creatorCount > 0 && (
                <span className="ml-1 opacity-70">· {e.creatorCount}人</span>
              )}
            </button>
          ))}
        </div>
      )}

      <Textarea
        value={currentText}
        onChange={(e) => handleChange(e.target.value)}
        readOnly={readonly}
        className="min-h-[350px] rounded-xl border-border/40 bg-background text-sm font-mono leading-relaxed resize-none" />

      {!readonly &&
      <div className="flex items-center gap-3">
          <Button
          onClick={onConfirm}
          disabled={disabled}
          className="flex-1 rounded-xl h-10 bg-foreground text-background hover:bg-foreground/90 font-medium disabled:opacity-50">
            确认并生成
          </Button>
        </div>
      }
    </div>);
}
