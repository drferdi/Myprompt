import { buildCommonConstraints, bulletLines } from './shared'
import type { CompilerOptions, CompilerProfileHandler } from './types'

export const codexCompiler: CompilerProfileHandler = {
  compile(options: CompilerOptions): string {
    return [
      '# Task',
      options.prompt,
      '',
      '## Repository context',
      `- Role: ${options.persona.role}`,
      `- Intent: ${options.intent}`,
      `- Style: ${options.persona.style}`,
      '',
      '## Constraints',
      ...bulletLines(buildCommonConstraints(options)),
      '',
      '## Acceptance criteria',
      '- Satisfy the requested behavior without unrelated changes.',
      '- State assumptions only when the task lacks required information.',
      '',
      '## Verification',
      '- Name the focused checks that demonstrate the requested behavior.',
      '- Report only results supported by executed evidence.',
    ].join('\n')
  },
}
