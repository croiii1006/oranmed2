import type { Creator } from '../types';
import { PLATFORMS, type Platform } from '../types';
import { creatorLibraryItems } from '@/components/modules/skills/creatorLibrary';

// Parse followers string like "182.4K" / "12.4万" into a numeric (units of 万) for tier/avgPlay derivation.
function parseFollowers(raw: string): number {
  const m = raw.match(/([\d.]+)/);
  if (!m) return 10;
  const n = parseFloat(m[1]);
  if (raw.includes('万') || raw.includes('w') || raw.includes('W')) return n;
  if (raw.toUpperCase().includes('K')) return n / 10; // 10K = 1w
  if (raw.toUpperCase().includes('M')) return n * 100;
  return n;
}

// Stable pseudo-random helper based on string id
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function formatWan(n: number): string {
  return `${n.toFixed(1).replace(/\.0$/, '')}w`;
}

// Shared creator library — same source as OranGen.
// Both 「AI 推荐达人」 and 「手动选择达人」 in OranMed read from here.
export const CREATORS: Creator[] = creatorLibraryItems.map((item) => {
  const h = hash(item.id);
  const platform: Platform = PLATFORMS[h % PLATFORMS.length];
  const wan = parseFollowers(item.followers);
  const tier: Creator['tier'] = wan >= 20 ? 'KOL' : 'KOC';
  const avgPlayWan = Math.max(0.5, +(wan * (0.18 + ((h % 30) / 100))).toFixed(1));
  const matchScore = 68 + (h % 28); // 68-95
  const tags = [item.niche, item.region].filter(Boolean);
  return {
    id: item.id,
    name: item.name,
    tier,
    platform,
    handle: item.handle,
    followers: formatWan(wan),
    avgPlay: formatWan(avgPlayWan),
    tags,
    matchScore,
    matchReason: `${item.niche} · ${item.region} 内容方向与 Brief 契合`,
    avatarUrl: item.avatarUrl,
    region: item.region,
    gender: item.gender,
  };
});
