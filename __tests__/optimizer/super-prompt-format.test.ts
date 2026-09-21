import { describe, expect, it } from 'vitest'

import { parseSuperPromptJson } from '@/lib/optimizer/super-prompt-format'

describe('parseSuperPromptJson', () => {
  it('builds the approach section from reasoningApproach when fullPrompt is absent', () => {
    const result = parseSuperPromptJson(
      JSON.stringify({
        role: 'Senior systems designer',
        task: 'Turn a rough prompt into a structured brief',
        context: 'Internal desktop operator workflow',
        reasoningApproach: 'Compare constraints before proposing output.',
        constraints: ['Keep the response concise'],
        formatSpec: 'Markdown sections',
      })
    )

    expect(result.chainOfThought).toBe('Compare constraints before proposing output.')
    expect(result.fullPrompt).toContain('## Approach')
    expect(result.fullPrompt).toContain('Compare constraints before proposing output.')
  })
})
