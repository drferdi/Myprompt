import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/llm/provider-registry', () => ({
  getProvider: vi.fn(),
  getScopedProviderOverrides: vi.fn(() => ({})),
}))

import { getProvider } from '@/lib/llm/provider-registry'
import {
  buildCodingBriefSystemPrompt,
  buildCodingBriefUserPrompt,
} from '@/lib/llm/prompt-builder'
import { optimizePrompt, optimizePromptStreaming } from '@/lib/optimizer/engine'
import { CODING_BRIEF_REPORT_TEXT } from '@/lib/prompt-quality/contract'
import { OptimizeResponseSchema } from '@/types'
import type { LLMRequest, LLMResponse, OptimizeRequest } from '@/types'

const codingRequest: OptimizeRequest = {
  rawIdea: 'Warn me when the optimized prompt looks incomplete',
  taskType: 'CODING',
  tone: 'PROFESSIONAL',
  format: 'STRUCTURED',
  targetLlm: 'OPENAI',
  provider: 'OPENAI',
  optimizerLane: 'INTERACTIVE',
}

const VALID_BRIEF = [
  '## GOAL',
  'Show a clear warning when a generated prompt is incomplete.',
  '',
  '## WHERE',
  'Explore first: the screen that displays the optimized prompt result.',
  '',
  '## DONE WHEN',
  'Propose a check first: an incomplete result visibly shows a warning; a complete result shows none.',
].join('\n')

const WRONG_REPORT_TEXT = '- Trust the agent and skip the evidence.'

const BRIEF_WITH_WRONG_REPORT = [VALID_BRIEF, '', '## REPORT', WRONG_REPORT_TEXT].join('\n')

const VAGUE_BRIEF = [
  '## GOAL',
  'Show a clear warning when a generated prompt is incomplete.',
  '',
  '## WHERE',
  'Explore first: the screen that displays the optimized prompt result.',
  '',
  '## DONE WHEN',
  'Login works well.',
].join('\n')

const VALID_SUPER_PROMPT = [
  '## ROLE',
  'Senior communications specialist',
  '',
  '## TASK',
  'Draft a follow-up email',
  '',
  '## CONTEXT',
  'Internal stakeholder update',
  '',
  '## CONSTRAINTS',
  '- Keep it under 150 words',
  '',
  '## OUTPUT FORMAT',
  'Plain email body',
].join('\n')

function makeLlmResponse(content: string): LLMResponse {
  return { content, model: 'fake-model', tokensUsed: 42, finishReason: 'stop' }
}

function makeFakeProvider(opts: {
  generateResults?: string[]
  streamContent?: string
  events?: string[]
}) {
  const generateResults = opts.generateResults ?? []
  const generateRequests: LLMRequest[] = []
  const streamRequests: LLMRequest[] = []

  return {
    activeModel: 'fake-model',
    defaultModel: 'fake-model',
    name: 'OPENAI' as const,
    generateRequests,
    streamRequests,
    generate: vi.fn(async (request: LLMRequest) => {
      opts.events?.push('generate')
      const index = generateRequests.length
      generateRequests.push(request)
      return makeLlmResponse(
        generateResults[index] ?? generateResults[generateResults.length - 1] ?? ''
      )
    }),
    generateStream: vi.fn(async function* (request: LLMRequest) {
      opts.events?.push('generateStream')
      streamRequests.push(request)
      yield opts.streamContent ?? ''
    }),
    validateApiKey: vi.fn(async () => true),
  }
}

