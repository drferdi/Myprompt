import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/llm/provider-registry', () => ({
  getProvider: vi.fn(),
  getScopedProviderOverrides: vi.fn(() => ({})),
}))

import { getProvider, getScopedProviderOverrides } from '@/lib/llm/provider-registry'
import { optimizePrompt, optimizePromptStreaming } from '@/lib/optimizer/engine'
import { DesktopRecentRunInputSchema, OptimizeResponseSchema } from '@/types'
import type { LLMRequest, OptimizeRequest } from '@/types'

const templateRequest: OptimizeRequest = {
  rawIdea: 'Draft an email responding to a customer complaint ($& refund)',
  taskType: 'EMAIL',
  tone: 'PROFESSIONAL',
  format: 'STRUCTURED',
  targetLlm: 'CLAUDE',
  provider: 'CLAUDE',
  optimizerLane: 'INTERACTIVE',
  outputKind: 'PROMPT_TEMPLATE',
}

const METAPROMPT_RESPONSE = `<Inputs>
{$CUSTOMER_EMAIL}
</Inputs>
<Instructions Structure>
Email first, then directions.
</Instructions Structure>
<Instructions>
<customer_email>
{$CUSTOMER_EMAIL}
</customer_email>
Write a polite reply inside <reply> tags.
</Instructions>`

function makeFakeProvider(content: string, finishReason = 'end_turn') {
  const requests: LLMRequest[] = []
  return {
    activeModel: 'fake-model',
    defaultModel: 'fake-model',
    name: 'CLAUDE' as const,
    requests,
    generate: vi.fn(async (request: LLMRequest) => {
      requests.push(request)
      return { content, model: 'fake-model', tokensUsed: 42, finishReason }
    }),
    generateStream: vi.fn(async function* (request: LLMRequest) {
      requests.push(request)
      yield content
    }),
    validateApiKey: vi.fn(async () => true),
  }
}

describe('prompt template generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the extracted template with its {$VAR} placeholders and variables', async () => {
    const provider = makeFakeProvider(METAPROMPT_RESPONSE)
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt(templateRequest)

    expect(response.superPrompt.fullPrompt).toBe(
      '<customer_email>\n{$CUSTOMER_EMAIL}\n</customer_email>\nWrite a polite reply inside <reply> tags.'
    )
    expect(response.promptTemplate).toEqual({ variables: ['$CUSTOMER_EMAIL'] })
    expect(response.metadata.outputKind).toBe('PROMPT_TEMPLATE')
    expect(response.metadata.quality).toEqual({ complete: true, degraded: false, attempts: 1 })
    expect(OptimizeResponseSchema.safeParse(response).success).toBe(true)
  })

  it('sends the Metaprompt with the raw idea inserted literally, on the DEEP scope', async () => {
    const provider = makeFakeProvider(METAPROMPT_RESPONSE)
    vi.mocked(getProvider).mockReturnValue(provider as never)

    await optimizePrompt(templateRequest)

    const [request] = provider.requests
    expect(request.userPrompt).toContain(`<Task>\n${templateRequest.rawIdea}\n</Task>`)
    expect(request.userPrompt).toMatch(/Start your response directly with the <Inputs> block\.[^]*$/)
    expect(request.maxTokens).toBe(4096)
    expect(getScopedProviderOverrides).toHaveBeenCalledWith('CLAUDE', 'OPTIMIZER', 'DEEP')
  })

  it('sends no system prompt and temperature 0, like the notebook call', async () => {
    const provider = makeFakeProvider(METAPROMPT_RESPONSE)
    vi.mocked(getProvider).mockReturnValue(provider as never)

    await optimizePrompt(templateRequest)

    const [request] = provider.requests
    expect(request.systemPrompt).toBe('')
    expect(request.temperature).toBe(0)
  })

  it('fails fast when the response hit the token limit', async () => {
    for (const finishReason of ['max_tokens', 'length']) {
      vi.mocked(getProvider).mockReturnValue(
        makeFakeProvider(METAPROMPT_RESPONSE, finishReason) as never
      )

      await expect(optimizePrompt(templateRequest)).rejects.toThrow(
        'The response hit MAX_TOKENS before the prompt template was complete.'
      )
    }
  })

  it('streams, then fails fast on a response without a closed Instructions block', async () => {
    const provider = makeFakeProvider('<Inputs>\n{$X}\n</Inputs>\n<Instructions>\nCut off')
    vi.mocked(getProvider).mockReturnValue(provider as never)
    const chunks: string[] = []

    await expect(
      optimizePromptStreaming(templateRequest, (delta) => chunks.push(delta))
    ).rejects.toThrow('No <Instructions> block found in the response.')
    expect(chunks.join('')).toContain('Cut off')
  })

  it('lets the desktop recent-run store keep a Prompt Template run', () => {
    const record = {
      id: 'run-1',
      sourceMode: 'optimize',
      rawInput: 'x',
      outputText: 'template body',
      outputKind: 'PROMPT_TEMPLATE',
    }

    expect(DesktopRecentRunInputSchema.safeParse(record).success).toBe(true)
  })

  it('pins user-chosen variables with the notebook steering, and only then', async () => {
    const provider = makeFakeProvider(METAPROMPT_RESPONSE)
    vi.mocked(getProvider).mockReturnValue(provider as never)

    await optimizePrompt({ ...templateRequest, rawIdea: '[CUSTOMER_EMAIL, company] Balas email' })
    await optimizePrompt(templateRequest)

    const [pinned, free] = provider.requests
    expect(pinned.userPrompt).toContain('<Task>\nBalas email\n</Task>')
    expect(pinned.userPrompt).toContain(
      'must use exactly these input variables and no others: {$CUSTOMER_EMAIL}, {$COMPANY}.'
    )
    expect(free.userPrompt).not.toContain('must use exactly these input variables')
  })
})
