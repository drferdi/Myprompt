interface ResultDisplayProps {
  result: string;
  tokensEstimate: number;
  onCopy: () => void;
  copied: boolean;
}

export function ResultDisplay({ result, tokensEstimate, onCopy, copied }: ResultDisplayProps) {
  return (
    <div className="px-4 pb-3">
      <div className="bg-card rounded-xl border border-card-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-card-border">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
            <span className="text-[10px] font-medium text-text-secondary">Result</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-mono">~{tokensEstimate} tokens</span>
            <button
              onClick={onCopy}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-accent/10 text-accent hover:bg-accent/20 active:scale-95 transition-all duration-200"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[240px] overflow-y-auto">
          <pre className="px-3 py-2.5 text-[11px] leading-relaxed text-text-primary/90 font-mono whitespace-pre-wrap break-words">
            {result}
          </pre>
        </div>
      </div>
    </div>
  );
}