function countReportHeadings(markdown: string): number {
  return (markdown.match(/^##[ \t]+REPORT[ \t]*$/gm) ?? []).length
}

describe('coding brief generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a validated coding brief and appends the canonical REPORT (a)', async () => {
    const provider = makeFakeProvider({ generateResults: [VALID_BRIEF] })
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt(codingRequest)

    expect(response.codingBrief).toBeDefined()
    expect(response.codingBrief?.goal).toBe(
      'Show a clear warning when a generated prompt is incomplete.'
    )
    expect(response.metadata.quality).toEqual({
      complete: true,
      degraded: false,
      attempts: 1,
    })
    expect(response.metadata.outputKind).toBe('CODING_BRIEF')
    expect(countReportHeadings(response.superPrompt.fullPrompt)).toBe(1)
    expect(response.superPrompt.fullPrompt).toContain(CODING_BRIEF_REPORT_TEXT)
    expect(response.superPrompt.role).toBe('')
    expect(OptimizeResponseSchema.parse(response)).toBeTruthy()
  })

  it('replaces a wrong REPORT section emitted by the model (b)', async () => {
    const provider = makeFakeProvider({ generateResults: [BRIEF_WITH_WRONG_REPORT] })
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt(codingRequest)

    expect(countReportHeadings(response.superPrompt.fullPrompt)).toBe(1)
    expect(response.superPrompt.fullPrompt).toContain(CODING_BRIEF_REPORT_TEXT)
    expect(response.superPrompt.fullPrompt).not.toContain(WRONG_REPORT_TEXT)
    expect(response.metadata.quality).toEqual({
      complete: true,
      degraded: false,
      attempts: 1,
    })
  })

  it('repairs an invalid brief exactly once and reports the issue ids (c)', async () => {
    const provider = makeFakeProvider({ generateResults: [VAGUE_BRIEF, VALID_BRIEF] })
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt(codingRequest)

    expect(provider.generate).toHaveBeenCalledTimes(2)
    expect(response.metadata.quality).toEqual({
      complete: true,
      degraded: false,
      attempts: 2,
    })
    expect(provider.generateRequests[1].userPrompt).toContain('V7')
    expect(response.codingBrief).toBeDefined()
  })

  it('marks a still-invalid repair as degraded (d)', async () => {
    const provider = makeFakeProvider({ generateResults: [VAGUE_BRIEF, VAGUE_BRIEF] })
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt(codingRequest)

    expect(response.metadata.quality).toEqual({
      complete: false,
      degraded: true,
      reason: 'invalid_brief',
      attempts: 2,
    })
    expect(response.codingBrief).toBeUndefined()
    expect(response.superPrompt.fullPrompt).toContain('Login works well.')
    expect(countReportHeadings(response.superPrompt.fullPrompt)).toBe(1)
    expect(response.superPrompt.fullPrompt).toContain(CODING_BRIEF_REPORT_TEXT)
    expect(OptimizeResponseSchema.parse(response)).toBeTruthy()
  })

  it('never carries Optimizer settings labels into the brief prompts (e)', () => {
    const userPrompt = buildCodingBriefUserPrompt({ rawIdea: codingRequest.rawIdea })
    for (const label of ['Target LLM:', 'Domain:', 'Tone:']) {
      expect(userPrompt).not.toContain(label)
    }

    const systemLines = buildCodingBriefSystemPrompt().split('\n')
    for (const line of systemLines) {
      const trimmed = line.trim()
      for (const label of ['Target LLM:', 'Domain:', 'Tone:']) {
        expect(trimmed.startsWith(label)).toBe(false)
      }
    }
  })

  it('leaves non-coding requests on the Super Prompt route (f)', async () => {
    const provider = makeFakeProvider({ generateResults: [VALID_SUPER_PROMPT] })
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt({ ...codingRequest, taskType: 'EMAIL' })

    expect(response.superPrompt.role).not.toBe('')
    expect(response.codingBrief).toBeUndefined()
    expect(response.metadata.outputKind).toBe('SUPER_PROMPT')
    expect(provider.generateRequests[0].systemPrompt).toContain('## ROLE')
  })

  it('streams the first attempt and signals onRepair before the repair call (g)', async () => {
    const events: string[] = []
    const provider = makeFakeProvider({
      streamContent: VAGUE_BRIEF,
      generateResults: [VALID_BRIEF],
      events,
    })
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const chunks: string[] = []
    const onRepair = vi.fn(() => {
      events.push('repair')
    })

    const response = await optimizePromptStreaming(
      codingRequest,
      (delta) => chunks.push(delta),
      { onRepair }
    )

    expect(provider.generateStream).toHaveBeenCalledTimes(1)
    expect(provider.generate).toHaveBeenCalledTimes(1)
    expect(onRepair).toHaveBeenCalledTimes(1)
    expect(events).toEqual(['generateStream', 'repair', 'generate'])
    expect(chunks.join('')).toBe(VAGUE_BRIEF)
    expect(response.metadata.quality).toEqual({
      complete: true,
      degraded: false,
      attempts: 2,
    })
    expect(response.metadata.outputKind).toBe('CODING_BRIEF')
    expect(OptimizeResponseSchema.parse(response)).toBeTruthy()
  })

  it('keeps the two-argument streaming signature working (g)', async () => {
    const provider = makeFakeProvider({ streamContent: VALID_BRIEF })
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePromptStreaming(codingRequest, () => {})

    expect(response.codingBrief).toBeDefined()
    expect(response.metadata.quality).toEqual({
      complete: true,
      degraded: false,
      attempts: 1,
    })
  })

  describe('quality reasons on the CODING_BRIEF route', () => {
    it('unparseable output on both attempts yields degraded, reason parse_failed', async () => {
      const provider = makeFakeProvider({
        generateResults: ['just some prose without any headings', 'still no headings here'],
      })
      vi.mocked(getProvider).mockReturnValue(provider as never)

      const response = await optimizePrompt(codingRequest)

      expect(provider.generate).toHaveBeenCalledTimes(2)
      expect(response.metadata.quality).toEqual({
        complete: false,
        degraded: true,
        reason: 'parse_failed',
        attempts: 2,
      })
      expect(response.codingBrief).toBeUndefined()
      expect(OptimizeResponseSchema.parse(response)).toBeTruthy()
    })

    it('parsed but invalid after one repair yields degraded, reason invalid_brief', async () => {
      const provider = makeFakeProvider({ generateResults: [VAGUE_BRIEF, VAGUE_BRIEF] })
      vi.mocked(getProvider).mockReturnValue(provider as never)

      const response = await optimizePrompt(codingRequest)

      expect(response.metadata.quality).toEqual({
        complete: false,
        degraded: true,
        reason: 'invalid_brief',
        attempts: 2,
      })
    })

    it('unparseable first attempt repaired into a valid brief yields complete, attempts 2', async () => {
      const provider = makeFakeProvider({
        generateResults: ['just some prose without any headings', VALID_BRIEF],
      })
      vi.mocked(getProvider).mockReturnValue(provider as never)

      const response = await optimizePrompt(codingRequest)

      expect(response.metadata.quality).toEqual({
        complete: true,
        degraded: false,
        attempts: 2,
      })
      expect(response.codingBrief).toBeDefined()
    })

    it('valid brief yields complete, attempts 1', async () => {
      const provider = makeFakeProvider({ generateResults: [VALID_BRIEF] })
      vi.mocked(getProvider).mockReturnValue(provider as never)

      const response = await optimizePrompt(codingRequest)

      expect(response.metadata.quality).toEqual({
        complete: true,
        degraded: false,
        attempts: 1,
      })
      expect(response.metadata.quality?.reason).toBeUndefined()
    })
  })

  describe('output kind routing', () => {
    const cases: Array<{
      name: string
      request: OptimizeRequest
      expected: 'SUPER_PROMPT' | 'CODING_BRIEF'
    }> = [
      {
        name: 'taskType CODING without outputKind routes to CODING_BRIEF',
        request: { ...codingRequest },
        expected: 'CODING_BRIEF',
      },
      {
        name: 'taskType GENERAL without outputKind routes to SUPER_PROMPT',
        request: { ...codingRequest, taskType: 'GENERAL' },
        expected: 'SUPER_PROMPT',
      },
      {
        name: 'taskType CODING with explicit SUPER_PROMPT routes to SUPER_PROMPT',
        request: { ...codingRequest, outputKind: 'SUPER_PROMPT' },
        expected: 'SUPER_PROMPT',
      },
      {
        name: 'taskType GENERAL with explicit CODING_BRIEF routes to CODING_BRIEF',
        request: { ...codingRequest, taskType: 'GENERAL', outputKind: 'CODING_BRIEF' },
        expected: 'CODING_BRIEF',
      },
    ]

    for (const { name, request, expected } of cases) {
      it(name, async () => {
        const provider = makeFakeProvider({
          generateResults: [expected === 'CODING_BRIEF' ? VALID_BRIEF : VALID_SUPER_PROMPT],
        })
        vi.mocked(getProvider).mockReturnValue(provider as never)

        const response = await optimizePrompt(request)

        expect(response.metadata.outputKind).toBe(expected)
        expect(provider.generateRequests[0].systemPrompt).toContain(
          expected === 'CODING_BRIEF' ? '## GOAL' : '## ROLE'
        )
        expect(response.codingBrief === undefined).toBe(expected === 'SUPER_PROMPT')
      })
    }
  })

  it('honours an explicit SUPER_PROMPT outputKind for a CODING request (h)', async () => {
    const provider = makeFakeProvider({ generateResults: [VALID_SUPER_PROMPT] })
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt({ ...codingRequest, outputKind: 'SUPER_PROMPT' })

    expect(response.superPrompt.role).not.toBe('')
    expect(response.codingBrief).toBeUndefined()
    expect(response.metadata.outputKind).toBe('SUPER_PROMPT')
  })
})
