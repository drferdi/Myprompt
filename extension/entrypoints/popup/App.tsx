import { useState, useRef, useCallback } from 'react';
import { PromptBar } from '../../components/PromptBar';
import { ModeToggle } from '../../components/ModeToggle';
import { QuickActions } from '../../components/QuickActions';
import { ResultDisplay } from '../../components/ResultDisplay';
import { SettingsPanel } from '../../components/SettingsPanel';
import { transformPrompt } from '../../lib/transform';
import type { TransformMode, CompilerProfile, EffortLevel } from '../../lib/types';

type AppMode = 'transform' | 'optimize';

export default function App() {
  const [mode, setMode] = useState<AppMode>('transform');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [tokensEstimate, setTokensEstimate] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings
  const [transformMode, setTransformMode] = useState<TransformMode>('professional');
  const [profile, setProfile] = useState<CompilerProfile | undefined>(undefined);
  const [effort, setEffort] = useState<EffortLevel>('high');

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || trimmed.length < 10 || isProcessing) return;

    setIsProcessing(true);
    setShowResult(false);

    // Small delay for smooth animation
    await new Promise((r) => setTimeout(r, 150));

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
    inputRef.current?.focus();
  }, []);

  return (
    <div className="w-full bg-deep text-text-primary font-sans flex flex-col pb-1">
      {/* Top glow line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
            <svg viewBox="0 0 363 363" className="w-3.5 h-3.5" fill="white">
              <path d="M78 175.3 L233 54.5 L245 72.1 L90 192.9 Z" />
              <path d="M78 245.2 L198.4 151.3 L211.6 168.1 L90 262.9 Z" />
              <path d="M104 301 L253.2 184.6 L266.4 201.4 L116 318.6 Z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">Sentra Prompt</span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-lg hover:bg-card transition-colors duration-200"
          title="Settings"
        >
          <svg className="w-4 h-4 text-text-muted hover:text-text-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="px-4 py-1.5">
        <ModeToggle mode={mode} onModeChange={setMode} />
      </div>

      {/* Settings Panel (collapsible) */}
      {showSettings && (
        <div className="animate-slide-down px-4 pb-2">
          <SettingsPanel
            transformMode={transformMode}
            onTransformModeChange={setTransformMode}
            profile={profile}
            onProfileChange={setProfile}
            effort={effort}
            onEffortChange={setEffort}
          />
        </div>
      )}

      {/* Prompt Bar */}
      <div className="px-4 py-2">
        <PromptBar
          ref={inputRef}
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
          placeholder={mode === 'transform' ? 'What do you want to transform today?' : 'What do you want to optimize today?'}
        />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2">
        <QuickActions
          onLibrary={() => {}}
          onTemplates={() => {}}
          onClear={handleClear}
          hasResult={showResult}
        />
      </div>

      {/* Result Display */}
      {showResult && (
        <div className="animate-slide-up">
          <ResultDisplay
            result={result}
            tokensEstimate={tokensEstimate}
            onCopy={handleCopy}
            copied={copied}
          />
        </div>
      )}

      {/* Bottom glow line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
    </div>
  );
}
