import { useState, useRef, useCallback, useEffect } from 'react';
import { transformPrompt } from '../../lib/transform';
import type { TransformMode, CompilerProfile, EffortLevel } from '../../lib/types';

type AppMode = 'transform' | 'optimize';

export default function App() {
  const [mode, setMode] = useState<AppMode>('transform');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [tokensEstimate, setTokensEstimate] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<CompilerProfile | undefined>(undefined);
  const [transformMode, setTransformMode] = useState<TransformMode>('professional');
  const [effort, setEffort] = useState<EffortLevel>('high');
  const [showOptions, setShowOptions] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(Math.max(el.scrollHeight, 48), 160)}px`;
    }
  }, [prompt]);

  const handleSubmit = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isProcessing) return;

    setIsProcessing(true);
    setShowResult(false);

    // Smooth transition delay
    await new Promise((r) => setTimeout(r, 180));

    try {
      const { transformedPrompt, tokensEstimate: tokens } = transformPrompt({
        prompt: trimmed,
        mode: transformMode,
        profile,
        effort,
      });
      setResult(transformedPrompt);
      setTokensEstimate(tokens);
      setShowResult(true);
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTokensEstimate(0);
      setShowResult(true);
    } finally {
      setIsProcessing(false);
    }
  }, [prompt, transformMode, profile, effort, isProcessing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleClear = useCallback(() => {
    setPrompt('');
    setResult('');
    setShowResult(false);
    setTokensEstimate(0);
    textareaRef.current?.focus();
  }, []);

  const profiles: { id: CompilerProfile | undefined; label: string; icon: string }[] = [
    { id: undefined, label: 'Default', icon: '⚡' },
    { id: 'claude', label: 'Claude', icon: '🟠' },
    { id: 'codex', label: 'Codex', icon: '🟢' },
    { id: 'gemini', label: 'Gemini', icon: '🔵' },
    { id: 'grok', label: 'Grok', icon: '⚪' },
  ];

  const modes: { id: TransformMode; label: string }[] = [
    { id: 'professional', label: 'Pro' },
    { id: 'creative', label: 'Creative' },
    { id: 'technical', label: 'Tech' },
    { id: 'academic', label: 'Academic' },
    { id: 'casual', label: 'Casual' },
  ];

  return (
    <div className="w-[440px] bg-[#0D0F14] text-[#F2F4F7] font-sans p-3 flex flex-col gap-2.5 select-none antialiased">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 363 363" className="w-3 h-3" fill="white">
              <path d="M78 175.3 L233 54.5 L245 72.1 L90 192.9 Z" />
              <path d="M78 245.2 L198.4 151.3 L211.6 168.1 L90 262.9 Z" />
              <path d="M104 301 L253.2 184.6 L266.4 201.4 L116 318.6 Z" />
            </svg>
          </div>
          <span className="text-xs font-semibold tracking-wide text-gray-200">Sentra Prompt</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10 font-mono">
            {profile ? profile.toUpperCase() : 'DEFAULT'}
          </span>
        </div>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`p-1 rounded-md text-xs transition-colors duration-200 ${
            showOptions ? 'bg-white/10 text-purple-300' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
          title="Toggle settings"
        >
          ⚙️
        </button>
      </div>

      {/* Main Floating Card (Matching Reference Design) */}
      <div className="relative rounded-2xl bg-[#181B24] border border-white/10 p-3.5 shadow-xl flex flex-col gap-3 transition-all duration-300 hover:border-purple-500/30 focus-within:border-purple-500/50">
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === 'transform' ? 'What do you want to transform today?' : 'What do you want to optimize today?'}
          rows={2}
          className="w-full bg-transparent text-[#F2F4F7] text-sm placeholder:text-gray-400 resize-none outline-none leading-relaxed font-sans"
        />

        {/* Bottom Control Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Quick Action Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Mode Chip */}
            <button
              onClick={() => setMode(mode === 'transform' ? 'optimize' : 'transform')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all duration-200 active:scale-95"
            >
              <span>{mode === 'transform' ? '✨' : '⚡'}</span>
              <span className="capitalize">{mode}</span>
            </button>

            {/* Profile Cycle Chip */}
            <button
              onClick={() => {
                const currentIndex = profiles.findIndex((p) => p.id === profile);
                const nextIndex = (currentIndex + 1) % profiles.length;
                setProfile(profiles[nextIndex].id);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all duration-200 active:scale-95"
            >
              <span>{profiles.find((p) => p.id === profile)?.icon}</span>
              <span>{profiles.find((p) => p.id === profile)?.label}</span>
            </button>

            {/* Style / Mode Chip */}
            <button
              onClick={() => {
                const currentIndex = modes.findIndex((m) => m.id === transformMode);
                const nextIndex = (currentIndex + 1) % modes.length;
                setTransformMode(modes[nextIndex].id);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all duration-200 active:scale-95"
            >
              <span className="text-gray-400">Style:</span>
              <span className="capitalize">{transformMode}</span>
            </button>
          </div>

          {/* Purple/Blue Gradient Action Button (Matches Image) */}
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !prompt.trim()}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-violet-400 flex items-center justify-center text-white shadow-md shadow-purple-500/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 shrink-0"
            title="Transform Prompt (Enter)"
          >
            {isProcessing ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Options Drawer */}
      {showOptions && (
        <div className="rounded-xl bg-[#141720] border border-white/10 p-3 flex flex-col gap-2 animate-fadeIn text-xs">
          <div className="flex items-center justify-between text-gray-400 pb-1 border-b border-white/5">
            <span>Settings & Effort</span>
            <span className="font-mono text-[10px]">CTE v2</span>
          </div>

          {/* Effort Switch */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Effort:</span>
            <div className="flex gap-1">
              {(['low', 'medium', 'high', 'xhigh', 'max'] as EffortLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setEffort(lvl)}
                  className={`px-2 py-0.5 rounded text-[11px] uppercase font-mono transition-colors ${
                    effort === lvl ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'bg-white/5 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result Display Section */}
      {showResult && (
        <div className="rounded-2xl bg-[#141720] border border-white/10 p-3.5 flex flex-col gap-2.5 animate-fadeIn shadow-lg">
          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-gray-200">Super Prompt Result</span>
              <span className="text-[10px] text-gray-400 font-mono">~{tokensEstimate} tokens</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-medium transition-all duration-200 active:scale-95"
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button
                onClick={handleClear}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 text-xs transition-colors"
                title="Clear output"
              >
                ✕
              </button>
            </div>
          </div>

          <pre className="max-h-[260px] overflow-y-auto text-xs leading-relaxed text-gray-200 font-mono whitespace-pre-wrap break-words bg-[#0D0F14]/70 p-2.5 rounded-xl border border-white/5">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
