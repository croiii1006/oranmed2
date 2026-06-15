import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Sparkles, Gift, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useInvite } from '@/contexts/InviteContext';
import logoDark from '@/assets/logo_dark.svg';
import { DEFAULT_PATH } from '@/navigation';

const ORANGE = 'hsl(20 95% 55%)';

export default function RegisterDemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCode = searchParams.get('invite_code') ?? '';
  const { inviteeReward, defaultNewUserCredits, validateCode } = useInvite();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(urlCode.toUpperCase());
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (urlCode) setCode(urlCode.toUpperCase());
  }, [urlCode]);

  const status = useMemo(() => validateCode(code), [code, validateCode]);
  const willGetCredits = status === 'valid' ? inviteeReward : defaultNewUserCredits;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!email || !password) {
      toast.error('请填写邮箱和密码');
      return;
    }
    if (status === 'valid') {
      toast.success(`注册成功！你获得 ${inviteeReward} 积分（含 ${defaultNewUserCredits} 新用户积分 + ${inviteeReward - defaultNewUserCredits} 邀请奖励积分）`);
    } else {
      toast.success(`注册成功！你获得 ${defaultNewUserCredits} 默认新用户积分`);
    }
    setTimeout(() => navigate(DEFAULT_PATH), 1200);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Demo banner */}
        <div className="mb-4 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            注册页 Demo（仅前端模拟）：用于演示 URL 自动带入 invite_code、手动填写邀请码、无效邀请码提示等链路。
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <img src={logoDark} alt="ORAN AI" className="w-7 h-7" />
            <span className="text-lg font-medium">注册 ORAN AI</span>
          </div>

          {urlCode && status === 'valid' && (
            <div
              className="mb-5 rounded-lg border px-3 py-2.5 flex items-center gap-2 text-sm"
              style={{ borderColor: 'hsl(20 95% 55% / 0.4)', background: 'hsl(20 95% 55% / 0.08)' }}
            >
              <Gift className="w-4 h-4 text-[hsl(20_95%_55%)]" />
              <span className="text-foreground">
                已识别邀请码，注册成功你将获得{' '}
                <span className="font-semibold text-[hsl(20_95%_45%)]">{inviteeReward}</span> 积分
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 8 位"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs flex items-center justify-between">
                <span>邀请码（选填）</span>
                {status === 'valid' && (
                  <span className="text-[10px] text-[hsl(20_95%_45%)] flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> 有效邀请码
                  </span>
                )}
                {touched && status === 'invalid' && code && (
                  <span className="text-[10px] text-destructive flex items-center gap-0.5">
                    <X className="w-3 h-3" /> 邀请码无效
                  </span>
                )}
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="如：12ABCDEF"
                maxLength={8}
                className="font-mono tracking-widest"
              />
              {touched && status === 'invalid' && code && (
                <p className="text-[11px] text-muted-foreground">
                  邀请码无效，可清空后继续注册（不影响默认 {defaultNewUserCredits} 积分）。
                </p>
              )}
            </div>

            <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[hsl(20_95%_55%)]" />
              注册后你将获得 <span className="font-medium text-foreground">{willGetCredits}</span> 积分
            </div>

            <Button
              type="submit"
              className="w-full h-11 gap-1.5"
              style={{ background: ORANGE, color: '#fff' }}
            >
              注册
            </Button>
          </form>

          <p className="text-[11px] text-muted-foreground text-center mt-5">
            <Link to={DEFAULT_PATH} className="hover:text-foreground transition-colors">
              返回应用
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
