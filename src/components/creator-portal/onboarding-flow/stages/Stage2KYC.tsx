import { ArrowRight, Upload, FileText, X } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StageShell } from '../StageShell';
import type { OnboardingFlowState } from '../types';
import { cn } from '@/lib/utils';

interface Props {
  state: OnboardingFlowState;
  patch: (p: Partial<OnboardingFlowState>) => void;
  onNext: () => void;
}

const COUNTRIES = [
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'GB', label: '🇬🇧 United Kingdom' },
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'JP', label: '🇯🇵 Japan' },
  { value: 'KR', label: '🇰🇷 South Korea' },
  { value: 'CN', label: '🇨🇳 China' },
];

const ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID Card' },
  { value: 'drivers_license', label: "Driver's License" },
];

export function Stage2KYC({ state, patch, onNext }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const canNext =
    state.fullName.trim() &&
    state.country &&
    state.idType &&
    /\S+@\S+\.\S+/.test(state.paypalEmail) &&
    state.idFileName &&
    state.tosAccepted;

  const handlePick = (f?: File) => {
    if (f) patch({ idFileName: f.name });
  };

  return (
    <StageShell
      index="02"
      title="资质提交"
      subtitle="上传证件，填写税务及收款信息，同意平台服务条款"
      badge={{ label: canNext ? '已就绪' : '待填写', tone: canNext ? 'success' : 'default' }}
    >
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <Field label="姓名" required>
          <Input
            value={state.fullName}
            onChange={(e) => patch({ fullName: e.target.value })}
            placeholder="请输入法定姓名"
          />
        </Field>

        <Field label="国家" required>
          <Select value={state.country} onValueChange={(v) => patch({ country: v })}>
            <SelectTrigger><SelectValue placeholder="选择国家" /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="证件类型" required>
          <Select value={state.idType} onValueChange={(v) => patch({ idType: v })}>
            <SelectTrigger><SelectValue placeholder="选择证件类型" /></SelectTrigger>
            <SelectContent>
              {ID_TYPES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="PayPal 邮箱" required>
          <Input
            type="email"
            value={state.paypalEmail}
            onChange={(e) => patch({ paypalEmail: e.target.value })}
            placeholder="your@email.com"
          />
        </Field>

        <div className="col-span-2 space-y-1.5">
          <Label className="text-[11.5px] text-muted-foreground">
            证件上传 <span className="text-accent">*</span>
          </Label>
          {!state.idFileName ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-5 py-7 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/5"
            >
              <Upload className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <div className="text-[12.5px] text-foreground">点击上传 或 拖拽文件至此处</div>
              <div className="text-[10.5px] text-muted-foreground">支持 JPG / PNG / PDF，最大 10MB</div>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
                <FileText className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium text-foreground">{state.idFileName}</div>
                <div className="text-[10.5px] text-muted-foreground">已上传</div>
              </div>
              <button
                type="button"
                onClick={() => patch({ idFileName: '' })}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(e) => handlePick(e.target.files?.[0])}
          />
        </div>
      </div>

      {/* TOS */}
      <div className="mt-7">
        <Label className="text-[11.5px] text-muted-foreground">
          平台服务条款 (TOS) <span className="text-accent">*</span>
        </Label>
        <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-border/60 bg-muted/10 p-4 text-[11.5px] leading-relaxed text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground/90">PLATFORM TERMS OF SERVICE</p>
          <p className="mb-2"><strong className="text-foreground/80">1. Platform Role</strong> — 平台作为创作者与品牌方之间的中介，不保证最低收入或合作数量。</p>
          <p className="mb-2"><strong className="text-foreground/80">2. Data Usage</strong> — 授权 TikTok 账号即允许平台访问公开档案数据用于匹配与分析，不会出售给第三方。</p>
          <p className="mb-2"><strong className="text-foreground/80">3. Content Standards</strong> — 所有内容须遵守 TikTok 社区准则与所在地区广告法规。</p>
          <p className="mb-2"><strong className="text-foreground/80">4. Account Suspension</strong> — 平台保留对提供虚假信息或违反条款账户的封禁权利。</p>
          <p><strong className="text-foreground/80">5. Privacy</strong> — 您的生物识别数据将加密存储，验证完成后 30 天内删除。</p>
        </div>
        <label className={cn(
          'mt-3 flex cursor-pointer items-start gap-2.5 rounded-lg border px-4 py-3 transition-colors',
          state.tosAccepted ? 'border-accent/40 bg-accent/5' : 'border-border bg-muted/20 hover:bg-muted/30',
        )}>
          <Checkbox
            checked={state.tosAccepted}
            onCheckedChange={(v) => patch({ tosAccepted: !!v })}
            className="mt-0.5"
          />
          <span className="text-[12px] leading-relaxed text-foreground/85">
            我已阅读并同意《平台服务条款》。我理解此条款仅涉及平台使用规则，不涉及商业分成或佣金安排。
          </span>
        </label>
      </div>

      <div className="mt-7 flex justify-end">
        <Button onClick={onNext} disabled={!canNext} className="group gap-1.5">
          下一步 — 设置报价
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </StageShell>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11.5px] text-muted-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </Label>
      {children}
    </div>
  );
}
