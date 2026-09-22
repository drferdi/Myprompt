interface QuickActionsProps {
  onLibrary: () => void;
  onTemplates: () => void;
  onClear: () => void;
  hasResult: boolean;
}

export function QuickActions({ onLibrary, onTemplates, onClear, hasResult }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <ActionChip icon="library" label="Library" onClick={onLibrary} />
      <ActionChip icon="templates" label="Templates" onClick={onTemplates} />
      <div className="flex-1" />
      {hasResult && (
        <button
          onClick={onClear}
          className="text-[10px] text-text-muted hover:text-text-secondary px-2 py-1 rounded-md hover:bg-card transition-all duration-200"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function ActionChip({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-card-border text-[11px] text-text-secondary hover:text-text-primary hover:border-accent/20 hover:bg-card-hover active:scale-[0.97] transition-all duration-200"
    >
      {icon === 'library' && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      )}
      {icon === 'templates' && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      )}
      {label}
    </button>
  );
}
