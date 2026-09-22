import { forwardRef, useEffect, useRef, type KeyboardEvent } from 'react';

interface PromptBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  placeholder?: string;
}

export const PromptBar = forwardRef<HTMLTextAreaElement, PromptBarProps>(
  ({ value, onChange, onSubmit, isProcessing, placeholder }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Auto-resize textarea
    useEffect(() => {
      const el = textareaRef.current;
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
      }
    }, [value]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
    };

    return (
      <div className="relative group">
        <div className="relative bg-card rounded-xl border border-card-border hover:border-accent/30 focus-within:border-accent/50 transition-all duration-300">
          {/* Subtle glow on focus */}
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isProcessing}
            className="w-full bg-transparent text-text-primary text-sm placeholder:text-text-muted px-4 py-3 pr-12 resize-none outline-none disabled:opacity-50 transition-opacity duration-200"
          />

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={isProcessing || !value.trim() || value.trim().length < 10}
            className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center disabled:opacity-30 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-accent/20 disabled:shadow-none"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }
);

PromptBar.displayName = 'PromptBar';
