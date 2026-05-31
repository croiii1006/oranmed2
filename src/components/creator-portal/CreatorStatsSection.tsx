import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  stats: { points: number; published: number; billed: number };
}

export function CreatorStatsSection({ stats }: Props) {
  const items = [
    { label: '积分', value: stats.points },
    { label: '已发布', value: stats.published },
    { label: '账单 (¥)', value: stats.billed },
  ];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">我的数据</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {items.map((it) => (
            <div
              key={it.label}
              className="rounded-md border border-border bg-card p-3 text-center"
            >
              <div className="text-lg font-semibold tabular-nums">{it.value}</div>
              <div className="text-[11px] text-muted-foreground">{it.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
