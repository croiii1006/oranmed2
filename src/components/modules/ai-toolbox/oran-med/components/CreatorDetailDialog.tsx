import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import type { Creator } from '../types';
import { CreatorDetailContent, AccountBadge } from './CreatorDetailContent';

export interface CreatorDetailDialogProps {
  creator: Creator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showMatch?: boolean;
}

export function CreatorDetailDialog({ creator, open, onOpenChange, showMatch }: CreatorDetailDialogProps) {
  if (!creator) return null;
  const c = creator;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
              {c.avatarUrl ? <img src={c.avatarUrl} alt={c.name} className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="flex items-center gap-2 text-base">
                {c.name}
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{c.tier}</Badge>
                <AccountBadge status={c.accountStatus} />
              </DialogTitle>
              <DialogDescription className="mt-0.5 flex items-center gap-1 text-[11px]">
                {c.profileUrl ? (
                  <a
                    href={c.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-foreground/70 hover:text-foreground"
                  >
                    {c.handle} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span>{c.handle}</span>
                )}
                <span className="text-muted-foreground/60">·</span>
                <span>{c.platform}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <CreatorDetailContent creator={c} showMatch={showMatch} showHeader={false} />
      </DialogContent>
    </Dialog>
  );
}
