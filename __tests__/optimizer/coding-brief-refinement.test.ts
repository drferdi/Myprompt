import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/llm/provider-registry', () => ({
  getProvider: vi.fn(),
  getScopedProviderOverrides: vi.fn(() => ({})),
}))

import { getProvider } from '@/lib/llm/provider-registry'
import { buildCodingBriefSystemPrompt } from '@/lib/llm/prompt-builder'
import { optimizePrompt } from '@/lib/optimizer/engine'
import { DesktopRecentRunInputSchema, OptimizeRequestSchema, OptimizeResponseSchema } from '@/types'
import type { LLMRequest, OptimizeRequest } from '@/types'

// docs/CODING_BRIEF_STANDARD.md §6 P5: one clarification round refines a delivered brief.

const RAW_IDEA = 'buatkan portal pasien'

const briefRequest: OptimizeRequest = {
  rawIdea: RAW_IDEA,
  taskType: 'CODING',
  tone: 'PROFESSIONAL',
  format: 'STRUCTURED',
  targetLlm: 'OPENAI',
  provider: 'OPENAI',
  optimizerLane: 'INTERACTIVE',
  outputKind: 'CODING_BRIEF',
}

const greenfield = (parts: { directory: string; stack: string; assumptions: string | null }) =>
  [
    '## GOAL',
    'Build a patient portal.',
    '',
    '## CONTEXT',
    `New project: ${parts.directory}`,
    '',
    '## SCOPE',
    'Login page, appointment list, profile page.',
    '',
    '## STACK',
    parts.stack,
    '',
    '## OUT OF SCOPE',
    'No payments, no medical records.',
    '',
    '## DONE WHEN',
    '`pnpm dev` runs and every page listed in SCOPE renders without console errors.',
    ...(parts.assumptions === null ? [] : ['', '## ASSUMPTIONS', parts.assumptions]),
  ].join('\n')

/** The delivered brief: every element proposed, two proposals listed. */
const DELIVERED = greenfield({
  directory: './patient-portal',
  stack: 'Next.js, TypeScript.',
  assumptions: [
    '- Directory ./patient-portal.',
    '- Next.js with TypeScript as the ordinary stack.',
    'Change any line above and run again.',
  ].join('\n'),
})

/** The user answered both: the directory is ./portal, the stack is Vue with TypeScript. */
const ANSWERS = [
  { element: 'ASSUMPTION' as const, question: 'Directory ./patient-portal.', answer: './portal' },
  {
    element: 'ASSUMPTION' as const,
    question: 'Next.js with TypeScript as the ordinary stack.',
    answer: 'Vue dengan TypeScript',
  },
]

/** Everything proposed is now stated by the user, so ASSUMPTIONS is gone. */
const REFINED = greenfield({ directory: './portal', stack: 'Vue, TypeScript.', assumptions: null })

const refinementRequest: OptimizeRequest = {
  ...briefRequest,
  refinement: { previousBrief: DELIVERED, clarifications: ANSWERS },
}

function makeFakeProvider(generateResults: string[]) {
  const generateRequests: LLMRequest[] = []
  return {
    activeModel: 'fake-model',
    defaultModel: 'fake-model',
    name: 'OPENAI' as const,
    generateRequests,
    generate: vi.fn(async (request: LLMRequest) => {
      const content = generateResults[generateRequests.length] ?? generateResults.at(-1) ?? ''
      generateRequests.push(request)
      return { content, model: 'fake-model', tokensUsed: 42, finishReason: 'stop' }
    }),
    generateStream: vi.fn(),
    validateApiKey: vi.fn(async () => true),
  }
}

