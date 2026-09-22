import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/llm/provider-registry', () => ({
  getProvider: vi.fn(),
  getScopedProviderOverrides: vi.fn(() => ({})),
}))

import { getProvider } from '@/lib/llm/provider-registry'
import { optimizePrompt, optimizePromptStreaming } from '@/lib/optimizer/engine'
import { OptimizeResponseSchema } from '@/types'
import type { LLMResponse } from '@/types'
import type { OptimizeRequest } from '@/types'

const baseRequest: OptimizeRequest = {
  rawIdea: 'Build a landing page',
  taskType: 'CODING',
  tone: 'PROFESSIONAL',
  format: 'STRUCTURED',
  targetLlm: 'OPENAI',
  provider: 'OPENAI',
  optimizerLane: 'INTERACTIVE',
}

const VALID_MARKDOWN = [
  '## ROLE',
  'Senior engineer',
  '',
  '## TASK',
  'Build a landing page',
  '',
  '## CONTEXT',
  'Internal marketing site',
  '',
  '## CONSTRAINTS',
  '- Keep it accessible',
  '- Ship quickly',
  '',
  '## OUTPUT FORMAT',
  'Markdown sections',
].join('\n')

const UNPARSEABLE_TEXT = 'just some prose without headings'

function makeLlmResponse(content: string, finishReason = 'stop'): LLMResponse {
  return {
    content,
    model: 'fake-model',
    tokensUsed: 42,
    finishReason,
  }
}

function makeFakeProvider(opts: {
  generateResults?: string[]
  generateFinishReasons?: string[]
  streamContent?: string
}) {
  const generateResults = opts.generateResults ?? []
  const generateFinishReasons = opts.generateFinishReasons ?? []
  let generateCallCount = 0
  let generateStreamCallCount = 0

  return {
    activeModel: 'fake-model',
    defaultModel: 'fake-model',
    name: 'OPENAI',
    generate: vi.fn(async () => {
      const idx = generateCallCount
      generateCallCount += 1
      return makeLlmResponse(
        generateResults[idx] ?? generateResults[generateResults.length - 1] ?? '',
        generateFinishReasons[idx] ?? generateFinishReasons[generateFinishReasons.length - 1] ?? 'stop'
      )
    }),
    generateStream: vi.fn(async function* () {
      generateStreamCallCount += 1
      yield opts.streamContent ?? ''
    }),
    validateApiKey: vi.fn(async () => true),
    get generateCallCount() {
      return generateCallCount
    },
    get generateStreamCallCount() {
      return generateStreamCallCount
    },
  }
}

describe('optimizer quality metadata', () => {
  beforeEach(() => {
    vi.mocked(getProvider).mockReset()
  })

  it('optimizePrompt: unparseable text yields degraded quality with attempts=1', async () => {
    const fake = makeFakeProvider({
      generateResults: [UNPARSEABLE_TEXT],
      generateFinishReasons: ['stop'],
    })
    vi.mocked(getProvider).mockReturnValue(fake as never)

    const response = await optimizePrompt({ ...baseRequest, outputKind: 'SUPER_PROMPT' })

    expect(response.metadata.quality).toEqual({
      complete: false,
      degraded: true,
      reason: 'parse_failed',
      attempts: 1,
    })
    expect(response.superPrompt.fullPrompt).toBe(UNPARSEABLE_TEXT)
    expect(OptimizeResponseSchema.parse(response)).toBeTruthy()
  })

  it('optimizePrompt: valid Super Prompt markdown yields complete quality with attempts=1', async () => {
    const fake = makeFakeProvider({
      generateResults: [VALID_MARKDOWN],
      generateFinishReasons: ['stop'],
    })
    vi.mocked(getProvider).mockReturnValue(fake as never)

    const response = await optimizePrompt({ ...baseRequest, outputKind: 'SUPER_PROMPT' })

    expect(response.metadata.quality).toEqual({
      complete: true,
      degraded: false,
      attempts: 1,
    })
    expect(response.metadata.quality?.reason).toBeUndefined()
    expect(OptimizeResponseSchema.parse(response)).toBeTruthy()
  })

  it('optimizePromptStreaming: unparseable stream + unparseable recovery yields degraded quality with attempts=2', async () => {
    const fake = makeFakeProvider({
      streamContent: UNPARSEABLE_TEXT,
      generateResults: [UNPARSEABLE_TEXT],
      generateFinishReasons: ['stop'],
    })
    vi.mocked(getProvider).mockReturnValue(fake as never)

    const response = await optimizePromptStreaming({ ...baseRequest, outputKind: 'SUPER_PROMPT' }, () => undefined)

    expect(response.metadata.quality).toEqual({
      complete: false,
      degraded: true,
      reason: 'parse_failed',
      attempts: 2,
    })
    expect(fake.generate).toHaveBeenCalledTimes(1)
    expect(fake.generateStream).toHaveBeenCalledTimes(1)
  })

  it('optimizePromptStreaming: valid streamed markdown yields complete quality with attempts=1', async () => {
    const fake = makeFakeProvider({
      streamContent: VALID_MARKDOWN,
    })
    vi.mocked(getProvider).mockReturnValue(fake as never)

    const response = await optimizePromptStreaming({ ...baseRequest, outputKind: 'SUPER_PROMPT' }, () => undefined)

    expect(response.metadata.quality).toEqual({
      complete: true,
      degraded: false,
      attempts: 1,
    })
  })

  it('optimizePromptStreaming: unparseable stream but valid recovery yields complete quality with attempts=2', async () => {
    const fake = makeFakeProvider({
      streamContent: UNPARSEABLE_TEXT,
      generateResults: [VALID_MARKDOWN],
      generateFinishReasons: ['stop'],
    })
    vi.mocked(getProvider).mockReturnValue(fake as never)

    const response = await optimizePromptStreaming({ ...baseRequest, outputKind: 'SUPER_PROMPT' }, () => undefined)

    expect(response.metadata.quality).toEqual({
      complete: true,
      degraded: false,
      attempts: 2,
    })
  })
})
