import type { CompilerProfile } from '../schemas'
import type { CompilerOptions, CompilerProfileHandler } from './types'
import { claudeCompiler } from './claude'
import { codexCompiler } from './codex'
import { geminiCompiler } from './gemini'
import { grokCompiler } from './grok'

export * from './types'
export * from './claude'
export * from './codex'
export * from './gemini'
export * from './grok'

const COMPILER_PROFILES: Record<CompilerProfile, CompilerProfileHandler> = {
  claude: claudeCompiler,
  codex: codexCompiler,
  gemini: geminiCompiler,
  grok: grokCompiler,
}

export function hasCompilerProfile(profile?: string): profile is CompilerProfile {
  return typeof profile === 'string' && profile in COMPILER_PROFILES
}

export function compileProfilePrompt(
  profile: CompilerProfile,
  options: CompilerOptions
): string {
  const handler = COMPILER_PROFILES[profile]
  if (!handler) {
    throw new Error(`Unknown compiler profile: ${profile}`)
  }
  return handler.compile(options)
}
