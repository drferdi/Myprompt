import { buildCommonConstraints, bulletLines, escapeXmlText } from './shared'
import type { CompilerOptions, CompilerProfileHandler } from './types'

export const claudeCompiler: CompilerProfileHandler = {
  compile(options: CompilerOptions): string {
    return [
      '<instructions>',
      `- Act as: ${options.persona.role}`,
      `- Intent: ${options.intent}`,
      `- Style: ${options.persona.style}`,
      '</instructions>',
      '<context>',
      `- Audience: ${options.locale === 'id' ? 'Indonesia' : 'International'}`,
      `- Creativity: ${options.temperature}`,
      '</context>',
      '<task>',
      escapeXmlText(options.prompt),
      '</task>',
      '<constraints>',
      ...bulletLines(buildCommonConstraints(options)),
      '</constraints>',
      '<output_format>',
      'Return the requested deliverable with clear headings and only the necessary assumptions.',
      '</output_format>',
    ].join('\n')
  },
}
