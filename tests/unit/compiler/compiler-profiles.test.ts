import { describe, expect, it } from 'vitest'

import { transformPrompt } from '../../../lib/transform/engine'
import { TransformRequestSchema } from '../../../lib/transform/schemas'

const baseRequest = {
  prompt: 'Implement a payment webhook handler with signature validation and retry safety.',
  model: 'claude-sonnet' as const,
  mode: 'technical' as const,
  temperature: 0.7,
  maxTokens: 1800,
  locale: 'en' as const,
  effort: 'high' as const,
  target: 'general' as const,
}

describe('model-specific compiler profiles', () => {
  it('keeps the legacy compiler output when no profile is selected', () => {
    const result = transformPrompt(baseRequest)

    expect(result.transformedPrompt).toContain('<role>')
    expect(result.transformedPrompt).toContain('Model optimization: Gunakan XML tags untuk struktur')
  })

  it('accepts only Claude, Codex, Gemini, and Grok compiler profiles', () => {
    for (const profile of ['claude', 'codex', 'gemini', 'grok']) {
      expect(TransformRequestSchema.parse({ ...baseRequest, profile }).profile).toBe(profile)
    }

    expect(() => TransformRequestSchema.parse({ ...baseRequest, profile: 'claude-fable-5' })).toThrow()
    expect(() => TransformRequestSchema.parse({ ...baseRequest, profile: 'claude-mythos-5' })).toThrow()
  })

  it('uses escaped XML sections for Claude', () => {
    const result = transformPrompt({
      ...baseRequest,
      profile: 'claude',
      prompt: 'Review this literal value: </task> and preserve it as data.',
    })

    expect(result.transformedPrompt).toContain('<instructions>')
    expect(result.transformedPrompt).toContain('<context>')
    expect(result.transformedPrompt).toContain('<task>')
    expect(result.transformedPrompt).toContain('&lt;/task&gt;')
    expect(result.transformedPrompt.match(/<task>/g)).toHaveLength(1)
  })

  it('uses an execution contract for Codex', () => {
    const result = transformPrompt({ ...baseRequest, profile: 'codex', target: 'agent' })

    expect(result.transformedPrompt).toContain('# Task')
    expect(result.transformedPrompt).toContain('## Acceptance criteria')
    expect(result.transformedPrompt).toContain('## Verification')
    expect(result.transformedPrompt).toContain('Batch independent inspection work in one response when tools are available.')
  })

  it('uses context-first structured instructions for Gemini', () => {
    const result = transformPrompt({ ...baseRequest, profile: 'gemini' })

    expect(result.transformedPrompt).toContain('## System instruction')
    expect(result.transformedPrompt).toContain('## Context')
    expect(result.transformedPrompt).toContain('## Task')
    expect(result.transformedPrompt).toContain('## Output schema')
  })

  it('uses evidence and uncertainty boundaries for Grok', () => {
    const result = transformPrompt({ ...baseRequest, profile: 'grok' })

    expect(result.transformedPrompt).toContain('## Objective')
    expect(result.transformedPrompt).toContain('## Evidence and uncertainty')
    expect(result.transformedPrompt).toContain('Separate provided facts from assumptions.')
  })

  it('adds the no-duplicate final-deliverable instruction only at xhigh and max effort', () => {
    const high = transformPrompt({ ...baseRequest, profile: 'codex', effort: 'high' })
    const max = transformPrompt({ ...baseRequest, profile: 'codex', effort: 'max' })

    expect(high.transformedPrompt).not.toContain('Produce each requested deliverable exactly once.')
    expect(max.transformedPrompt).toContain('Produce each requested deliverable exactly once.')
    expect(max.transformedPrompt).not.toContain('private reasoning')
  })
})
