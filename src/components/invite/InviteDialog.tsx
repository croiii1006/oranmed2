import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Copy, Gift, Users, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useInvite, type InviteRecordStatus } from '@/contexts/InviteContext';
import { cn } from '@/lib/utils';

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function statusLabel(status: InviteRecordStatus) {
  switch (status) {
    case 'rewarded':
      return { text: '已奖励', cls: 'bg-[hsl(20_95%_55%)]/15 text-[hsl(20_95%_45%)] border-[hsl(20_95%_55%)]/30' };
    case 'capped':
      return { text: '已达上限', cls: 'bg-muted text-muted-foreground border-border' };
    case 'failed':
      return { text: '发放失败', cls: 'bg-destructive/15 text-destructive border-destructive/30' };
  }
}

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const {
    inviteCode,
    inviteUrl,
    shareText,
    rewardedCount,
    rewardLimit,
    remainingRewards,
    totalEarnedCredits,
    invitedCount,
    records,
    inviterReward,
    inviteeReward,
    defaultNewUserCredits,
    isCapped,
    simulateInvite,
  } = useInvite();
  const [simName, setSimName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (text: string, label: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`${label}已复制`);
      setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1500);
    } catch {
      toast.error('复制失败，请手动复制');
    }
  };

  const handleSimulate = () => {
    const r = simulateInvite(simName);
    setSimName('');
    if (r.status === 'rewarded') {
      toast.success(`好友 ${r.inviteeName} 注册成功，你获得 +${r.inviterCredits} 积分`);
    } else {
      toast(`好友 ${r.inviteeName} 注册成功，但你已达 ${rewardLimit} 次奖励上限`, {
        description: `Ta 仍获得 ${r.inviteeCredits} 默认新用户积分`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto space-y-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-medium text-foreground/70">
            <Gift className="w-5 h-5 text-[hsl(20_95%_55%)]" />
            邀请好友 · 双方得积分
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            把你的专属邀请码或链接分享给好友，好友注册成功你和好友都能拿积分。
          </DialogDescription>
        </DialogHeader>

        {/* 奖励规则 */}
        <div
          className="rounded-xl border p-3.5"
          style={{ borderColor: 'hsl(20 95% 55% / 0.2)', background: 'hsl(20 95% 55% / 0.04)' }}
        >
          <div className="text-sm">
            <div className="font-medium text-muted-foreground mb-1">奖励规则</div>
            <div className="text-muted-foreground/80 leading-relaxed text-[13px]">
              好友通过你的邀请码注册成功：你得{' '}
              <span className="font-semibold text-[hsl(20_95%_45%)]">{inviterReward}</span> 积分，好友得{' '}
              <span className="font-semibold text-[hsl(20_95%_45%)]">{inviteeReward}</span> 积分。
              每位用户作为邀请人累计最多获得 <span className="font-medium text-muted-foreground">{rewardLimit}</span> 次奖励，
              达上限后好友仍可获得 {defaultNewUserCredits} 默认新用户积分。
            </div>
          </div>
        </div>

        {/* 分享工具 */}
        <div className="rounded-xl bg-muted/20 p-4 space-y-3">
          {/* 邀请码 */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">你的专属邀请码</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-10 rounded-md bg-muted/40 flex items-center px-4 font-mono text-lg tracking-[0.25em] font-medium text-foreground/70">
                {inviteCode}
              </div>
              <Button
                variant="ghost"
                onClick={() => copy(inviteCode, '邀请码', 'code')}
                className={cn(
                  'h-9 px-3 text-xs gap-1.5 transition-all duration-200',
                  copiedKey === 'code'
                    ? 'text-[hsl(20_95%_45%)] bg-[hsl(20_95%_55%)]/10'
                    : 'text-muted-foreground hover:text-[hsl(20_95%_45%)] hover:bg-[hsl(20_95%_55%)]/10'
                )}
              >
                {copiedKey === 'code' ? (
                  <Check className="w-3.5 h-3.5 animate-scale-in" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey === 'code' ? '已复制' : '复制'}
              </Button>
            </div>
          </div>

          {/* 邀请链接 */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">邀请链接</label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteUrl}
                className="font-mono text-xs h-10 border-0 bg-muted/40 focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                onClick={() => copy(inviteUrl, '邀请链接', 'link')}
                className={cn(
                  'h-9 px-3 text-xs gap-1.5 transition-all duration-200',
                  copiedKey === 'link'
                    ? 'text-[hsl(20_95%_45%)] bg-[hsl(20_95%_55%)]/10'
                    : 'text-muted-foreground hover:text-[hsl(20_95%_45%)] hover:bg-[hsl(20_95%_55%)]/10'
                )}
              >
                {copiedKey === 'link' ? (
                  <Check className="w-3.5 h-3.5 animate-scale-in" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey === 'link' ? '已复制' : '复制'}
              </Button>
            </div>
          </div>

          {/* 分享文案 */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">
              分享文案 <span className="text-[11px] text-muted-foreground/70">（微信 / 飞书 / Telegram 等）</span>
            </label>
            <Textarea
              readOnly
              value={shareText}
              className="text-xs leading-relaxed min-h-[88px] resize-none border-0 bg-muted/40 focus-visible:ring-0"
            />
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => copy(shareText, '分享文案', 'text')}
                className={cn(
                  'h-9 px-3 text-xs gap-1.5 transition-all duration-200',
                  copiedKey === 'text'
                    ? 'text-[hsl(20_95%_45%)] bg-[hsl(20_95%_55%)]/10'
                    : 'text-muted-foreground hover:text-[hsl(20_95%_45%)] hover:bg-[hsl(20_95%_55%)]/10'
                )}
              >
                {copiedKey === 'text' ? (
                  <Check className="w-3.5 h-3.5 animate-scale-in" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey === 'text' ? '已复制' : '复制完整分享文案'}
              </Button>
            </div>
          </div>
        </div>

        {/* 剩余额度与统计 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-muted/30 p-3">
            <div className="text-[11px] text-muted-foreground/70">剩余奖励次数</div>
            <div className="text-lg font-semibold text-foreground/60 mt-1">
              {remainingRewards}
              <span className="text-xs font-normal text-muted-foreground/60">/{rewardLimit}</span>
            </div>
            <Progress
              value={(rewardedCount / rewardLimit) * 100}
              className="h-1 mt-2"
            />
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <div className="text-[11px] text-muted-foreground/70">已邀请人数</div>
            <div className="text-lg font-semibold text-foreground/60 mt-1">
              {invitedCount}
              <Users className="w-3 h-3 inline ml-1 text-muted-foreground/50" />
            </div>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <div className="text-[11px] text-muted-foreground/70">累计获得积分</div>
            <div className="text-lg font-semibold text-[hsl(20_95%_45%)] mt-1">
              +{totalEarnedCredits}
            </div>
          </div>
        </div>

        {/* Demo: 模拟 */}
        <div className="rounded-xl bg-muted/20 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
            <AlertCircle className="w-3 h-3" />
            Demo 演示：模拟好友通过你的邀请码注册成功
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
              placeholder="好友昵称（选填）"
              className="text-sm h-9 bg-muted/40 border-0"
            />
            <Button variant="secondary" onClick={handleSimulate} className="gap-1.5 shrink-0 h-9 text-xs">
              <Check className="w-3.5 h-3.5" /> 模拟注册成功
            </Button>
          </div>
          {isCapped && (
            <div className="text-[11px] text-[hsl(20_95%_45%)]">
              你已达到 {rewardLimit} 次奖励上限，后续好友注册不再发放邀请奖励，但 ta 仍可获得 {defaultNewUserCredits} 默认新用户积分。
            </div>
          )}
        </div>

        {/* 邀请记录 */}
        {records.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] text-muted-foreground/70">邀请记录</div>
            <div className="rounded-xl bg-muted/20 overflow-hidden">
              <div className="max-h-48 overflow-y-auto divide-y divide-border/50">
                {records.map((r) => {
                  const s = statusLabel(r.status);
                  return (
                    <div key={r.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center text-[10px] font-medium shrink-0 text-muted-foreground">
                          {r.inviteeName.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-muted-foreground truncate text-[13px]">{r.inviteeName}</div>
                          <div className="text-[11px] text-muted-foreground/60">
                            {new Date(r.registeredAt).toLocaleString('zh-CN', { hour12: false })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground/60">
                          {r.inviterCredits > 0 ? `+${r.inviterCredits}` : '+0'}
                        </span>
                        <Badge variant="outline" className={cn('text-[10px] font-normal', s.cls)}>
                          {s.text}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground text-center pt-1">
          通过用户邀请码注册的好友，不会被归属到渠道来源，也不参与渠道分佣统计。
        </p>
      </DialogContent>
    </Dialog>
  );
}
