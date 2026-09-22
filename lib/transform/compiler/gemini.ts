import { buildCommonConstraints, bulletLines } from './shared'
import type { CompilerOptions, CompilerProfileHandler } from './types'

export const geminiCompiler: CompilerProfileHandler = {
  compile(options: CompilerOptions): string {
    return [
      '## System instruction',
      `Act as ${options.persona.role}. Follow the requested output format exactly.`,
      '',
      '## Context',
      `- Intent: ${options.intent}`,
      `- Audience: ${options.locale === 'id' ? 'Indonesia' : 'International'}`,
      `- Style: ${options.persona.style}`,
      '',
      '## Task',
      options.prompt,
      '',
      '## Constraints',
      ...bulletLines(buildCommonConstraints(options)),
      '',
      '## Output schema',
      '1. Direct answer',
      '2. Assumptions, only if required',
      '3. Verification or next action when applicable',
    ].join('\n')
  },
}
