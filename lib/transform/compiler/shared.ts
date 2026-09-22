import type { CompilerOptions } from './types'

export function escapeXmlText(value: string): string {
  return value.replace(/[<>&]/g, (character) => {
    switch (character) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      default:
        return '&amp;'
    }
  })
}

export function buildCommonConstraints(options: CompilerOptions): string[] {
  const constraints = [
    options.intentInstruction,
    `Keep the final response within approximately ${options.maxTokens} tokens.`,
    'Use direct, concrete language. Do not add unsolicited meta-commentary.',
  ]

  if (options.locale === 'id') {
    constraints.push('Write in clear, professional Bahasa Indonesia.')
  }

  if (options.intent === 'debugging' || options.target === 'agent') {
    constraints.push('Limit implementation changes to explicitly requested behavior and files.')
  }

  if (options.effort === 'xhigh' || options.effort === 'max') {
    constraints.push('Produce each requested deliverable exactly once. Return only the final deliverable.')
  }

  if (options.target === 'agent') {
    constraints.push('Batch independent inspection work in one response when tools are available.')
  }

  return constraints
}

export function bulletLines(items: readonly string[]): string[] {
  return items.map((item) => `- ${item}`)
}
