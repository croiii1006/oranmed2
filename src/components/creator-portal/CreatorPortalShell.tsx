import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreatorLibraryItem } from '@/components/modules/skills/creatorLibrary';
import type { CreatorOnboardingStatus } from '@/components/modules/ai-toolbox/oran-med/types';

const STATUS_LABEL: Record<CreatorOnboardingStatus, string> = {
  draft: '待入驻',
  submitted: '审核中',
  approved: '已通过',
  rejected: '已拒绝',
};

const STATUS_TONE: Record<CreatorOnboardingStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

interface Props {
  creators: CreatorLibraryItem[];
  currentCreator: CreatorLibraryItem;
  onChange: (id: string) => void;
  onboardingStatus: CreatorOnboardingStatus;
}

export function CreatorPortalShell({
  creators,
  currentCreator,
  onChange,
  onboardingStatus,
}: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[520px] items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentCreator.avatarUrl} alt={currentCreator.name} />
            <AvatarFallback>{currentCreator.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-semibold leading-tight">{currentCreator.name}</div>
            <div className="text-xs text-muted-foreground">{currentCreator.handle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_TONE[onboardingStatus]} variant="secondary">
            {STATUS_LABEL[onboardingStatus]}
          </Badge>
          <Select value={currentCreator.id} onValueChange={onChange}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="切换达人" />
            </SelectTrigger>
            <SelectContent className="max-h-[60vh]">
              {creators.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
