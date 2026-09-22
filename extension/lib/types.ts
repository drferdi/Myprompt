// Self-contained type definitions (ported from desktop product-surface)
// No imports from parent capsule to maintain extension independence

export type TransformMode = 'professional' | 'creative' | 'technical' | 'academic' | 'casual';
export type CompilerProfile = 'claude' | 'codex' | 'gemini' | 'grok';
export type EffortLevel = 'low' | 'medium' | 'high' | 'xhigh' | 'max';
export type TransformTarget = 'general' | 'agent';
export type ModelId = 'openai-gpt4o' | 'claude-sonnet' | 'claude-opus' | 'mistral-large' | 'deepseek-v3';

export interface TransformRequest {
  prompt: string;
  model?: ModelId;
  mode?: TransformMode;
  temperature?: number;
  maxTokens?: number;
  locale?: 'id' | 'en';
  profile?: CompilerProfile;
  effort?: EffortLevel;
  target?: TransformTarget;
}

export interface TransformResult {
  transformedPrompt: string;
  tokensEstimate: number;
}
