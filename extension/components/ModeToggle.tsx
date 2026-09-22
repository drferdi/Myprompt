interface ModeToggleProps {
  mode: 'transform' | 'optimize';
  onModeChange: (mode: 'transform' | 'optimize') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex gap-1 p-0.5 bg-card rounded-lg border border-card-border">
      <button
        onClick={() => onModeChange('transform')}
        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-250 ${
          mode === 'transform'
            ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-white shadow-sm border border-accent/20'
            : 'text-text-muted hover:text-text-secondary'
        }`}
      >
        <span className="flex items-center justify-center gap-1.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          Transform
        </span>
      </button>
      <button
        onClick={() => onModeChange('optimize')}
        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-250 ${
          mode === 'optimize'
            ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-white shadow-sm border border-accent/20'
            : 'text-text-muted hover:text-text-secondary'
        }`}
      >
        <span className="flex items-center justify-center gap-1.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Optimizer
        </span>
      </button>
    </div>
  );
}
