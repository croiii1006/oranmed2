import { Download, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultPreviewBlockProps {
  resultVideo: {
    url: string;
    cover: string;
  };
  count?: number;
}

export function ResultPreviewBlock({ resultVideo, count = 1 }: ResultPreviewBlockProps) {
  const n = Math.max(count, 1);
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

      {n > 1 && (
        <div className="grid grid-cols-4 gap-2 px-4 pt-3">
          {Array.from({ length: n }).map((_, i) => (
            <div
              key={i}
              className="relative aspect-[9/16] overflow-hidden rounded-md border border-border/40 bg-neutral-100"
            >
              <video
                src={resultVideo.url}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] text-white">
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 p-4">
        <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-lg border-border/50 text-xs">
          <a href={resultVideo.url} download>
            <Download className="h-3.5 w-3.5" /> 导出下载{n > 1 ? `（${n} 条）` : ''}
          </a>
        </Button>
      </div>
    </div>
  );
}
