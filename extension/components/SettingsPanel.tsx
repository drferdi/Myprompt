import type { TransformMode, CompilerProfile, EffortLevel } from '../lib/types';

interface SettingsPanelProps {
  transformMode: TransformMode;
  onTransformModeChange: (mode: TransformMode) => void;
  profile: CompilerProfile | undefined;
  onProfileChange: (profile: CompilerProfile | undefined) => void;
  effort: EffortLevel;
  onEffortChange: (effort: EffortLevel) => void;
}

const TRANSFORM_MODES: { id: TransformMode; label: string }[] = [
  { id: 'professional', label: 'Pro' },
  { id: 'creative', label: 'Creative' },
  { id: 'technical', label: 'Tech' },
  { id: 'academic', label: 'Academic' },
  { id: 'casual', label: 'Casual' },
];

const PROFILES: { id: CompilerProfile | 'default'; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'claude', label: 'Claude' },
  { id: 'codex', label: 'Codex' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'grok', label: 'Grok' },
];

const EFFORT_LEVELS: { id: EffortLevel; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Med' },
  { id: 'high', label: 'High' },
  { id: 'xhigh', label: 'XHigh' },
  { id: 'max', label: 'Max' },
];

export function SettingsPanel({
  transformMode,
  onTransformModeChange,
  profile,
  onProfileChange,
  effort,
  onEffortChange,
}: SettingsPanelProps) {
  return (
    <div className="space-y-2.5 p-3 bg-card rounded-xl border border-card-border">
      {/* Transform Mode */}
      <SettingRow label="Style">
        {TRANSFORM_MODES.map((m) => (
          <PillButton
            key={m.id}
            label={m.label}
            active={transformMode === m.id}
            onClick={() => onTransformModeChange(m.id)}
          />
        ))}
      </SettingRow>

      {/* Profile */}
      <SettingRow label="Profile">
        {PROFILES.map((p) => (
          <PillButton
            key={p.id}
            label={p.label}
            active={p.id === 'default' ? !profile : profile === p.id}
            onClick={() => onProfileChange(p.id === 'default' ? undefined : p.id as CompilerProfile)}
          />
        ))}
      </SettingRow>

      {/* Effort */}
      <SettingRow label="Effort">
        {EFFORT_LEVELS.map((e) => (
          <PillButton
            key={e.id}
            label={e.label}
            active={effort === e.id}
            onClick={() => onEffortChange(e.id)}
          />
        ))}
      </SettingRow>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-medium text-text-muted w-10 shrink-0">{label}</span>
      <div className="flex gap-0.5 flex-wrap">{children}</div>
    </div>
  );
}

function PillButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all duration-200 ${
        active
          ? 'bg-accent/20 text-accent border border-accent/30'
          : 'text-text-muted hover:text-text-secondary hover:bg-card-hover border border-transparent'
      }`}
    >
      {label}
    </button>
  );
}
