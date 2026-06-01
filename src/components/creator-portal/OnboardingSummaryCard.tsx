import { useState } from 'react';
import { ChevronDown, ShieldCheck, FileSignature, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CreatorOnboarding } from '@/components/modules/ai-toolbox/oran-med/types';

interface Props {
  onboarding: CreatorOnboarding;
  onReset: () => void;
}

export function OnboardingSummaryCard({ onboarding, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const items = [
    { icon: ShieldCheck, label: '扫脸认证' },
    { icon: FileSignature, label: '合同签署' },
    { icon: Send, label: '入驻提交' },
  ];

  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">入驻已通过</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              可接收品牌任务并完成发布
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            onClick={onReset}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            重置演示
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {items.map((it) => (
            <div
              key={it.label}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-[11px] text-emerald-700 dark:text-emerald-300"
            >
              <it.icon className="h-3 w-3" />
              {it.label}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-md px-1 py-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <span>认证资料</span>
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-md border border-border/60 bg-card p-3 text-[11px]">
            <Row label="姓名" value={onboarding.name} />
            <Row label="出生年月" value={onboarding.birth} />
            <Row label="国家" value={onboarding.country} />
            <Row label="城市" value={onboarding.city} />
            <Row label="证件号" value={onboarding.idNo} />
            <Row label="证件照" value={onboarding.idPhoto} />
            <Row label="TikTok" value={onboarding.tiktokHandle} full />
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, full }: { label: string; value?: string; full?: boolean }) {
  return (
    <div className={cn('flex flex-col', full && 'col-span-2')}>
      <dt className="text-muted-foreground/70">{label}</dt>
      <dd className="truncate text-foreground">{value || '—'}</dd>
    </div>
  );
}
