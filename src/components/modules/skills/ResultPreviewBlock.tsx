import { Download, Film, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CandidateVideo } from './useSkillsEngine';
import type { CreatorLibraryItem } from './creatorLibrary';

interface ResultPreviewBlockProps {
  resultVideo: {
    url: string;
    cover: string;
  };
  count?: number;
  onReturnToOranMed?: () => void;
  creators?: CreatorLibraryItem[];
  candidateVideos?: CandidateVideo[];
  creatorVideoBindings?: Record<string, string>;
}

export function ResultPreviewBlock({
  resultVideo,
  count = 1,
  onReturnToOranMed,
  creators = [],
  candidateVideos = [],
  creatorVideoBindings = {},
}: ResultPreviewBlockProps) {
  const useBindings = creators.length > 0;
  const n = useBindings ? creators.length : Math.max(count, 1);

  const gridColsClass =
    n === 1 ? 'grid-cols-1'
      : n === 2 ? 'grid-cols-2'
      : n === 3 ? 'grid-cols-3'
      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <div className="overflow-hidden rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border/30 px-5 py-3">
        <h4 className="text-sm font-normal text-foreground">复刻视频预览</h4>
        {n > 1 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground">
            <Film className="h-3 w-3" /> 共 {n} 条
          </span>
        )}
      </div>

      {n === 1 && !useBindings ? (
        <div className="relative flex aspect-video items-center justify-center bg-neutral-50">
          <video
            src={resultVideo.url}
            className="result-preview-video h-full w-full object-contain"
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        </div>
      ) : (
        <div className={`grid gap-3 p-4 ${gridColsClass}`}>
          {Array.from({ length: n }).map((_, i) => {
            const creator = useBindings ? creators[i] : null;
            const boundVideoId = creator ? creatorVideoBindings[creator.id] : undefined;
            const refVideo = boundVideoId ? candidateVideos.find((v) => v.id === boundVideoId) : null;
            return (
              <div
                key={creator?.id ?? i}
                className="relative overflow-hidden rounded-lg border border-border/40 bg-neutral-50"
              >
                <div className="relative aspect-[9/16] w-full bg-black">
                  <video
                    src={resultVideo.url}
                    className="absolute inset-0 h-full w-full object-contain"
                    controls
                    playsInline
                    preload="metadata"
                  />
                </div>
                <div className="space-y-0.5 border-t border-border/30 px-2 py-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-medium text-foreground">
                      {creator ? creator.name : `复刻视频 #${i + 1}`}
                    </span>
                    <a
                      href={resultVideo.url}
                      download
                      className="inline-flex shrink-0 items-center gap-1 text-[11px] text-foreground hover:underline"
                    >
                      <Download className="h-3 w-3" /> 下载
                    </a>
                  </div>
                  {refVideo && (
                    <div className="flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                      <Film className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">对标：{refVideo.title}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 p-4 pt-0">
        <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-lg border-border/50 text-xs">
          <a href={resultVideo.url} download>
            <Download className="h-3.5 w-3.5" /> 导出下载{n > 1 ? `（${n} 条）` : ''}
          </a>
        </Button>
        {onReturnToOranMed && (
          <Button
            type="button"
            size="sm"
            onClick={onReturnToOranMed}
            className="gap-1.5 rounded-lg bg-[#FF5500] text-xs text-white hover:bg-[#FF5500]/90"
          >
            回到 OranMed 发布
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
