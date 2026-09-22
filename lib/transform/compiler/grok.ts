import { buildCommonConstraints, bulletLines } from './shared'
import type { CompilerOptions, CompilerProfileHandler } from './types'

export const grokCompiler: CompilerProfileHandler = {
  compile(options: CompilerOptions): string {
    return [
      '## Objective',
      options.prompt,
      '',
      '## Context',
      `- Role: ${options.persona.role}`,
      `- Intent: ${options.intent}`,
      `- Audience: ${options.locale === 'id' ? 'Indonesia' : 'International'}`,
      '',
      '## Evidence and uncertainty',
      '- Separate provided facts from assumptions.',
      '- Identify uncertainty instead of presenting an unsupported claim as fact.',
      '',
      '## Constraints',
      ...bulletLines(buildCommonConstraints(options)),
      '',
      '## Output',
      'Provide a direct answer, followed by evidence-based rationale and concrete next actions.',
    ].join('\n')
  },
}
