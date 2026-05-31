import type { Creator, PortraitLicenseStatus, AccountStatus } from '../types';
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

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

const COUNTRY_BY_REGION: Record<string, { country: string; account: string; languages: string[] }> = {
  CN: { country: '中国', account: 'CN', languages: ['中文'] },
  US: { country: '美国', account: 'US', languages: ['English'] },
  UK: { country: '英国', account: 'UK', languages: ['English'] },
  SEA: { country: '东南亚', account: 'SG', languages: ['English', 'Bahasa'] },
};

const VOICE_STYLES = ['亲切日常', '专业测评', '种草安利', '幽默剧情', '冷静客观'];
const ACCENTS = ['Neutral', 'American', 'British', 'Mandarin'];
const STYLE_TAGS_POOL = ['口播', 'Vlog', '剧情', '开箱', '教程', '对比测评', '生活种草', 'GRWM'];
const PORTRAIT_STATUS: PortraitLicenseStatus[] = ['authorized', 'authorized', 'authorized', 'pending', 'expired'];
const ACCOUNT_STATUS: AccountStatus[] = ['available', 'available', 'available', 'available', 'paused'];

function deriveCountry(region: string) {
  const key = region.trim().toUpperCase();
  if (COUNTRY_BY_REGION[key]) return COUNTRY_BY_REGION[key];
  if (region.includes('中')) return COUNTRY_BY_REGION.CN;
  if (region.includes('美')) return COUNTRY_BY_REGION.US;
  if (region.includes('英')) return COUNTRY_BY_REGION.UK;
  return COUNTRY_BY_REGION.US;
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Shared creator library — same source as OranGen.
// Both 「AI 推荐达人」 and 「手动选择达人」 in OranMed read from here.
export const CREATORS: Creator[] = creatorLibraryItems.map((item) => {
  const h = hash(item.id);
  const platform: Platform = PLATFORMS[h % PLATFORMS.length];
  const wan = parseFollowers(item.followers);
  // Deterministic tier: every ~7th creator is MCN, else KOL/KOC by follower size
  const tier: Creator['tier'] = h % 7 === 0 ? 'MCN' : wan >= 20 ? 'KOL' : 'KOC';
  const avgPlayWan = Math.max(0.5, +(wan * (0.18 + ((h % 30) / 100))).toFixed(1));
  const matchScore = 68 + (h % 28); // 68-95
  const tags = [item.niche, item.region].filter(Boolean);

  const loc = deriveCountry(item.region);

  // Performance metrics — deterministic
  const engagementRate = +(0.025 + ((h % 75) / 1000)).toFixed(3); // 2.5% - 10%
  const videoCompletionRate = +(0.32 + ((h % 38) / 100)).toFixed(2); // 32% - 70%
  const followerGrowthRate = +(((h % 90) - 10) / 1000).toFixed(3); // -1% - 8%
  const activeFollowerRatio = +(0.28 + ((h % 45) / 100)).toFixed(2); // 28% - 73%

  const avgViews = avgPlayWan * 10000;
  const avgLikes = Math.round(avgViews * engagementRate * 0.6);
  const avgComments = Math.round(avgViews * engagementRate * 0.08);
  const avgShares = Math.round(avgViews * engagementRate * 0.12);

  // Commercial
  const basePrice = tier === 'KOL' ? 8000 + (h % 22000) : 800 + (h % 5000);
  const reportedVideoPrice = basePrice;
  const currency = loc.account === 'CN' ? 'CNY' : 'USD';
  const negotiable = h % 3 !== 0;
  const rateValidUntil = daysFromNow(15 + (h % 60));

  const style1 = pick(STYLE_TAGS_POOL, h);
  const style2 = pick(STYLE_TAGS_POOL, h >> 3);

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

    profileUrl: `https://www.tiktok.com/${item.handle}`,
    country: loc.country,
    accountRegion: loc.account,
    languages: loc.languages,

    engagementRate,
    videoCompletionRate,
    followerGrowthRate,
    activeFollowerRatio,
    avgLikes: avgLikes.toLocaleString(),
    avgComments: avgComments.toLocaleString(),
    avgShares: avgShares.toLocaleString(),

    contentCategories: [item.niche],
    creatorTags: [item.niche, tier],
    contentStyleTags: Array.from(new Set([style1, style2])),

    voiceStyle: pick(VOICE_STYLES, h),
    voiceLanguage: loc.languages[0],
    accent: pick(ACCENTS, h >> 2),

    reportedVideoPrice,
    currency,
    rateValidUntil,
    negotiable,

    portraitLicenseStatus: pick(PORTRAIT_STATUS, h),
    accountStatus: pick(ACCOUNT_STATUS, h >> 4),
    dataUpdatedAt: daysFromNow(-((h % 7) + 1)),
  };
});