describe('Coding Brief clarification round', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('a delivered brief carries its questions', async () => {
    const provider = makeFakeProvider([DELIVERED])
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt(briefRequest)

    expect(response.metadata.outputKind).toBe('CODING_BRIEF')
    expect(response.clarifications).toEqual([
      { element: 'ASSUMPTION', question: 'Directory ./patient-portal.' },
      { element: 'ASSUMPTION', question: 'Next.js with TypeScript as the ordinary stack.' },
    ])
    expect(OptimizeResponseSchema.parse(response)).toBeTruthy()
  })

  it('an invalid brief carries no questions', async () => {
    const provider = makeFakeProvider(['no headings', 'still no headings'])
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt(briefRequest)

    expect(response.metadata.quality?.degraded).toBe(true)
    expect(response.clarifications).toBeUndefined()
  })

  it('sends the delivered brief and every answer verbatim to the provider', async () => {
    const provider = makeFakeProvider([REFINED])
    vi.mocked(getProvider).mockReturnValue(provider as never)

    await optimizePrompt(refinementRequest)

    const userPrompt = provider.generateRequests[0].userPrompt
    expect(userPrompt).toContain(DELIVERED)
    expect(userPrompt).toContain('"./portal"')
    expect(userPrompt).toContain('"Vue dengan TypeScript"')
    expect(userPrompt).toContain(RAW_IDEA)
  })

  it('leaves an unanswered item out of the answers sent', async () => {
    const provider = makeFakeProvider([REFINED])
    vi.mocked(getProvider).mockReturnValue(provider as never)

    await optimizePrompt({
      ...briefRequest,
      refinement: {
        previousBrief: DELIVERED,
        clarifications: [ANSWERS[0], { ...ANSWERS[1], answer: null }],
      },
    })

    const userPrompt = provider.generateRequests[0].userPrompt
    const answersBlock = userPrompt.slice(userPrompt.indexOf('ANSWERS'))
    expect(answersBlock).toContain('Directory ./patient-portal.')
    expect(answersBlock).not.toContain('Next.js with TypeScript as the ordinary stack.')
  })

  it('V14 counts the answers as stated: a refined brief without ASSUMPTIONS is valid', async () => {
    const provider = makeFakeProvider([REFINED])
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt(refinementRequest)

    expect(provider.generate).toHaveBeenCalledTimes(1)
    expect(response.metadata.quality).toEqual({ complete: true, degraded: false, attempts: 1 })
    expect(response.codingBrief?.context).toBe('New project: ./portal')
  })

  it('V10 counts the answers as named: a refined STACK that drops Vue is repaired', async () => {
    const withoutVue = greenfield({ directory: './portal', stack: 'TypeScript.', assumptions: null })
    const provider = makeFakeProvider([withoutVue, REFINED])
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt(refinementRequest)

    expect(provider.generateRequests[1].userPrompt).toContain(
      'V10: STACK is missing technology named in the request: Vue'
    )
    expect(response.metadata.quality).toEqual({ complete: true, degraded: false, attempts: 2 })
  })

  it('a refinement offers no second round of questions', async () => {
    const refinedWithAssumption = greenfield({
      directory: './portal',
      stack: 'Vue, TypeScript.',
      assumptions: '- Login by email and password.\nChange any line above and run again.',
    })
    const provider = makeFakeProvider([refinedWithAssumption])
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt(refinementRequest)

    expect(response.codingBrief?.assumptions).toBeDefined()
    expect(response.clarifications).toBeUndefined()
  })

  it('a refinement still invalid after the repair is degraded and carries no brief', async () => {
    const provider = makeFakeProvider(['no headings', 'still no headings'])
    vi.mocked(getProvider).mockReturnValue(provider as never)

    const response = await optimizePrompt(refinementRequest)

    expect(response.metadata.quality).toEqual({
      complete: false,
      degraded: true,
      reason: 'parse_failed',
      attempts: 2,
    })
    expect(response.codingBrief).toBeUndefined()
  })

  it('the system prompt teaches that an answered item leaves ASSUMPTIONS', () => {
    const systemPrompt = buildCodingBriefSystemPrompt()

    expect(systemPrompt).toContain('PREVIOUS BRIEF')
    expect(systemPrompt).toContain('remove each answered item from ASSUMPTIONS')
  })
})

describe('DesktopRecentRunInputSchema refinement', () => {
  const record = {
    id: 'run-1',
    sourceMode: 'optimize' as const,
    rawInput: RAW_IDEA,
    outputText: 'refined brief',
    outputKind: 'CODING_BRIEF' as const,
  }
  const refinement = { previousBrief: DELIVERED, clarifications: ANSWERS }

  it('keeps the refinement of a refined run, so a rerun can carry its answers', () => {
    expect(DesktopRecentRunInputSchema.parse({ ...record, refinement }).refinement).toEqual(refinement)
  })

  it('applies the request bounds to a stored refinement', () => {
    expect(
      DesktopRecentRunInputSchema.safeParse({
        ...record,
        refinement: { ...refinement, previousBrief: 'x'.repeat(10_001) },
      }).success
    ).toBe(false)
  })
})

describe('OptimizeRequestSchema refinement bounds', () => {
  const base = { rawIdea: RAW_IDEA, outputKind: 'CODING_BRIEF' as const }
  const item = { element: 'ASSUMPTION' as const, question: 'Directory ./x.', answer: './y' }

  it('accepts one to three answered items', () => {
    const parsed = OptimizeRequestSchema.parse({
      ...base,
      refinement: { previousBrief: DELIVERED, clarifications: [item, item, item] },
    })
    expect(parsed.refinement?.clarifications).toHaveLength(3)
  })

  it.each([
    ['more than three items', { previousBrief: DELIVERED, clarifications: [item, item, item, item] }],
    ['no items', { previousBrief: DELIVERED, clarifications: [] }],
    ['a previous brief over 10 000 characters', { previousBrief: 'x'.repeat(10_001), clarifications: [item] }],
    ['a question over 500 characters', { previousBrief: DELIVERED, clarifications: [{ ...item, question: 'q'.repeat(501) }] }],
    ['an answer over 2 000 characters', { previousBrief: DELIVERED, clarifications: [{ ...item, answer: 'a'.repeat(2_001) }] }],
    ['an unknown element', { previousBrief: DELIVERED, clarifications: [{ ...item, element: 'STACK' }] }],
  ])('rejects %s', (_name, refinement) => {
    expect(OptimizeRequestSchema.safeParse({ ...base, refinement }).success).toBe(false)
  })
})
