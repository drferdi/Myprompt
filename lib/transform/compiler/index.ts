import type { CompilerProfile } from '../schemas'
import type { CompilerOptions, CompilerProfileHandler } from './types'
import { fableCompiler } from './fable'
import { mythosCompiler } from './mythos'

export * from './types'
export * from './fable'
export * from './mythos'

const COMPILER_PROFILES: Record<CompilerProfile, CompilerProfileHandler> = {
  'claude-fable-5': fableCompiler,
  'claude-mythos-5': mythosCompiler,
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
