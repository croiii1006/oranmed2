import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  Image as ImageIcon,
  ListChecks,
  ListFilter,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Wand2,
} from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { OranMedProvider, useOranMed } from './context/OranMedContext';
import { CREATORS } from './data/creators';
import {
  PLATFORMS,
  STATUS_LABEL,
  STATUS_TONE,
  type Creator,
  type OranMedTask,
  type Platform,
  type TaskStatus,
} from './types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CategoryCascader, CATEGORY_TREE } from '@/components/modules/skills/CategoryCascader';
import { toast } from 'sonner';


const HIGHLIGHT_KEY = 'oran-med-highlight-task-id';


// ============== Outer module ==============
export function OranMed() {
  return (
    <OranMedProvider>
      <OranMedInner />
    </OranMedProvider>
  );
}

function OranMedInner() {
  const [params, setParams] = useSearchParams();
  const viewParam = params.get('view');
  const view: 'new' | 'workflow' | 'tasks' =
    viewParam === 'tasks' ? 'tasks' : viewParam === 'workflow' ? 'workflow' : 'new';
  const { currentTask, startNewTask } = useOranMed();

  // Entry page always starts from a fresh draft
  useEffect(() => {
    if (view === 'new' && currentTask.briefSaved) {
      startNewTask();
    }
  }, [view, currentTask.briefSaved, startNewTask]);

  if (view === 'tasks') {
    return (
      <div className="fixed bottom-0 left-[64px] right-0 top-14 overflow-hidden bg-background">
        <WorkbenchView
          onBack={() => setParams({})}
          onOpenWorkflow={() => setParams({ view: 'workflow' })}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {view === 'new' ? (
        <NewTaskView
          onOpenWorkbench={() => setParams({ view: 'tasks' })}
          onGoWorkflow={() => setParams({ view: 'workflow' })}
        />
      ) : (
        <div className="mx-auto w-full max-w-[1280px] px-6 py-8 lg:px-10 lg:py-10">
          <WorkflowView onBack={() => setParams({})} onComplete={() => setParams({ view: 'tasks' })} />
        </div>
      )}
    </div>
  );
}

// ============== New task ==============

function NewTaskView({
  onOpenWorkbench,
  onGoWorkflow,
}: {
  onOpenWorkbench: () => void;
  onGoWorkflow: () => void;
}) {
  const { currentTask, tasks, updateBrief, saveBrief, toggleCreator, setCreators } = useOranMed();
  const historyCount = tasks.length;
  const { brief, selectedCreatorIds } = currentTask;
  const [creatorsOpen, setCreatorsOpen] = useState(false);
  const [matching, setMatching] = useState(false);
  const [pickMode, setPickMode] = useState<'ai' | 'manual'>('ai');
  const [stage, setStage] = useState<'entry' | 'brief'>('entry');
  const [rawInput, setRawInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brandName = brief.brandName || '欧莱雅';
  const brandCategory = brief.brandCategory || '美妆护肤';

  const isBriefComplete = Boolean(
    brief.title.trim() &&
      brief.audience.trim() &&
      brief.expectedPublishDate &&
      brief.styleRequirements.trim() &&
      brief.brandTags.trim() &&
      brief.budget.trim() &&
      brief.brandName.trim() &&
      brief.brandCategory.trim(),
  );

  // Manual selection filters
  const [manualTerritory, setManualTerritory] = useState<'all' | 'cn' | 'overseas'>('all');
  const [manualGender, setManualGender] = useState<'all' | 'male' | 'female'>('all');
  const CN_REGIONS = new Set(['CN', 'CHINA', '中国', '中国大陆']);

  const handleSmartParse = () => {
    if (!rawInput.trim() && uploadedFiles.length === 0) return;
    setParsing(true);
    setTimeout(() => {
      updateBrief({
        title: '玻色因精华 5 月小红书种草投放',
        platform: '小红书',
        audience: '25-35 岁都市女性',
        expectedPublishDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        styleRequirements: '专业测评 / 成分干货',
        brandTags: '抗老,玻色因,成分党',
        budget: '50,000 积分',
        brandName: '欧莱雅',
        brandCategory: '美妆护肤',
      });
      setParsing(false);
      setStage('brief');
    }, 2200);
  };

  const handleManual = () => {
    setStage('brief');
  };


  const openCreators = (mode: 'ai' | 'manual') => {
    const patch: Partial<typeof brief> = {};
    if (!brief.brandName) patch.brandName = brandName;
    if (!brief.brandCategory) patch.brandCategory = brandCategory;
    if (!brief.title) patch.title = `${brandName} · ${new Date().toLocaleDateString('zh-CN')} 投放`;
    if (Object.keys(patch).length) updateBrief(patch);
    if (mode !== pickMode) setCreators([]);
    setPickMode(mode);
    setCreatorsOpen(true);
    if (mode === 'ai') {
      setMatching(true);
      setTimeout(() => setMatching(false), 6000);
    } else {
      setMatching(false);
    }
  };

  const handleConfirmCreators = () => {
    setTimeout(() => {
      saveBrief();
      onGoWorkflow();
    }, 0);
  };

  // Filter creators by brief platform, then sort by match score
  const recommendedCreators = useMemo(() => {
    const base = CREATORS.filter((c) => c.platform === brief.platform).sort((a, b) => b.matchScore - a.matchScore);
    if (pickMode !== 'manual') return base;
    return base.filter((c) => {
      const region = (c.region || '').trim().toUpperCase();
      const isCN = CN_REGIONS.has(region);
      const territoryOk = manualTerritory === 'all' || (manualTerritory === 'cn' ? isCN : !isCN);
      const genderOk = manualGender === 'all' || c.gender === manualGender;
      return territoryOk && genderOk;
    });
  }, [brief.platform, pickMode, manualTerritory, manualGender]);

  return (
    <div className="relative min-h-full flex flex-col items-center justify-start px-6 pt-[100px] pb-6 md:px-8 md:pt-[180px] md:pb-8">
      <div className="absolute right-4 top-4 z-20 md:right-8 md:top-6">
        <button
          onClick={onOpenWorkbench}
          className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          <span>任务工作台</span>
          <span className="rounded-full bg-muted/60 px-1.5 text-[10px]">{historyCount}</span>
        </button>
      </div>

      <div className="flex w-full flex-col items-center">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-light tracking-[0.2em] text-foreground mb-2">
            ORAN MED
          </h1>
          <p className="mt-4 text-sm text-muted-foreground font-light tracking-[0.1em]">
            上传Brief 文件或直接粘贴文本，AI 将为你智能解析、匹配平台达人并输出内容与发布计划。
          </p>
        </div>

        {stage === 'entry' ? (
          <EntryStage
            rawInput={rawInput}
            setRawInput={setRawInput}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            fileInputRef={fileInputRef}
            parsing={parsing}
            onSmartParse={handleSmartParse}
            onManual={handleManual}
          />
        ) : (
        /* Two-panel layout: brief shifts left when creators open */
        <div
          className={cn(
            'flex w-full items-stretch justify-center gap-6 transition-all duration-500 ease-out',
            creatorsOpen ? 'max-w-[1280px]' : 'max-w-3xl',
          )}
        >
          <div
            className={cn(
              'flex-shrink-0 flex flex-col transition-all duration-500 ease-out',
              creatorsOpen ? 'w-[420px]' : 'w-full',
            )}
          >

            {/* Brief input card */}
            <div className="relative h-[430px] flex flex-col rounded-[28px] border border-white/40 bg-muted/30 px-8 pt-8 pb-6 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150">
              {/* Header: orange dot + Brief title input + platform pill */}
              <div className="mb-3 flex items-center gap-3">
                <span className="relative flex h-3 w-3 items-center justify-center flex-shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent/40 blur-[3px]" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <div className="flex-1 min-w-0 flex items-center rounded-lg border border-border/40 bg-muted/40 px-3 py-1.5 transition-colors focus-within:border-accent/60 hover:border-accent/40">
                  <input
                    value={brief.title}
                    onChange={(e) => updateBrief({ title: e.target.value })}
                    placeholder="点击填写 Brief 标题，例：玻色因精华 5 月小红书投放"
                    className="flex-1 min-w-0 border-0 bg-transparent text-base font-normal leading-7 tracking-[0.01em] text-neutral-700 placeholder:text-muted-foreground/65 outline-none focus:ring-0"
                  />
                </div>
                <Select value={brief.platform} onValueChange={(v) => { if (v !== brief.platform) setCreators([]); updateBrief({ platform: v as Platform }); }}>
                  <SelectTrigger className="h-8 w-auto gap-1.5 rounded-full border border-border/60 bg-muted/70 px-3 text-xs font-light text-muted-foreground shadow-none hover:bg-muted hover:border-accent/50 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Inline meta fields — fill remaining height, responsive columns based on container width */}
              <div
                className={cn(
                  'mt-4 flex-1 min-h-0 grid gap-2 auto-rows-fr',
                  creatorsOpen ? 'grid-cols-2' : 'grid-cols-3',
                )}
              >
                <MetaField label="目标人群" value={brief.audience} onChange={(v) => updateBrief({ audience: v })} placeholder="25-35 岁都市女性" />
                <MetaField label="期望发布" type="date" value={brief.expectedPublishDate} onChange={(v) => updateBrief({ expectedPublishDate: v })} />
                <MetaField label="内容风格" value={brief.styleRequirements} onChange={(v) => updateBrief({ styleRequirements: v })} placeholder="专业测评 / 干货" />
                <MetaField label="品牌卖点" value={brief.brandTags} onChange={(v) => updateBrief({ brandTags: v })} placeholder="抗老,成分" />
                <MetaField label="预算" value={brief.budget} onChange={(v) => updateBrief({ budget: v })} placeholder="50,000 积分" />
                <PlainField
                  label="发布要求"
                  value={brief.publishRequirements ?? ''}
                  onChange={(v) => updateBrief({ publishRequirements: v })}
                  placeholder="例如：需露出 logo / 含口播 / 不允许夸大宣传"
                />
              </div>

              {/* Footer: brand name + category */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="group flex items-center gap-2 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 transition-colors focus-within:border-accent/60 hover:border-accent/40 cursor-text">
                  <span className="shrink-0 text-[12px] font-light text-muted-foreground/70">品牌</span>
                  <input
                    value={brief.brandName}
                    onChange={(e) => updateBrief({ brandName: e.target.value })}
                    placeholder="点击填写品牌名称"
                    className="min-w-0 flex-1 border-0 bg-transparent text-[13px] font-normal leading-5 text-foreground/85 placeholder:text-muted-foreground/60 outline-none"
                  />
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 transition-colors hover:border-accent/40">
                  <span className="shrink-0 text-[12px] font-light text-muted-foreground/70">品类</span>
                  <CategoryCascader
                    data={CATEGORY_TREE}
                    value={brief.brandCategory}
                    onChange={(v) => updateBrief({ brandCategory: v })}
                    placeholder="选择品类"
                    className="flex-1 h-6 border-0 px-0 bg-transparent text-[13px]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="mt-5 flex items-center justify-between px-1">
              {!creatorsOpen ? (
                <button
                  type="button"
                  onClick={() => setStage('entry')}
                  className="text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
                >
                  ← 返回上一步
                </button>
              ) : <span />}
              {!creatorsOpen ? (
                <div className="flex items-center gap-4">
                  {!isBriefComplete ? (
                    <span className="text-xs font-light text-muted-foreground/70">请完成所有信息后选择达人</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openCreators('manual')}
                    disabled={!isBriefComplete}
                    className="text-sm font-light text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    手动选择达人
                  </button>
                  <button
                    type="button"
                    onClick={() => openCreators('ai')}
                    disabled={!isBriefComplete}
                    className="flex items-center gap-2.5 rounded-full bg-card px-6 py-2.5 text-sm font-light text-foreground/70 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <SparkleIcon />
                    <span>AI 推荐达人</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreatorsOpen(false)}
                  className="text-xs font-light text-muted-foreground transition-colors hover:text-foreground"
                >
                  收起达人
                </button>
              )}
            </div>
          </div>

          {/* Creator match panel — slides in from right */}
          {creatorsOpen ? (
            <div className="min-w-0 flex-1 flex flex-col animate-in fade-in slide-in-from-right-6 duration-500">
              <div className="relative h-[430px] flex flex-col rounded-[28px] border border-white/40 bg-muted/30 px-7 py-7 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {pickMode === 'ai' ? (
                      <SparkleIcon />
                    ) : (
                      <Users className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-light tracking-wide text-foreground/70">
                      {pickMode === 'ai' ? 'AI 推荐达人' : '手动选择达人'}
                    </span>
                    {pickMode === 'manual' && !matching ? (
                      <ManualFilterDropdown
                        count={recommendedCreators.length}
                        territory={manualTerritory}
                        gender={manualGender}
                        onTerritory={setManualTerritory}
                        onGender={setManualGender}
                      />
                    ) : (
                      <span className="rounded-full bg-muted/80 px-2.5 py-0.5 text-[11px] font-light text-muted-foreground">
                        {matching ? '匹配中…' : `${recommendedCreators.length} 位 · ${brief.platform}`}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-light text-muted-foreground">
                    {matching ? '基于 Brief 与人群分析中' : `已选 ${selectedCreatorIds.length} 位`}
                  </span>
                </div>

                {matching ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-12">
                    <div
                      className="grid gap-x-1.5 gap-y-1.5"
                      style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}
                    >
                      {Array.from({ length: 32 }).map((_, i) => (
                        <span
                          key={i}
                          className="h-1 w-1 rounded-full bg-neutral-300"
                          style={{
                            animation: `dot-glow 3.2s ease-in-out ${i * 0.09}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="mt-8 text-[12px] font-light tracking-[0.12em] text-muted-foreground">
                      AI 正在为你匹配最合适的达人…
                    </div>
                  </div>
                ) : (
                <>
                <div className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 content-start">
                  {recommendedCreators.map((c) => {
                    const selected = selectedCreatorIds.includes(c.id);
                    const matchStyles = (() => {
                      const t = Math.max(0, Math.min(1, (c.matchScore - 65) / 35));
                      const s = 55 + Math.round(t * 40);
                      const l = 68 - Math.round(t * 23);
                      const color = `hsl(24, ${s}%, ${l}%)`;
                      const bg = `hsla(24, ${s}%, ${l}%, 0.12)`;
                      return { color, bg };
                    })();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCreator(c.id)}
                        className={cn(
                          'group relative flex min-h-[144px] w-full flex-col items-center overflow-hidden rounded-[18px] border bg-background px-3 py-4 text-center transition-all duration-200',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20',
                          selected
                            ? 'border-foreground/35 bg-foreground/[0.03]'
                            : 'border-border/30 hover:z-10 hover:-translate-y-0.5 hover:border-foreground/10 hover:bg-muted/[0.35] hover:shadow-[0_16px_34px_rgba(15,23,42,0.06)]',
                        )}
                      >
                        {/* Match score badge — AI mode only */}
                        {pickMode === 'ai' ? (
                          <div
                            className="pointer-events-none absolute left-2.5 top-2.5 z-30 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0"
                            style={{ color: matchStyles.color, backgroundColor: matchStyles.bg }}
                          >
                            <span className="inline-block h-1 w-1 rounded-full" style={{ backgroundColor: matchStyles.color }} />
                            <span>{c.matchScore}%</span>
                          </div>
                        ) : null}
                        {selected ? (
                          <div className="absolute right-2.5 top-2.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background shadow-sm">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </div>
                        ) : null}

                        <div className="relative z-10 h-[58px] w-[58px] overflow-hidden rounded-full bg-muted transition-all duration-200 group-hover:scale-[1.04] group-hover:opacity-15 group-hover:blur-md group-focus-visible:scale-[1.04] group-focus-visible:opacity-15 group-focus-visible:blur-md">
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt={c.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-light text-foreground/60">
                              {c.name.slice(0, 1)}
                            </div>
                          )}
                        </div>

                        <div className="relative z-10 mt-2.5 min-w-0 transition-all duration-200 group-hover:opacity-10 group-hover:blur-md group-focus-visible:opacity-10 group-focus-visible:blur-md">
                          <div className="truncate text-[13px] font-light tracking-[-0.01em] text-foreground sm:text-sm">
                            {c.name}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] font-light text-muted-foreground/70 sm:text-xs">
                            {c.handle}
                          </div>
                        </div>

                        <div className="pointer-events-none absolute inset-0 z-10 rounded-[18px] bg-white/78 p-3 text-left opacity-0 shadow-[0_16px_32px_rgba(255,255,255,0.28)] backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                          <div className="flex h-full flex-col justify-between">
                            <div className="space-y-1">
                              <div className="text-[10px] font-medium tracking-[0.08em] text-foreground/45">
                                KOL · {c.platform}
                              </div>
                              <div className="text-[13px] font-semibold text-foreground">{c.followers} 粉丝</div>
                              <div className="text-[11px] text-muted-foreground">均播 {c.avgPlay}</div>
                            </div>

                            <div className="space-y-1.5">
                              {c.tags && c.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                                  {c.tags.slice(0, 2).map((t) => (
                                    <span key={t} className="rounded-full bg-background/80 px-2 py-0.5">{t}</span>
                                  ))}
                                </div>
                              ) : null}
                              {pickMode === 'ai' && c.matchReason ? (
                                <div className="flex items-start gap-1 text-[11px] leading-snug text-foreground/75">
                                  <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                                  <span className="line-clamp-2">{c.matchReason}</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                </>
                )}
              </div>
              {/* Confirm button — placed outside the card, mirrors left column's actions row */}
              <div className="mt-5 flex items-center justify-end px-1">
                <button
                  type="button"
                  onClick={handleConfirmCreators}
                  disabled={selectedCreatorIds.length === 0}
                  className="flex items-center gap-2.5 rounded-full bg-card px-6 py-2.5 text-sm font-light text-foreground/70 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] disabled:opacity-50"
                >
                  <SparkleIcon />
                  <span>进入下一步</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
        )}
      </div>
    </div>
  );
}

// Custom 4-point sparkle with orange gradient
function PlainField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="group flex flex-col gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 transition-colors focus-within:border-accent/60 hover:border-accent/40">
      <span className="text-[12px] font-light leading-5 text-muted-foreground/70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 w-full border-0 bg-transparent py-0 text-[13px] font-normal leading-5 text-foreground/85 placeholder:text-muted-foreground/60 outline-none focus:ring-0"
      />
    </div>
  );
}

function ManualFilterDropdown({
  count,
  territory,
  gender,
  onTerritory,
  onGender,
}: {
  count: number;
  territory: 'all' | 'cn' | 'overseas';
  gender: 'all' | 'male' | 'female';
  onTerritory: (v: 'all' | 'cn' | 'overseas') => void;
  onGender: (v: 'all' | 'male' | 'female') => void;
}) {
  const chip = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-xs font-light transition-colors',
      active
        ? 'border-foreground bg-foreground text-background'
        : 'border-border/60 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground',
    );
  const territoryLabel =
    territory === 'all' ? '全部达人' : territory === 'cn' ? '中国达人' : '海外达人';
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-light text-foreground/80 shadow-sm hover:border-foreground/30"
        >
          <ListFilter className="h-3.5 w-3.5" />
          <span>{territoryLabel}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{count}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 rounded-2xl p-4">
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 text-xs text-muted-foreground">区域</div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" className={chip(territory === 'all')} onClick={() => onTerritory('all')}>全部</button>
              <button type="button" className={chip(territory === 'cn')} onClick={() => onTerritory('cn')}>中国</button>
              <button type="button" className={chip(territory === 'overseas')} onClick={() => onTerritory('overseas')}>海外</button>
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-xs text-muted-foreground">性别</div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" className={chip(gender === 'all')} onClick={() => onGender('all')}>全部</button>
              <button type="button" className={chip(gender === 'male')} onClick={() => onGender('male')}>男</button>
              <button type="button" className={chip(gender === 'female')} onClick={() => onGender('female')}>女</button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="oran-spark" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFB088" />
          <stop offset="100%" stopColor="#FF6A2C" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.5c.4 4.8 3.7 8.1 8.5 8.5-4.8.4-8.1 3.7-8.5 8.5-.4-4.8-3.7-8.1-8.5-8.5C8.3 9.6 11.6 6.3 12 1.5z"
        fill="url(#oran-spark)"
      />
    </svg>
  );
}

function MetaField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const [draft, setDraft] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverDraft, setPopoverDraft] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [rowWidth, setRowWidth] = useState(0);
  const [availHeight, setAvailHeight] = useState(0);
  const [tagWidths, setTagWidths] = useState<number[]>([]);

  useEffect(() => {
    const row = rowRef.current;
    const container = containerRef.current;
    if (!row || !container) return;
    const update = () => {
      setRowWidth(row.clientWidth);
      // available height = container inner height minus the label height above the row
      const cRect = container.getBoundingClientRect();
      const rRect = row.getBoundingClientRect();
      const cs = getComputedStyle(container);
      const padBottom = parseFloat(cs.paddingBottom) || 0;
      const avail = cRect.bottom - padBottom - rRect.top;
      setAvailHeight(Math.max(0, avail));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(row);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const widths = Array.from(el.children).map((c) => (c as HTMLElement).offsetWidth);
    setTagWidths(widths);
  }, [value]);



  if (type === 'date') {
    return (
      <div className="group flex flex-col gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 transition-colors focus-within:border-accent/60 hover:border-accent/40">
        <span className="text-[12px] font-light leading-5 text-muted-foreground/70">{label}</span>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 w-full border-0 bg-transparent py-0 text-[13px] font-normal leading-5 text-foreground/85 placeholder:text-muted-foreground/60 outline-none focus:ring-0"
        />
      </div>
    );
  }

  const tags = value ? value.split(',').map((t) => t.trim()).filter(Boolean) : [];

  const commit = (next: string[]) => onChange(next.join(','));

  const addTag = (source: 'inline' | 'popover' = 'inline') => {
    const raw = source === 'inline' ? draft : popoverDraft;
    const v = raw.trim();
    if (!v) return;
    if (tags.includes(v)) {
      source === 'inline' ? setDraft('') : setPopoverDraft('');
      return;
    }
    commit([...tags, v]);
    source === 'inline' ? setDraft('') : setPopoverDraft('');
  };

  const removeTag = (i: number) => commit(tags.filter((_, idx) => idx !== i));

  const startEdit = (i: number) => {
    setEditingIdx(i);
    setEditingText(tags[i]);
  };

  const commitEdit = () => {
    if (editingIdx === null) return;
    const v = editingText.trim();
    const next = [...tags];
    if (!v) {
      next.splice(editingIdx, 1);
    } else {
      next[editingIdx] = v;
    }
    commit(next);
    setEditingIdx(null);
    setEditingText('');
  };

  // Pack tags into as many rows as the cell's available height allows.
  // Only collapse into "+N" if even multi-row wrapping can't fit everything.
  const estimateTagWidth = (t: string) => t.length * 14 + 28;
  const INPUT_RESERVE = 60;
  const MORE_RESERVE = 34;
  const GAP = 6;
  const ROW_H = 24;
  const ROW_GAP = 6;

  let visibleCount = tags.length;
  if (rowWidth > 0 && tags.length > 0) {
    const maxRows = Math.max(1, Math.floor((availHeight + ROW_GAP) / (ROW_H + ROW_GAP)) || 1);

    // First pass: try to pack ALL tags within maxRows without reserving "+N".
    const pack = (reserveLast: number) => {
      let row = 1;
      let used = 0;
      let placed = 0;
      for (let i = 0; i < tags.length; i++) {
        const w = tagWidths[i] ?? estimateTagWidth(tags[i]);
        const isLastRow = row === maxRows;
        const remaining = tags.length - i - 1;
        const reserve = isLastRow ? INPUT_RESERVE + (remaining > 0 ? MORE_RESERVE + GAP : 0) + (reserveLast && remaining === 0 ? 0 : 0) : 0;
        const gapBefore = used > 0 ? GAP : 0;
        if (used + gapBefore + w + reserve <= rowWidth) {
          used += gapBefore + w;
          placed++;
        } else if (row < maxRows) {
          row++;
          used = w;
          placed++;
        } else {
          break;
        }
      }
      return placed;
    };

    visibleCount = pack(0);
    if (visibleCount === 0) visibleCount = 1;
  }


  const hiddenCount = Math.max(0, tags.length - visibleCount);
  const visibleTags = tags.slice(0, visibleCount);

  const renderTag = (tag: string, i: number) =>
    editingIdx === i ? (
      <input
        key={i}
        autoFocus
        value={editingText}
        onChange={(e) => setEditingText(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitEdit();
          } else if (e.key === 'Escape') {
            setEditingIdx(null);
            setEditingText('');
          }
        }}
        className="min-w-[40px] rounded-full border border-accent/40 bg-background/80 px-2.5 py-0.5 text-[12px] font-normal text-foreground/85 outline-none focus:ring-0"
        style={{ width: `${Math.max(editingText.length, 2) + 2}ch` }}
      />
    ) : (
      <span
        key={i}
        onClick={() => startEdit(i)}
        className="group/tag inline-flex shrink-0 items-center gap-1 rounded-full border border-border/50 bg-background/70 px-2.5 py-0.5 text-[12px] font-normal text-foreground/85 cursor-text transition-colors hover:border-accent/50"
      >
        {tag}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeTag(i);
          }}
          className="ml-0.5 text-muted-foreground/60 transition-colors hover:text-foreground"
          aria-label="删除"
        >
          ×
        </button>
      </span>
    );

  return (
    <div ref={containerRef} className="group flex flex-col gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 transition-colors focus-within:border-accent/60 hover:border-accent/40">
      <span className="text-[12px] font-light leading-5 text-muted-foreground/70">{label}</span>
      {/* Hidden measurement row */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute -left-[9999px] top-0 flex gap-1.5"
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/50 bg-background/70 px-2.5 py-0.5 text-[12px] font-normal"
          >
            {tag}
            <span className="ml-0.5">×</span>
          </span>
        ))}
      </div>
      <div ref={rowRef} className="flex flex-wrap items-start content-start gap-1.5 overflow-hidden min-w-0">


        {visibleTags.map((tag, i) => renderTag(tag, i))}
        {hiddenCount > 0 && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex shrink-0 items-center rounded-full border border-border/40 bg-muted/60 px-2 py-0.5 text-[12px] font-normal text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
              >
                +{hiddenCount}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[280px] rounded-xl p-3">
              <div className="mb-2 text-[12px] font-light text-muted-foreground/70">
                全部 {label}（{tags.length}）
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, i) => renderTag(tag, i))}
              </div>
              <div className="mt-3 border-t border-border/40 pt-2">
                <input
                  value={popoverDraft}
                  onChange={(e) => setPopoverDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addTag('popover');
                    }
                  }}
                  onBlur={() => addTag('popover')}
                  placeholder="添加标签"
                  className="w-full border-0 bg-transparent py-1 text-[13px] font-normal leading-5 text-foreground/85 placeholder:text-muted-foreground/60 outline-none focus:ring-0"
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag('inline');
            } else if (e.key === 'Backspace' && !draft && tags.length) {
              removeTag(tags.length - 1);
            }
          }}
          onBlur={() => addTag('inline')}
          placeholder={tags.length ? '添加' : placeholder || '添加标签'}
          className="min-w-[60px] flex-1 border-0 bg-transparent py-0 text-[13px] font-normal leading-5 text-foreground/85 placeholder:text-muted-foreground/60 outline-none focus:ring-0"
        />
      </div>
    </div>
  );
}

function EntryStage({
  rawInput,
  setRawInput,
  uploadedFiles,
  setUploadedFiles,
  fileInputRef,
  parsing,
  onSmartParse,
  onManual,
}: {
  rawInput: string;
  setRawInput: (v: string) => void;
  uploadedFiles: File[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  parsing: boolean;
  onSmartParse: () => void;
  onManual: () => void;
}) {
  const hasInput = Boolean(rawInput.trim() || uploadedFiles.length > 0);
  const [dragOver, setDragOver] = useState(false);

  const mergeFiles = (list: File[]) => {
    if (!list.length) return;
    setUploadedFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}_${f.size}`));
      const merged = [...prev];
      for (const f of list) {
        if (!existing.has(`${f.name}_${f.size}`)) merged.push(f);
      }
      return merged;
    });
  };

  const ACCEPT_RE = /\.(pdf|docx?|txt)$|^image\//i;
  const filterAccepted = (files: File[]) =>
    files.filter((f) => ACCEPT_RE.test(f.name) || ACCEPT_RE.test(f.type));

  return (
    <div
      className="w-full max-w-3xl"
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; setDragOver(true); }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const dropped = Array.from(e.dataTransfer.files ?? []);
        mergeFiles(filterAccepted(dropped));
      }}
    >
      <div className={cn(
        "relative h-[430px] flex flex-col rounded-[28px] border bg-muted/30 px-8 pt-8 pb-6 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150 transition-colors",
        dragOver ? "border-accent/70 ring-2 ring-accent/30" : "border-white/40",
      )}>
        {dragOver ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[28px] bg-accent/10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-accent">
              <Upload className="h-8 w-8" />
              <div className="text-sm font-light tracking-wide">松开以上传文件</div>
              <div className="text-[11px] font-light text-muted-foreground">支持 PDF / 图片 / Word / 文本</div>
            </div>
          </div>
        ) : null}
        {/* Upload trigger — fixed size, doesn't grow with files */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={parsing}
          className={cn(
            'group flex flex-shrink-0 items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-left transition-colors disabled:opacity-50',
            'border-border/60 bg-muted/30 hover:border-accent/50 hover:bg-muted/50',
          )}
        >
          <Upload className="h-4 w-4 text-muted-foreground" />

          <div className="flex-1 min-w-0">
            <div className="text-sm font-light text-foreground/80">
              上传 Brief 文件
              {uploadedFiles.length > 0 ? (
                <span className="ml-2 text-[11px] font-light text-muted-foreground">
                  已选 {uploadedFiles.length} 个
                </span>
              ) : null}
            </div>
            <div className="text-[11px] font-light text-muted-foreground/70">支持 PDF / 图片 / Word / 文本 · 可多选 · 可拖拽</div>
          </div>
          {uploadedFiles.length > 0 ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setUploadedFiles([]);
              }}
              className="text-[11px] font-light text-muted-foreground hover:text-foreground"
            >
              清空
            </span>
          ) : null}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,image/*"
          className="hidden"
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            if (list.length) {
              setUploadedFiles((prev) => {
                const existing = new Set(prev.map((f) => `${f.name}_${f.size}`));
                const merged = [...prev];
                for (const f of list) {
                  if (!existing.has(`${f.name}_${f.size}`)) merged.push(f);
                }
                return merged;
              });
            }
            e.target.value = '';
          }}
        />

        {/* File chips — scrollable in a fixed-height strip, doesn't push layout */}
        {uploadedFiles.length > 0 ? (
          <div className="mt-2 flex-shrink-0 max-h-[60px] overflow-y-auto">
            <div className="flex flex-wrap gap-1.5">
              {uploadedFiles.map((f, i) => (
                <span
                  key={`${f.name}_${f.size}_${i}`}
                  className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-light text-foreground/70"
                >
                  <FileText className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="ml-0.5 flex-shrink-0 text-muted-foreground/60 hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Divider */}
        <div className="my-4 flex flex-shrink-0 items-center gap-3 text-[11px] font-light text-muted-foreground/60">
          <span className="h-px flex-1 bg-border/50" />
          <span>或粘贴文字</span>
          <span className="h-px flex-1 bg-border/50" />
        </div>

        {/* Paste textarea — fills remaining height */}
        <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-border/40 bg-muted/40 px-3 py-2 transition-colors focus-within:border-accent/60 hover:border-accent/40">
          <Textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            disabled={parsing}
            placeholder="粘贴 Brief 内容，例如品牌背景、推广目标、卖点、调性、人群、预算等…"
            className="flex-1 min-h-0 resize-none border-0 bg-transparent p-0 text-[15px] font-normal leading-[1.7] text-foreground/85 placeholder:text-muted-foreground/65 shadow-none focus-visible:ring-0 caret-accent"
          />
        </div>

        {/* Loading overlay */}
        {parsing ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[28px] bg-background/70 backdrop-blur-sm">
            <div
              className="grid gap-x-1.5 gap-y-1.5"
              style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}
            >
              {Array.from({ length: 32 }).map((_, i) => (
                <span
                  key={i}
                  className="h-1 w-1 rounded-full bg-neutral-400"
                  style={{ animation: `dot-glow 3.2s ease-in-out ${i * 0.09}s infinite` }}
                />
              ))}
            </div>
            <div className="mt-6 text-[12px] font-light tracking-[0.12em] text-muted-foreground">
              AI 正在智能解析 Brief…
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom actions */}
      <div className="mt-5 flex items-center justify-end gap-4 px-1">
        <button
          type="button"
          onClick={onManual}
          disabled={parsing}
          className="text-sm font-light text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          手动创建
        </button>
        <button
          type="button"
          onClick={onSmartParse}
          disabled={!hasInput || parsing}
          className="flex items-center gap-2.5 rounded-full bg-card px-6 py-2.5 text-sm font-light text-foreground/70 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SparkleIcon />
          <span>智能解析</span>
        </button>
      </div>
    </div>
  );
}

// ============== Workflow (after Brief saved) ==============
function WorkflowView({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const {
    currentTask,
    setAssetMode,
    addAsset,
    removeAsset,
    updatePlanItem,
    confirmPlan,
    setCompliance,
    submitForReview,
  } = useOranMed();
  const { brief, assetMode, assets, selectedCreatorIds } = currentTask;

  const [step, setStep] = useState<'asset' | 'plan'>('asset');
  const [detailOpen, setDetailOpen] = useState(false);
  const [productImage, setProductImage] = useState<{ name: string; url: string } | null>(null);
  const [planForm, setPlanForm] = useState({
    scheduledAt: '',
    platform: brief.platform,
    cadence: '集中投放3天',
    notes: '',
  });

  const ASSET_PALETTE = [
    'from-rose-300 to-orange-300',
    'from-sky-300 to-indigo-300',
    'from-violet-300 to-fuchsia-300',
    'from-emerald-300 to-teal-300',
    'from-amber-300 to-orange-300',
  ];

  const nextCreatorId = () => {
    if (selectedCreatorIds.length === 0) return '';
    const used = assets.length;
    return selectedCreatorIds[used % selectedCreatorIds.length];
  };

  const pushAsset = (title: string, source: 'local' | 'orangen') => {
    const cid = nextCreatorId();
    addAsset({
      id: `a_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      creatorId: cid,
      title,
      source,
      thumbnailColor: ASSET_PALETTE[assets.length % ASSET_PALETTE.length],
      status: 'ready',
    });
  };

  const handleSubmit = () => {
    assets.forEach((a) =>
      updatePlanItem(a.id, {
        scheduledAt: planForm.scheduledAt,
        platform: planForm.platform,
        caption: planForm.notes,
      }),
    );
    confirmPlan();
    setCompliance(true);
    const ok = Math.random() > 0.15;
    if (ok) {
      submitForReview();
      try { sessionStorage.setItem(HIGHLIGHT_KEY, currentTask.id); } catch {}
      toast.success('已提交平台审核', { description: '预计 1-2 个工作日反馈结果' });
    } else {
      toast.error('提交失败', { description: '网络异常，请稍后重试' });
    }
    onComplete();
  };

  if (step === 'plan') {
    return (
      <PlanFormStep
        task={currentTask}
        form={planForm}
        setForm={setPlanForm}
        onBack={() => setStep('asset')}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 rounded-lg border border-border/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>返回</span>
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(340px,440px)_1fr]">
        {/* LEFT */}
        <div className="space-y-5">
          <TaskMiniCard task={currentTask} stacked={assets.length > 0} onClick={() => setDetailOpen(true)} />

          {!assetMode ? (
            <AssetModeChoices
              onPick={(m) => {
                setAssetMode(m);
              }}
            />
          ) : assetMode === 'local' ? (
            <LocalUploadZone
              onFiles={(files) => {
                files.forEach((f) => pushAsset(f.name, 'local'));
              }}
              onSwitchMode={() => setAssetMode(null)}
            />
          ) : (
            <OranGenInlinePanel
              brief={brief}
              creatorIds={selectedCreatorIds}
              hasAssets={assets.length > 0}
              productImage={productImage}
              onProductImageChange={setProductImage}
              onGenerated={(count) => {
                for (let i = 0; i < count; i++) {
                  const cid = selectedCreatorIds[(assets.length + i) % Math.max(selectedCreatorIds.length, 1)] ?? '';
                  addAsset({
                    id: `a_${Date.now().toString(36)}${i}${Math.random().toString(36).slice(2, 4)}`,
                    creatorId: cid,
                    title: `OranGen · ${CREATORS.find((c) => c.id === cid)?.name ?? '素材'} ${i + 1}`,
                    source: 'orangen',
                    thumbnailColor: ASSET_PALETTE[(assets.length + i) % ASSET_PALETTE.length],
                    status: 'ready',
                  });
                }
              }}
              onSwitchMode={() => setAssetMode(null)}
            />
          )}

          {assetMode === 'local' ? (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                disabled={assets.length === 0}
                onClick={() => setStep('plan')}
                className="rounded-full border-[#FF5500]/30 bg-white text-[#FF5500] shadow-[0_1px_2px_rgba(255,85,0,0.08)] hover:border-[#FF5500]/50 hover:bg-[#FF5500]/5 hover:text-[#FF5500]"
              >
                下一步：添加发布计划
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          ) : null}
        </div>

        {/* RIGHT */}
        <div className="min-h-[400px] rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Assets</div>
              <div className="mt-1 text-sm text-foreground">
                内容资产 <span className="text-muted-foreground">({assets.length})</span>
              </div>
            </div>
            {assetMode ? (
              <Badge variant="outline" className="text-[10px]">
                {assetMode === 'orangen' ? 'OranGen 生成' : '本地上传'}
              </Badge>
            ) : null}
          </div>

          {assets.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/40 text-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
              <div className="text-xs text-muted-foreground">
                {assetMode === 'orangen'
                  ? 'OranGen 生成完成后，资产会展示在这里'
                  : assetMode === 'local'
                  ? '在左侧拖拽或选择文件上传'
                  : '请选择资产来源'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {assets.map((a) => {
                const c = CREATORS.find((cc) => cc.id === a.creatorId);
                return (
                  <div
                    key={a.id}
                    className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/60"
                  >
                    <div className={cn('flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br', a.thumbnailColor)}>
                      <Play className="h-6 w-6 text-white/80" fill="currentColor" />
                    </div>
                    <div className="p-2.5">
                      <div className="truncate text-xs font-medium text-foreground">{a.title}</div>
                      <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                        {c?.name ?? '未指派'} · {a.source === 'orangen' ? 'OranGen' : '本地'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAsset(a.id)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <TaskDetailDialog
        task={detailOpen ? currentTask : null}
        onClose={() => setDetailOpen(false)}
        onOpen={() => setDetailOpen(false)}
      />

    </div>
  );
}

// ============== Task mini card (stacked workbench style) ==============
function TaskMiniCard({ task, stacked, onClick }: { task: OranMedTask; stacked: boolean; onClick?: () => void }) {
  const { brief } = task;
  return (
    <div className="relative">
      {stacked ? (
        <>
          <div className="absolute -top-2 left-3 right-3 h-full rounded-2xl bg-gradient-to-br from-sky-200/70 to-sky-300/40 -rotate-[3deg] -z-10" />
          <div className="absolute -top-3.5 left-6 right-1 h-full rounded-2xl bg-gradient-to-br from-orange-200/70 to-rose-200/40 rotate-[4deg] -z-20" />
        </>
      ) : null}
      <button
        type="button"
        onClick={onClick}
        className="relative block w-full text-left rounded-2xl border border-border/40 bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-accent/40 hover:shadow-md cursor-pointer"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#FF5500]" />
          <span className="text-sm font-medium text-foreground truncate">{brief.title || '未命名任务'}</span>
          <Badge variant="outline" className="ml-auto h-5 text-[10px]">{brief.platform}</Badge>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {brief.goal || '未填写任务目标'}
        </p>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{brief.brandName || '品牌'} · {brief.brandCategory || '品类'}</span>
          <span>{task.selectedCreatorIds.length} 位达人</span>
        </div>
      </button>
    </div>
  );
}

// ============== Asset mode picker ==============
function AssetModeChoices({ onPick }: { onPick: (m: 'local' | 'orangen') => void }) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onPick('local')}
        className="group flex w-full items-start gap-3 rounded-2xl border border-border/40 bg-card/60 p-4 text-left backdrop-blur-sm transition-all hover:border-accent/50 hover:bg-card hover:shadow-sm"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent">
          <Upload className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground">我已有资产</div>
          <div className="mt-0.5 text-xs text-muted-foreground">上传已有的图片 / 视频素材到本次任务</div>
        </div>
        <ChevronRight className="mt-2.5 h-4 w-4 text-muted-foreground" />
      </button>
      <button
        type="button"
        onClick={() => onPick('orangen')}
        className="group flex w-full items-start gap-3 rounded-2xl border border-border/40 bg-card/60 p-4 text-left backdrop-blur-sm transition-all hover:border-accent/50 hover:bg-card hover:shadow-sm"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 text-accent">
          <Wand2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground">还没有素材，让 OranGen 生成</div>
          <div className="mt-0.5 text-xs text-muted-foreground">基于本次 Brief 与达人风格，由 AI 一键生成</div>
        </div>
        <ChevronRight className="mt-2.5 h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}

// ============== Local upload zone ==============
function LocalUploadZone({
  onFiles,
  onSwitchMode,
}: {
  onFiles: (files: File[]) => void;
  onSwitchMode: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">本地上传</span>
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-muted-foreground underline-offset-2 hover:underline"
        >
          切换资产来源
        </button>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length) onFiles(files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-card/40 px-6 py-10 text-center transition-colors',
          drag ? 'border-accent bg-accent/5' : 'border-border/40 hover:border-border',
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
          <Upload className="h-5 w-5" />
        </div>
        <div className="text-sm text-foreground">拖拽文件到此处，或点击上传</div>
        <div className="text-xs text-muted-foreground">支持 jpg / png / mp4 / mov · 单个文件 ≤ 200MB</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onFiles(files);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

// ============== OranGen inline panel ==============
function OranGenInlinePanel({
  brief,
  creatorIds,
  hasAssets,
  productImage,
  onProductImageChange,
  onGenerated,
  onSwitchMode,
}: {
  brief: { goal: string; brandName: string; brandCategory: string; brandTags: string };
  creatorIds: string[];
  hasAssets: boolean;
  productImage: { name: string; url: string } | null;
  onProductImageChange: (img: { name: string; url: string } | null) => void;
  onGenerated: (count: number) => void;
  onSwitchMode: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const steps = [
    { key: 'brief', label: '读取 Brief 与目标人群', agent: 'Brief 解析' },
    { key: 'benchmark', label: '匹配对标爆款视频', agent: 'TikTok 爆款专家' },
    { key: 'memory', label: '构建品牌记忆库特征向量', agent: '记忆库专家' },
    { key: 'style', label: '提取达人风格与镜头语言', agent: '风格专家' },
    { key: 'prompt', label: '设计每位达人专属 Prompt', agent: 'Prompt 专家' },
    { key: 'scene', label: '渲染分镜与场景', agent: '设计专家' },
    { key: 'audio', label: '合成口播与背景音', agent: '音频专家' },
    { key: 'compose', label: '合成最终短视频素材', agent: '视频专家' },
  ] as const;

  type Phase = 'idle' | typeof steps[number]['key'] | 'done';
  const [phase, setPhase] = useState<Phase>(hasAssets ? 'done' : 'idle');

  const order: Record<string, number> = { idle: 0 };
  steps.forEach((s, i) => (order[s.key] = i + 1));
  order.done = steps.length + 1;

  const start = () => {
    setPhase(steps[0].key);
    const stepDelay = 900;
    steps.slice(1).forEach((s, i) => {
      setTimeout(() => setPhase(s.key), stepDelay * (i + 1));
    });
    setTimeout(() => {
      setPhase('done');
      onGenerated(Math.max(creatorIds.length, 1));
    }, stepDelay * steps.length);
  };

  const handleFile = (file?: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onProductImageChange({ name: file.name, url });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border/40 bg-card/60 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>基于 Brief 自动生成 {Math.max(creatorIds.length, 1)} 条素材（每位达人 1 条）</span>
        </div>

        {/* 上传商品白底图 */}
        <div className="mt-3 flex items-start gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {/* 左：上传方形区 */}
          {productImage ? (
            <div className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-muted/20">
              <img src={productImage.url} alt={productImage.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onProductImageChange(null)}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-x-0 bottom-0 bg-background/80 py-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                更换
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border/60 bg-muted/10 text-[11px] text-muted-foreground transition-colors hover:border-accent/40 hover:bg-muted/30 hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              上传商品白底图
            </button>
          )}

          {/* 右：自动同步的卖点标签 */}
          <div className="min-w-0 flex-1 self-stretch">
            {(() => {
              const tags = (brief.brandTags || '')
                .split(/[,，、]/)
                .map((t) => t.trim())
                .filter(Boolean);
              if (tags.length === 0) {
                return (
                  <div className="flex h-full min-h-[6rem] items-center text-xs text-muted-foreground/60">
                    Brief 卖点为空，将自动跳过此参考
                  </div>
                );
              }
              return (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-[#FF5500]/20 bg-[#FF5500]/5 px-2.5 py-1 text-[11px] text-[#FF5500]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {phase === 'idle' ? (
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              size="sm"
              onClick={start}
              variant="outline"
              className="rounded-full border-[#FF5500]/30 bg-white text-[#FF5500] shadow-[0_1px_2px_rgba(255,85,0,0.08)] hover:border-[#FF5500]/50 hover:bg-[#FF5500]/5 hover:text-[#FF5500]"
            >
              <Wand2 className="mr-1 h-3.5 w-3.5" />
              开始生成
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {steps.map((s) => {
              const idx = order[s.key as keyof typeof order];
              const cur = order[phase];
              const done = cur > idx;
              const active = cur === idx;
              return (
                <div key={s.key} className="flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px]',
                      done
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                        : active
                        ? 'border-accent text-accent'
                        : 'border-border/50 text-muted-foreground',
                    )}
                  >
                    {done ? <CheckCircle2 className="h-3 w-3" /> : active ? '·' : ''}
                  </span>
                  <span className={cn('truncate', done || active ? 'text-foreground' : 'text-muted-foreground')}>
                    {s.label}
                  </span>
                  <span className="ml-auto shrink-0 text-[10px] text-muted-foreground/70">{s.agent}</span>
                  {active ? <span className="ml-1 h-1 w-1 animate-pulse rounded-full bg-accent" /> : null}
                </div>
              );
            })}
            {phase === 'done' ? (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50/60 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span>生成完成 · 右侧查看素材</span>
                <button
                  type="button"
                  onClick={start}
                  className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
                >
                  再生成一批
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// ============== Plan form step ==============
function PlanFormStep({
  task,
  form,
  setForm,
  onBack,
  onSubmit,
}: {
  task: OranMedTask;
  form: { scheduledAt: string; platform: Platform; cadence: string; notes: string };
  setForm: React.Dispatch<React.SetStateAction<{ scheduledAt: string; platform: Platform; cadence: string; notes: string }>>;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const orangenCount = task.assets.filter((a) => a.source === 'orangen').length;
  const localCount = task.assets.length - orangenCount;
  const assetSource =
    orangenCount > 0 && localCount > 0
      ? `OranGen ${orangenCount} · 本地 ${localCount}`
      : orangenCount > 0
      ? `OranGen 生成`
      : `本地上传`;
  const creatorNames = task.selectedCreatorIds
    .map((id) => CREATORS.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3)
    .join('、');

  const canSubmit = form.scheduledAt && form.platform;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 rounded-lg border border-border/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>返回</span>
      </button>

      <header>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <ListChecks className="h-3.5 w-3.5 text-accent" />
          <span>发布计划</span>
        </div>
        <h2 className="mt-2 text-2xl font-light tracking-tight text-foreground">
          {task.brief.title || '达人投放任务'}
        </h2>
      </header>

      <div className="rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="发布时间">
            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm((s) => ({ ...s, scheduledAt: e.target.value }))}
            />
          </Field>
          <Field label="发布平台">
            <Select value={form.platform} onValueChange={(v) => setForm((s) => ({ ...s, platform: v as Platform }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="md:col-span-2">
            <Field label="发布节奏">
              <Input
                value={form.cadence}
                onChange={(e) => setForm((s) => ({ ...s, cadence: e.target.value }))}
                placeholder="集中投放3天 / 间隔投放 / 高峰时段"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="发布说明">
              <Textarea
                rows={4}
                value={form.notes}
                onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
                placeholder="补充本次发布的文案要点、互动引导、合规要求等"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-sky-50/60 px-5 py-4 dark:bg-sky-950/30">
          <div className="text-sm font-medium text-foreground">本次发布</div>
          <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-muted-foreground sm:grid-cols-2">
            <div>达人：<span className="text-foreground/80">{creatorNames || '未选择'}{task.selectedCreatorIds.length > 3 ? ` 等 ${task.selectedCreatorIds.length} 位` : ''}</span></div>
            <div>资产来源：<span className="text-foreground/80">{assetSource}</span></div>
            <div>资产：<span className="text-foreground/80">{task.assets.length} 项</span></div>
            <div>预算：<span className="text-foreground/80">{task.brief.budget || '未设置'}</span></div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          disabled={!canSubmit}
          onClick={onSubmit}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#FF5500]/30 bg-white px-5 py-2.5 text-sm font-medium text-[#FF5500] shadow-[0_1px_2px_rgba(255,85,0,0.08)] transition-all hover:border-[#FF5500]/50 hover:bg-[#FF5500]/5 hover:text-[#FF5500] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          提交平台审核
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ============== Shared task card shell ==============
interface TaskCardProps {
  index: number;
  icon: React.ReactNode;
  title: string;
  hint: string;
  status: 'idle' | 'active' | 'done';
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function TaskCard({ index, icon, title, hint, status, children, defaultOpen }: TaskCardProps) {
  const [open, setOpen] = useState(defaultOpen ?? status !== 'done');
  useEffect(() => {
    if (status === 'active') setOpen(true);
  }, [status]);

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card/60 backdrop-blur-sm transition-all',
        status === 'done'
          ? 'border-emerald-200/60 dark:border-emerald-900/40'
          : status === 'active'
          ? 'border-accent/40 shadow-sm'
          : 'border-border/40',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
            status === 'done'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              : status === 'active'
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-border/50 bg-muted/40 text-muted-foreground',
          )}
        >
          {status === 'done' ? <CheckCircle2 className="h-4 w-4" /> : index}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{icon}</span>
            <span className="text-sm font-medium text-foreground">{title}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{hint}</p>
        </div>
        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-90')} />
      </button>
      {open ? <div className="border-t border-border/30 px-5 py-5">{children}</div> : null}
    </div>
  );
}

// ============== Card 1: Brief ==============
function BriefCard() {
  const { currentTask, updateBrief, saveBrief, setCreators } = useOranMed();
  const { brief, briefSaved } = currentTask;
  const status = briefSaved ? 'done' : 'active';
  const hint = briefSaved
    ? `${brief.title || '未命名'} · ${brief.platform} · 目标 ${brief.targetCreatorCount} 位达人`
    : '填写品牌、目标人群、预期发布时间等关键信息';

  const valid = brief.title.trim() && brief.goal.trim() && brief.brandName.trim();

  return (
    <TaskCard
      index={1}
      icon={<FileText className="h-3.5 w-3.5" />}
      title="任务 Brief"
      hint={hint}
      status={status}
      defaultOpen
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="任务名称" required>
          <Input
            value={brief.title}
            onChange={(e) => updateBrief({ title: e.target.value })}
            placeholder="例如：玻色因精华 5 月小红书种草"
          />
        </Field>
        <Field label="目标平台" required>
          <Select value={brief.platform} onValueChange={(v) => { if (v !== brief.platform) setCreators([]); updateBrief({ platform: v as Platform }); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="品牌名称" required>
          <Input value={brief.brandName} onChange={(e) => updateBrief({ brandName: e.target.value })} placeholder="OranSkin" />
        </Field>
        <Field label="品牌品类">
          <Input value={brief.brandCategory} onChange={(e) => updateBrief({ brandCategory: e.target.value })} placeholder="护肤 / 美妆 / 食品" />
        </Field>
        <Field label="品牌标签">
          <Input value={brief.brandTags} onChange={(e) => updateBrief({ brandTags: e.target.value })} placeholder="抗老,成分,医研共创" />
        </Field>
        <Field label="目标人群">
          <Input value={brief.audience} onChange={(e) => updateBrief({ audience: e.target.value })} placeholder="25-35 岁都市女性" />
        </Field>
        <Field label="期望发布时间">
          <Input type="date" value={brief.expectedPublishDate} onChange={(e) => updateBrief({ expectedPublishDate: e.target.value })} />
        </Field>
        <Field label="期望达人数量">
          <Input
            type="number"
            min={1}
            max={20}
            value={brief.targetCreatorCount}
            onChange={(e) => updateBrief({ targetCreatorCount: Math.max(1, Number(e.target.value) || 1) })}
          />
        </Field>
        <Field label="风格要求">
          <Input value={brief.styleRequirements} onChange={(e) => updateBrief({ styleRequirements: e.target.value })} placeholder="专业测评 / 干货 / 日常 Vlog" />
        </Field>
        <Field label="品类要求">
          <Input value={brief.categoryRequirements} onChange={(e) => updateBrief({ categoryRequirements: e.target.value })} placeholder="护肤,成分党" />
        </Field>
        <Field label="预算" >
          <Input value={brief.budget} onChange={(e) => updateBrief({ budget: e.target.value })} placeholder="50,000 积分" />
        </Field>
        <div className="md:col-span-2">
          <Field label="任务目标 / 投放策略" required>
            <Textarea
              rows={3}
              value={brief.goal}
              onChange={(e) => updateBrief({ goal: e.target.value })}
              placeholder="希望通过本次投放达到的目标，例如：提升新品认知、带动搜索与加购"
            />
          </Field>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-end gap-2">
        {briefSaved ? <span className="text-xs text-emerald-600">已保存</span> : null}
        <Button size="sm" disabled={!valid} onClick={saveBrief}>
          {briefSaved ? '重新保存' : '保存并继续'}
        </Button>
      </div>
    </TaskCard>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

// ============== Card 2: Creators ==============
function CreatorsCard() {
  const { currentTask, briefSavedAvailable, toggleCreator } = useUtils();
  const { brief, selectedCreatorIds } = currentTask;
  const [mode, setMode] = useState<'ai' | 'all'>('ai');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');

  const aiList = useMemo(
    () =>
      [...CREATORS]
        .filter((c) => (brief.platform ? c.platform === brief.platform || c.matchScore >= 80 : true))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, Math.max(brief.targetCreatorCount * 2, 6)),
    [brief.platform, brief.targetCreatorCount],
  );
  const allList = useMemo(
    () => CREATORS.filter((c) => platformFilter === 'all' || c.platform === platformFilter),
    [platformFilter],
  );

  const list = mode === 'ai' ? aiList : allList;
  const status: 'idle' | 'active' | 'done' =
    selectedCreatorIds.length > 0 ? 'done' : briefSavedAvailable ? 'active' : 'idle';
  const hint =
    selectedCreatorIds.length > 0
      ? `已选择 ${selectedCreatorIds.length} 位达人`
      : briefSavedAvailable
      ? 'AI 已推荐匹配达人，也可手动从全部达人中挑选'
      : '请先完成 Brief';

  if (!briefSavedAvailable) {
    return (
      <TaskCard index={2} icon={<Users className="h-3.5 w-3.5" />} title="选择达人" hint={hint} status="idle">
        <p className="text-sm text-muted-foreground">完成上一步 Brief 后，AI 将基于品牌与人群匹配达人。</p>
      </TaskCard>
    );
  }

  return (
    <TaskCard index={2} icon={<Users className="h-3.5 w-3.5" />} title="选择达人" hint={hint} status={status}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ModeTab active={mode === 'ai'} onClick={() => setMode('ai')} icon={<Wand2 className="h-3 w-3" />}>
          AI 推荐匹配
        </ModeTab>
        <ModeTab active={mode === 'all'} onClick={() => setMode('all')} icon={<ListChecks className="h-3 w-3" />}>
          全部达人
        </ModeTab>
        {mode === 'all' ? (
          <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v as Platform | 'all')}>
            <SelectTrigger className="ml-auto h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部平台</SelectItem>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="ml-auto text-xs text-muted-foreground">期望 {brief.targetCreatorCount} 位</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {list.map((c) => (
          <CreatorTile
            key={c.id}
            creator={c}
            selected={selectedCreatorIds.includes(c.id)}
            showMatch={mode === 'ai'}
            onToggle={() => toggleCreator(c.id)}
          />
        ))}
      </div>
    </TaskCard>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
        active ? 'border-accent bg-accent/10 text-accent' : 'border-border/40 text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function CreatorTile({
  creator,
  selected,
  showMatch,
  onToggle,
}: {
  creator: Creator;
  selected: boolean;
  showMatch: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all',
        selected
          ? 'border-accent/60 bg-accent/5 shadow-sm'
          : 'border-border/40 hover:border-border bg-card/40',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white',
          creator.tier === 'KOL'
            ? 'bg-gradient-to-br from-rose-400 to-orange-400'
            : 'bg-gradient-to-br from-sky-400 to-indigo-400',
        )}
      >
        {creator.name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{creator.name}</span>
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{creator.tier}</Badge>
          <span className="text-[10px] text-muted-foreground">{creator.platform}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>粉丝 {creator.followers}</span>
          <span>均播 {creator.avgPlay}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {creator.tags.map((t) => (
            <span key={t} className="rounded-full bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
        {showMatch ? (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-accent">
            <Sparkles className="h-3 w-3" />
            <span className="font-medium">匹配度 {creator.matchScore}</span>
            <span className="truncate text-muted-foreground">· {creator.matchReason}</span>
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0 rounded-full border',
          selected ? 'border-accent bg-accent' : 'border-border/60',
        )}
      >
        {selected ? <CheckCircle2 className="h-full w-full text-white" /> : null}
      </div>
    </button>
  );
}

// ============== Card 3: Assets ==============
function AssetsCard() {
  const { currentTask, setAssetMode, addAsset, removeAsset } = useOranMed();
  const { selectedCreatorIds, assetMode, assets } = currentTask;

  const ready = selectedCreatorIds.length > 0;
  const status: 'idle' | 'active' | 'done' = !ready
    ? 'idle'
    : assetMode && assets.length >= selectedCreatorIds.length
    ? 'done'
    : 'active';

  const hint = !ready
    ? '请先选择达人'
    : assetMode === 'orangen'
    ? `已选择由 ORAN GEN 生成 · ${assets.length}/${selectedCreatorIds.length}`
    : assetMode === 'local'
    ? `本地上传 · ${assets.length}/${selectedCreatorIds.length}`
    : '上传已有素材或选择由 ORAN GEN 生成';

  if (!ready) {
    return <TaskCard index={3} icon={<ImageIcon className="h-3.5 w-3.5" />} title="内容资产" hint={hint} status="idle"><p className="text-sm text-muted-foreground">完成选择达人后再准备内容资产。</p></TaskCard>;
  }

  return (
    <TaskCard index={3} icon={<ImageIcon className="h-3.5 w-3.5" />} title="内容资产" hint={hint} status={status}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ModeChoice
          active={assetMode === 'local'}
          icon={<Upload className="h-4 w-4" />}
          title="本地上传"
          desc="上传已有的图片 / 视频素材"
          onClick={() => setAssetMode('local')}
        />
        <ModeChoice
          active={assetMode === 'orangen'}
          icon={<Wand2 className="h-4 w-4" />}
          title="由 ORAN GEN 生成"
          desc="还没有素材？让 AI 自动生成"
          onClick={() => setAssetMode('orangen')}
        />
      </div>

      {assetMode ? (
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {assets.map((a) => {
              const creator = CREATORS.find((c) => c.id === a.creatorId);
              return (
                <div key={a.id} className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/40">
                  <div className={cn('h-24 w-full bg-gradient-to-br', a.thumbnailColor)} />
                  <div className="p-2.5">
                    <div className="truncate text-xs font-medium text-foreground">{a.title}</div>
                    <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{creator?.name ?? '未指派'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAsset(a.id)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              );
            })}
            <AddAssetTile mode={assetMode} onAdd={(creatorId) => {
              const palette = [
                'from-rose-300 to-orange-300',
                'from-sky-300 to-indigo-300',
                'from-violet-300 to-fuchsia-300',
                'from-emerald-300 to-teal-300',
                'from-amber-300 to-orange-300',
              ];
              addAsset({
                id: `a_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
                creatorId,
                title: assetMode === 'orangen' ? `ORAN GEN · ${CREATORS.find((c) => c.id === creatorId)?.name ?? ''}` : `素材 ${assets.length + 1}`,
                source: assetMode!,
                thumbnailColor: palette[assets.length % palette.length],
                status: 'ready',
              });
            }} availableCreators={selectedCreatorIds} />
          </div>
        </div>
      ) : null}
    </TaskCard>
  );
}

function ModeChoice({
  active,
  icon,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
        active ? 'border-accent/60 bg-accent/5' : 'border-border/40 bg-card/40 hover:border-border',
      )}
    >
      <div className={cn('mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg', active ? 'bg-accent/15 text-accent' : 'bg-muted/40 text-muted-foreground')}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
    </button>
  );
}

function AddAssetTile({
  mode,
  onAdd,
  availableCreators,
}: {
  mode: 'local' | 'orangen';
  onAdd: (creatorId: string) => void;
  availableCreators: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-full min-h-[136px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
      >
        {mode === 'local' ? <Upload className="h-5 w-5" /> : <Wand2 className="h-5 w-5" />}
        <span>{mode === 'local' ? '上传素材' : '生成素材'}</span>
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-lg border border-border/40 bg-popover p-1 shadow-md">
          {availableCreators.length === 0 ? (
            <div className="px-2 py-2 text-xs text-muted-foreground">先选择达人</div>
          ) : (
            availableCreators.map((id) => {
              const c = CREATORS.find((cc) => cc.id === id);
              if (!c) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onAdd(id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-accent/10"
                >
                  <span className="text-foreground">{c.name}</span>
                  <span className="text-muted-foreground">{c.platform}</span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

// ============== Card 4: Plan ==============
function PlanCard() {
  const { currentTask, updatePlanItem, confirmPlan } = useOranMed();
  const { assets, plan, assetMode } = currentTask;

  const ready = assets.length > 0;
  const allPlanned = ready && assets.every((a) => {
    const item = plan.find((p) => p.assetId === a.id);
    return item && item.scheduledAt && item.caption.trim();
  });
  const status: 'idle' | 'active' | 'done' = !ready
    ? 'idle'
    : currentTask.planConfirmed
    ? 'done'
    : 'active';
  const hint = !ready
    ? '请先准备内容资产'
    : currentTask.planConfirmed
    ? `已锁定发布计划 ${plan.length} 条`
    : `待为 ${assets.length} 条素材填写发布信息`;

  if (!ready) {
    return <TaskCard index={4} icon={<ListChecks className="h-3.5 w-3.5" />} title="发布计划" hint={hint} status="idle"><p className="text-sm text-muted-foreground">完成内容资产后，再为每条素材安排发布时间与文案。</p></TaskCard>;
  }

  return (
    <TaskCard index={4} icon={<ListChecks className="h-3.5 w-3.5" />} title="发布计划" hint={hint} status={status}>
      <div className="space-y-3">
        {assets.map((a) => {
          const creator = CREATORS.find((c) => c.id === a.creatorId);
          const item = plan.find((p) => p.assetId === a.id);
          return (
            <div key={a.id} className="rounded-xl border border-border/40 bg-card/40 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className={cn('h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br', a.thumbnailColor)} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {creator?.name} · {creator?.platform}
                  </div>
                </div>
                <Badge variant="outline" className="h-5 text-[10px]">{a.source === 'orangen' ? 'ORAN GEN' : '本地'}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="发布时间">
                  <Input
                    type="datetime-local"
                    value={item?.scheduledAt ?? ''}
                    onChange={(e) => updatePlanItem(a.id, { scheduledAt: e.target.value })}
                  />
                </Field>
                <Field label="平台">
                  <Select
                    value={item?.platform ?? creator?.platform ?? '小红书'}
                    onValueChange={(v) => updatePlanItem(a.id, { platform: v as Platform })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="文案">
                    <Textarea
                      rows={2}
                      value={item?.caption ?? ''}
                      onChange={(e) => updatePlanItem(a.id, { caption: e.target.value })}
                      placeholder="发布文案..."
                    />
                  </Field>
                </div>
                <Field label="话题标签">
                  <Input
                    value={item?.hashtags ?? ''}
                    onChange={(e) => updatePlanItem(a.id, { hashtags: e.target.value })}
                    placeholder="#护肤 #抗老"
                  />
                </Field>
                <div className="flex items-end justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
                  <div>
                    <div className="text-xs font-medium text-foreground">付费推广</div>
                    <div className="text-[11px] text-muted-foreground">开启后将走平台 dou+/聚光等付费投放</div>
                  </div>
                  <Switch
                    checked={item?.paidPromotion ?? false}
                    onCheckedChange={(v) => updatePlanItem(a.id, { paidPromotion: v })}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <Button size="sm" disabled={!allPlanned} onClick={confirmPlan}>
          {currentTask.planConfirmed ? '已确认发布计划' : '确认发布计划'}
        </Button>
      </div>
      {!assetMode ? null : null}
    </TaskCard>
  );
}

// ============== Card 5: Submit ==============
function SubmitCard() {
  const { currentTask, setCompliance, submitForReview, startNewTask } = useOranMed();
  const ready = currentTask.planConfirmed;
  const status: 'idle' | 'active' | 'done' = !ready
    ? 'idle'
    : currentTask.status === 'reviewing' || currentTask.status === 'approved' || currentTask.status === 'rejected' || currentTask.status === 'published'
    ? 'done'
    : 'active';
  const hint = !ready
    ? '请先确认发布计划'
    : currentTask.status === 'reviewing'
    ? '审核中，平台预计 1-2 个工作日反馈'
    : currentTask.status === 'approved'
    ? '审核已通过，等待按计划发布'
    : currentTask.status === 'rejected'
    ? '审核未通过，请根据反馈调整后重新提交'
    : currentTask.status === 'published'
    ? '任务已按计划完成发布'
    : '勾选合规承诺后提交平台审核';

  if (!ready) {
    return <TaskCard index={5} icon={<CheckCircle2 className="h-3.5 w-3.5" />} title="提交审核" hint={hint} status="idle"><p className="text-sm text-muted-foreground">完成上一步后即可提交平台审核。</p></TaskCard>;
  }

  return (
    <TaskCard index={5} icon={<CheckCircle2 className="h-3.5 w-3.5" />} title="提交审核" hint={hint} status={status}>
      <div className="space-y-4">
        <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
          <div className="text-xs font-medium text-foreground mb-2">提交概览</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
            <SummaryItem label="达人" value={`${currentTask.selectedCreatorIds.length}`} />
            <SummaryItem label="素材" value={`${currentTask.assets.length}`} />
            <SummaryItem label="发布计划" value={`${currentTask.plan.length}`} />
            <SummaryItem label="目标平台" value={currentTask.brief.platform} />
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/40 p-3 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={currentTask.complianceConfirmed}
            onChange={(e) => setCompliance(e.target.checked)}
          />
          <span>
            我已确认本次投放内容符合 <span className="text-foreground">广告合规、品牌授权与平台社区规则</span>，相关素材均已获得创作者授权，可提交审核与发布。
          </span>
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {currentTask.status === 'reviewing' || currentTask.status === 'approved' || currentTask.status === 'rejected' || currentTask.status === 'published' ? (
            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs', STATUS_TONE[currentTask.status])} variant="secondary">
                {STATUS_LABEL[currentTask.status]}
              </Badge>
              <Button size="sm" variant="outline" onClick={startNewTask}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                发起新任务
              </Button>
            </div>
          ) : <span />}
          <Button
            size="sm"
            variant="outline"
            disabled={!currentTask.complianceConfirmed || currentTask.status === 'reviewing' || currentTask.status === 'published'}
            onClick={() => {
              const ok = Math.random() > 0.15;
              if (ok) {
                submitForReview();
                try { sessionStorage.setItem(HIGHLIGHT_KEY, currentTask.id); } catch {}
                toast.success('已提交平台审核', { description: '预计 1-2 个工作日反馈结果' });
              } else {
                toast.error('提交失败', { description: '网络异常，请稍后重试' });
              }
            }}
            className="rounded-full border-[#FF5500]/30 bg-white text-[#FF5500] shadow-[0_1px_2px_rgba(255,85,0,0.08)] hover:border-[#FF5500]/50 hover:bg-[#FF5500]/5 hover:text-[#FF5500] disabled:opacity-50"
          >
            {currentTask.status === 'reviewing' ? '已提交' : currentTask.status === 'published' ? '已发布' : '提交平台审核'}
          </Button>
        </div>
      </div>
    </TaskCard>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function TaskStatusFooter({ task }: { task: OranMedTask }) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border border-border/30 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>当前任务</span>
        <span className="truncate text-foreground">{task.brief.title || '未命名任务'}</span>
      </div>
      <Badge className={cn('text-[10px]', STATUS_TONE[task.status])} variant="secondary">
        {STATUS_LABEL[task.status]}
      </Badge>
    </div>
  );
}

// ============== Workbench ==============
const PLATFORM_ACCENT: Record<Platform, { bar: string; chip: string; dot: string }> = {
  '小红书': { bar: 'from-rose-400 via-rose-500 to-pink-500', chip: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300', dot: 'bg-rose-500' },
  '抖音':   { bar: 'from-zinc-700 via-zinc-900 to-black', chip: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200', dot: 'bg-zinc-900 dark:bg-zinc-200' },
  'B站':   { bar: 'from-sky-400 via-cyan-400 to-pink-400', chip: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300', dot: 'bg-sky-500' },
  '微博':   { bar: 'from-orange-400 via-amber-500 to-red-500', chip: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300', dot: 'bg-orange-500' },
};

const STATUS_DOT: Record<TaskStatus, string> = {
  draft: '#FF5500',
  reviewing: '#3B82F6',
  approved: '#A5D710',
  rejected: '#EF4444',
  published: '#8B5CF6',
};

function computeProgress(t: OranMedTask) {
  const steps = [
    t.briefSaved,
    t.selectedCreatorIds.length > 0,
    t.assets.length > 0,
    t.plan.length > 0 && t.planConfirmed,
  ];
  const done = steps.filter(Boolean).length;
  return { done, total: steps.length, pct: (done / steps.length) * 100 };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function WorkbenchView({ onBack, onOpenWorkflow }: { onBack: () => void; onOpenWorkflow: () => void }) {
  const { tasks, loadTask, deleteTask } = useOranMed();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');
  const detailTask = useMemo(() => tasks.find((x) => x.id === detailId) || null, [tasks, detailId]);

  const [highlightId, setHighlightId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const id = sessionStorage.getItem(HIGHLIGHT_KEY);
      if (id) {
        setHighlightId(id);
        sessionStorage.removeItem(HIGHLIGHT_KEY);
        const t = setTimeout(() => setHighlightId(null), 3200);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const counts = useMemo(() => {
    const c: Record<TaskStatus, number> = {
      draft: 0,
      reviewing: 0,
      approved: 0,
      rejected: 0,
      published: 0,
    };
    for (const t of tasks) c[t.status]++;
    return c;
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filterStatus === 'all') return tasks;
    return tasks.filter((t) => t.status === filterStatus);
  }, [tasks, filterStatus]);

  const statusOrder: TaskStatus[] = ['draft', 'reviewing', 'approved', 'rejected', 'published'];

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setScrolled(el.scrollTop > 4);
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'shrink-0 px-6 pt-8 transition-all duration-300 lg:px-10 lg:pt-10',
          scrolled
            ? 'border-b border-border/50 bg-background/85 pb-5 shadow-[0_6px_20px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent pb-0'
        )}
      >
        <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-normal text-foreground">任务工作台</h1>
          <p className="text-xs text-muted-foreground">管理所有 ORAN MED 投放任务的进度</p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-4 py-2 text-sm font-normal text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-muted/60 hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>创建新任务</span>
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => setFilterStatus('all')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-normal transition-all',
            filterStatus === 'all'
              ? 'border-foreground/20 bg-foreground/90 text-background shadow-sm'
              : 'border-border/40 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          )}
        >
          <span>全部</span>
          <span className={cn('inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-medium', filterStatus === 'all' ? 'bg-background/25 text-background' : 'bg-foreground/10 text-foreground/70')}>{tasks.length}</span>
        </button>
        {statusOrder.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-normal transition-all',
              filterStatus === s
                ? 'border-foreground/20 bg-foreground/90 text-background shadow-sm'
                : 'border-border/40 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            )}
          >
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-40 blur-[2px]" style={{ background: STATUS_DOT[s] }} />
              <span className="relative inline-flex h-[5px] w-[5px] rounded-full" style={{ background: STATUS_DOT[s] }} />
            </span>
            <span>{STATUS_LABEL[s]}</span>
            <span className={cn('inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-medium', filterStatus === s ? 'bg-background/25 text-background' : 'bg-foreground/10 text-foreground/70')}>{counts[s]}</span>
          </button>
        ))}
      </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className={cn('pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background to-transparent transition-opacity duration-300', scrolled ? 'opacity-100' : 'opacity-0')} />
        <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background to-transparent transition-opacity duration-300', atBottom ? 'opacity-0' : 'opacity-100')} />
        <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain px-6 pb-10 pt-6 lg:px-10">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleTasks.map((t) => {
          const statusDot = STATUS_DOT[t.status];
          const firstCreator = CREATORS.find((c) => c.id === t.selectedCreatorIds[0]);
          const avatarLabel = (firstCreator?.name || t.brief.brandName || 'M').slice(0, 1);
          const briefPreview = t.brief.goal?.trim() || '输入 Brief 内容';
          return (
            <button
              key={t.id}
              onClick={() => setDetailId(t.id)}
              className="group relative block text-left"
            >
              {/* stacked asset preview sheets behind — fan out on hover */}
              {(() => {
                const previews = t.assets.slice(0, 2);
                const placeholders = [
                  { rot: -4, top: '-top-4', side: 'left-1 right-3', h: 'h-[88%]' },
                  { rot: 3, top: '-top-3', side: 'left-3 right-1', h: 'h-[90%]' },
                ];
                const hoverTransforms = [
                  'group-hover:-translate-x-6 group-hover:-translate-y-2 group-hover:-rotate-[10deg]',
                  'group-hover:translate-x-6 group-hover:-translate-y-1 group-hover:rotate-[9deg]',
                ];
                return placeholders.map((p, i) => {
                  const asset = previews[i];
                  const isVideo = asset && /视频|video|短片|reel|story/i.test(asset.title);
                  return (
                    <div
                      key={i}
                      aria-hidden
                      className={cn(
                        'pointer-events-none absolute overflow-hidden rounded-[28px] border border-white/60 shadow-[6px_4px_14px_-4px_rgba(0,0,0,0.22)] transition-all duration-500 ease-out',
                        p.top, p.side, p.h,
                        hoverTransforms[i],
                        asset ? '' : 'bg-gradient-to-br from-muted/70 to-muted/40'
                      )}
                      style={{ transform: `rotate(${p.rot}deg)` }}
                    >
                      {asset ? (
                        <div className={cn('relative h-full w-full bg-gradient-to-br', asset.thumbnailColor || 'from-muted to-muted-foreground/30')}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                          <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-foreground/70 shadow-sm">
                            {isVideo ? <Play className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                          </div>
                          <div className="absolute bottom-2 left-3 right-3 truncate text-[10px] font-light text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                            {asset.title}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                          <span className="text-[10px] font-light text-muted-foreground">暂无内容资产</span>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}

              {/* main card */}
              <div className={cn(
                'relative flex h-[200px] flex-col rounded-[28px] border border-white/60 bg-card/80 px-5 py-4 shadow-[8px_10px_24px_-10px_rgba(0,0,0,0.18)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[10px_18px_36px_-10px_rgba(0,0,0,0.28)]',
                highlightId === t.id && 'animate-[highlight-pop_3s_ease-out] ring-2 ring-[#FF5500]/60 ring-offset-2 ring-offset-background'
              )}>
                {/* status top-right */}
                <div className="flex items-center justify-end gap-1.5">
                  {t.status === 'draft' && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="删除草稿"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeleteId(t.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          e.preventDefault();
                          setDeleteId(t.id);
                        }
                      }}
                      className="mr-1 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground/60 opacity-0 transition hover:bg-foreground/5 hover:text-[#FF5500] group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                    <span
                      className="absolute inline-flex h-full w-full rounded-full opacity-40 blur-[2px]"
                      style={{ background: statusDot }}
                    />
                    <span
                      className="relative inline-flex h-2 w-2 rounded-full"
                      style={{ background: statusDot }}
                    />
                  </span>
                  <span className="text-[12px] font-light text-muted-foreground">
                    {STATUS_LABEL[t.status]}
                  </span>
                </div>

                {/* task name row */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="truncate text-[15px] font-medium leading-snug text-foreground/80">
                    {t.brief.title || '未命名任务'}
                  </span>
                  <span className="shrink-0 rounded-full bg-muted/60 px-2.5 py-0.5 text-[11px] font-light text-muted-foreground">
                    {t.brief.platform}
                  </span>
                  {t.assets.length > 0 && (
                    <span className="ml-auto shrink-0 rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-light text-muted-foreground">
                      {t.assets.length} 项资产
                    </span>
                  )}
                </div>

                {/* brief preview */}
                <p className="mt-3 line-clamp-2 text-[12px] font-light leading-relaxed text-muted-foreground">
                  {briefPreview}
                </p>

                {/* avatar bottom-right */}
                <div className="mt-auto flex items-end justify-between pt-2">
                  <span className="text-[10px] font-light text-muted-foreground/70">
                    {formatDate(t.updatedAt)} · {t.brief.brandName || '未命名品牌'}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-muted to-muted/60 text-sm font-light text-foreground/60 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                    {avatarLabel}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
          </div>
        </div>
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="sm:max-w-[360px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">确认删除</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              删除后该草稿任务将无法恢复，确定要继续吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button
              className="flex-1 rounded-xl bg-[#FF5500] text-white hover:bg-[#FF5500]/90"
              onClick={() => {
                if (deleteId) {
                  deleteTask(deleteId);
                  setDeleteId(null);
                  toast.success('已删除草稿任务');
                }
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TaskDetailDialog
        task={detailTask}
        onClose={() => setDetailId(null)}
        onOpen={() => {
          if (detailTask) {
            loadTask(detailTask.id);
            setDetailId(null);
            onOpenWorkflow();
          }
        }}
      />
    </div>
  );
}

// ============== Task Detail Dialog ==============
function TaskDetailDialog({
  task,
  onClose,
  onOpen,
}: {
  task: OranMedTask | null;
  onClose: () => void;
  onOpen: () => void;
}) {
  const open = !!task;
  const creators = useMemo(() => {
    if (!task) return [] as Creator[];
    return task.selectedCreatorIds
      .map((id) => CREATORS.find((c) => c.id === id))
      .filter((c): c is Creator => !!c);
  }, [task]);

  type View =
    | { kind: 'main' }
    | { kind: 'creator'; id: string }
    | { kind: 'asset'; id: string }
    | { kind: 'plan'; index: number };
  const [view, setView] = useState<View>({ kind: 'main' });

  useEffect(() => {
    if (open) setView({ kind: 'main' });
  }, [open, task?.id]);

  const isDraft = task?.status === 'draft';

  const activeCreator = view.kind === 'creator' ? CREATORS.find((c) => c.id === view.id) : null;
  const activeAsset = view.kind === 'asset' ? task?.assets.find((a) => a.id === view.id) : null;
  const activePlan = view.kind === 'plan' ? task?.plan[view.index] : null;
  const activePlanCreator = activePlan ? CREATORS.find((c) => c.id === activePlan.creatorId) : null;
  const activePlanAsset = activePlan ? task?.assets.find((a) => a.id === activePlan.assetId) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl [&>button]:hidden">
        {task && (
          <>
            <Badge
              className={cn(
                'absolute right-4 top-4 text-[10px] font-normal',
                STATUS_TONE[task.status],
              )}
              variant="secondary"
            >
              {STATUS_LABEL[task.status]}
            </Badge>
            <DialogHeader className="pr-20">
              {view.kind !== 'main' ? (
                <button
                  onClick={() => setView({ kind: 'main' })}
                  className="mb-1 flex w-fit items-center gap-1 text-[11px] font-light text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" />
                  返回任务详情
                </button>
              ) : null}
              <DialogTitle className="truncate">
                {view.kind === 'main' && (task.brief.title || '未命名任务')}
                {view.kind === 'creator' && (activeCreator?.name || '达人详情')}
                {view.kind === 'asset' && (activeAsset?.title || '素材详情')}
                {view.kind === 'plan' && `发布计划 · ${activePlanCreator?.name || ''}`}
              </DialogTitle>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-1.5">
                {view.kind === 'main' ? (
                  <>
                    <span>{task.brief.brandName || '未命名品牌'}</span>
                    <span className="text-border">·</span>
                    <span>{task.brief.platform}</span>
                    <span className="text-border">·</span>
                    <span>更新于 {formatDate(task.updatedAt)}</span>
                  </>
                ) : (
                  <span>{task.brief.title || '未命名任务'}</span>
                )}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-3">
              {view.kind === 'main' && (
                <div className="space-y-5">
                  <section>
                    <h4 className="mb-2 text-xs font-medium text-muted-foreground">Brief</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-border/50 bg-muted/20 p-3 text-xs">
                      <DetailRow label="投放目标" value={task.brief.goal || '—'} span2 />
                      <DetailRow label="目标受众" value={task.brief.audience || '—'} span2 />
                      <DetailRow label="品类" value={task.brief.brandCategory || '—'} />
                      <DetailRow label="预算" value={task.brief.budget || '—'} />
                      <DetailRow label="预期发布" value={task.brief.expectedPublishDate || '—'} />
                      <DetailRow label="期望达人数" value={String(task.brief.targetCreatorCount)} />
                    </div>
                  </section>

                  <section>
                    <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                      达人 <span className="text-foreground">({creators.length})</span>
                    </h4>
                    {creators.length === 0 ? (
                      <p className="text-xs text-muted-foreground">尚未选择达人</p>
                    ) : (
                      <div className="space-y-1.5">
                        {creators.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setView({ kind: 'creator', id: c.id })}
                            className="flex w-full items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-left text-xs transition-colors hover:border-foreground/30 hover:bg-muted/30"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium text-foreground">{c.name} <span className="ml-1 text-[10px] text-muted-foreground">{c.handle}</span></div>
                              <div className="mt-0.5 text-[10px] text-muted-foreground">{c.tier} · {c.followers} 粉丝 · 匹配度 {c.matchScore}</div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="secondary" className="text-[10px]">{c.platform}</Badge>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>

                  <section>
                    <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                      素材 <span className="text-foreground">({task.assets.length})</span>
                    </h4>
                    {task.assets.length === 0 ? (
                      <p className="text-xs text-muted-foreground">尚未上传或生成内容</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {task.assets.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => setView({ kind: 'asset', id: a.id })}
                            className="overflow-hidden rounded-lg border border-border/40 text-left transition-all hover:border-foreground/30 hover:shadow-sm"
                          >
                            <div className={cn('h-16 w-full bg-gradient-to-br', a.thumbnailColor)} />
                            <div className="px-2 py-1.5">
                              <div className="truncate text-[11px] font-medium text-foreground">{a.title}</div>
                              <div className="text-[10px] text-muted-foreground">{a.source === 'local' ? '本地上传' : 'ORAN GEN'} · {a.status}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>

                  <section>
                    <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                      发布计划 <span className="text-foreground">({task.plan.length})</span>
                    </h4>
                    {task.plan.length === 0 ? (
                      <p className="text-xs text-muted-foreground">尚未填写发布计划</p>
                    ) : (
                      <div className="space-y-1.5">
                        {task.plan.map((p, i) => {
                          const cr = CREATORS.find((c) => c.id === p.creatorId);
                          return (
                            <button
                              key={i}
                              onClick={() => setView({ kind: 'plan', index: i })}
                              className="block w-full rounded-lg border border-border/40 px-3 py-2 text-left text-xs transition-colors hover:border-foreground/30 hover:bg-muted/30"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-foreground">{cr?.name || p.creatorId}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-muted-foreground">{p.scheduledAt || '未排期'}</span>
                                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                              </div>
                              {p.caption && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{p.caption}</p>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {view.kind === 'creator' && activeCreator && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/60 text-sm font-light text-foreground/60">
                      {activeCreator.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">{activeCreator.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{activeCreator.handle} · {activeCreator.platform}</div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">匹配度 {activeCreator.matchScore}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-border/50 bg-muted/20 p-3 text-xs">
                    <DetailRow label="层级" value={activeCreator.tier} />
                    <DetailRow label="平台" value={activeCreator.platform} />
                    <DetailRow label="粉丝量" value={activeCreator.followers} />
                    <DetailRow label="平均播放" value={activeCreator.avgPlay} />
                    <DetailRow label="标签" value={activeCreator.tags.join(' · ') || '—'} span2 />
                    <DetailRow label="推荐理由" value={activeCreator.matchReason || '—'} span2 />
                  </div>
                </div>
              )}

              {view.kind === 'asset' && activeAsset && (
                <div className="space-y-4">
                  <div className={cn('h-40 w-full rounded-xl bg-gradient-to-br', activeAsset.thumbnailColor)} />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-border/50 bg-muted/20 p-3 text-xs">
                    <DetailRow label="标题" value={activeAsset.title} span2 />
                    <DetailRow label="来源" value={activeAsset.source === 'local' ? '本地上传' : 'ORAN GEN'} />
                    <DetailRow label="状态" value={activeAsset.status} />
                  </div>
                </div>
              )}

              {view.kind === 'plan' && activePlan && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-border/50 bg-muted/20 p-3 text-xs">
                    <DetailRow label="达人" value={activePlanCreator?.name || activePlan.creatorId} />
                    <DetailRow label="平台" value={activePlan.platform} />
                    <DetailRow label="发布时间" value={activePlan.scheduledAt || '未排期'} span2 />
                    <DetailRow label="关联素材" value={activePlanAsset?.title || activePlan.assetId} span2 />
                    <DetailRow label="文案" value={activePlan.caption || '—'} span2 />
                    <DetailRow label="话题标签" value={activePlan.hashtags || '—'} span2 />
                    <DetailRow label="付费推广" value={activePlan.paidPromotion ? '是' : '否'} />
                  </div>
                </div>
              )}
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>关闭</Button>
              {isDraft && (
                <Button onClick={onOpen}>
                  继续编辑
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value, span2 }: { label: string; value: string; span2?: boolean }) {
  return (
    <div className={cn(span2 && 'col-span-2')}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-foreground">{value}</div>
    </div>
  );
}

// ============== Small helper hook ==============
function useUtils() {
  const ctx = useOranMed();
  return {
    ...ctx,
    briefSavedAvailable: ctx.currentTask.briefSaved,
  };
}
