import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import type { CreatorOnboarding } from '@/components/modules/ai-toolbox/oran-med/types';

interface Props {
  onboarding: CreatorOnboarding;
  patch: (p: Partial<CreatorOnboarding>) => void;
}

export function OnboardingSection({ onboarding, patch }: Props) {
  const [form, setForm] = useState({
    birth: onboarding.birth ?? '',
    country: onboarding.country ?? '',
    city: onboarding.city ?? '',
    idNo: onboarding.idNo ?? '',
    idPhoto: onboarding.idPhoto ?? '',
    tiktokHandle: onboarding.tiktokHandle ?? '',
  });

  const update = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const saveBasic = () => {
    patch({
      birth: form.birth,
      country: form.country,
      city: form.city,
      idNo: form.idNo,
      idPhoto: form.idPhoto,
    });
    toast({ title: '基本信息已保存' });
  };

  const handleScan = () => {
    patch({ scanVerified: true });
    toast({ title: '扫脸认证通过' });
  };

  const handleSign = () => {
    patch({ contractSigned: true });
    toast({ title: '合同已签署' });
  };

  const handleSubmit = () => {
    patch({ tiktokHandle: form.tiktokHandle, onboardingStatus: 'submitted' });
    toast({ title: '入驻申请已提交，等待平台审核' });
  };

  // Demo helpers (no platform end yet)
  const demoApprove = () => patch({ onboardingStatus: 'approved' });
  const demoReject = () =>
    patch({ onboardingStatus: 'rejected', rejectionReason: '资料不全（演示）' });

  const status = onboarding.onboardingStatus;
  const locked = status === 'approved';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">入驻认证</CardTitle>
        {status !== 'approved' && (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={demoApprove}>
              模拟通过
            </Button>
            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={demoReject}>
              模拟拒绝
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">出生年月</Label>
            <Input
              type="month"
              value={form.birth}
              onChange={(e) => update('birth', e.target.value)}
              disabled={locked}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">所在国家</Label>
            <Input
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              disabled={locked}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">所在城市</Label>
            <Input
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              disabled={locked}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">证件号码</Label>
            <Input
              value={form.idNo}
              onChange={(e) => update('idNo', e.target.value)}
              disabled={locked}
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">证件照片文件名</Label>
            <Input
              value={form.idPhoto}
              onChange={(e) => update('idPhoto', e.target.value)}
              disabled={locked}
            />
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={saveBasic} disabled={locked}>
          保存基本信息
        </Button>

        <div className="grid grid-cols-3 gap-2 border-t pt-3">
          <Button
            size="sm"
            onClick={handleScan}
            disabled={onboarding.scanVerified || locked}
          >
            {onboarding.scanVerified ? '✓ 扫脸已认证' : '扫脸认证'}
          </Button>
          <Button
            size="sm"
            onClick={handleSign}
            disabled={!onboarding.scanVerified || onboarding.contractSigned || locked}
          >
            {onboarding.contractSigned ? '✓ 合同已签' : '签署合同'}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={
              !onboarding.contractSigned ||
              status === 'submitted' ||
              status === 'approved' ||
              !form.tiktokHandle
            }
          >
            提交入驻
          </Button>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">TikTok 账号</Label>
          <Input
            value={form.tiktokHandle}
            onChange={(e) => update('tiktokHandle', e.target.value)}
            placeholder="@yourhandle"
            disabled={locked}
          />
        </div>

        {status === 'rejected' && onboarding.rejectionReason && (
          <div className="rounded-md bg-rose-50 p-2 text-xs text-rose-700">
            被拒绝：{onboarding.rejectionReason}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
