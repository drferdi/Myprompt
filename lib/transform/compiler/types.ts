import type { EffortLevel, TransformTarget, TransformMode } from '../schemas'

export interface CompilerOptions {
  prompt: string
  mode: TransformMode
  locale: 'id' | 'en'
  temperature: number
  maxTokens: number
  effort: EffortLevel
  target: TransformTarget
  intent: string
  intentInstruction: string
  persona: { role: string; style: string }
}

export interface CompilerProfileHandler {
  compile(options: CompilerOptions): string
}
