import { allTemplates, templatesByCategory } from '../../data/templates'
import { prisma } from '../../lib/db/prisma'
import { CreatePromptSchema, type CreatePrompt, type TemplateCategory } from '../../types'

interface DesktopPromptQuery {
  page?: number
  limit?: number
  taskType?: string
  tag?: string
  search?: string
}

function normalizePromptQuery(query: DesktopPromptQuery) {
  return {
    page: Math.max(1, query.page ?? 1),
    limit: Math.min(50, Math.max(1, query.limit ?? 20)),
    taskType: query.taskType,
    tag: query.tag,
    search: query.search,
  }
}

export async function listDesktopPrompts(userId: string, query: DesktopPromptQuery = {}) {
  const normalized = normalizePromptQuery(query)
  const where: Record<string, unknown> = {
    deletedAt: null,
    userId,
  }

  if (normalized.taskType) {
    where.taskType = normalized.taskType
  }

  if (normalized.tag) {
    where.tags = { has: normalized.tag }
  }

  if (normalized.search) {
    where.OR = [
      { rawInput: { contains: normalized.search, mode: 'insensitive' } },
      { optimizedText: { contains: normalized.search, mode: 'insensitive' } },
    ]
  }

  const [prompts, total] = await Promise.all([
    prisma.prompt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (normalized.page - 1) * normalized.limit,
      take: normalized.limit,
      select: {
        id: true,
        rawInput: true,
        optimizedText: true,
        taskType: true,
        tone: true,
        format: true,
        targetLlm: true,
        tags: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.prompt.count({ where }),
  ])

  return {
    prompts,
    pagination: {
      page: normalized.page,
      limit: normalized.limit,
      total,
      totalPages: Math.ceil(total / normalized.limit),
    },
  }
}

export function listDesktopTemplates(category?: TemplateCategory | null) {
  if (category && category in templatesByCategory) {
    return {
      templates: templatesByCategory[category as keyof typeof templatesByCategory],
      category,
    }
  }

  return {
    templates: allTemplates,
    categories: Object.keys(templatesByCategory),
    total: allTemplates.length,
  }
}

export async function createDesktopPrompt(userId: string, payload: Partial<CreatePrompt>) {
  const normalized = CreatePromptSchema.parse({
    rawInput: payload.rawInput,
    optimizedText: payload.optimizedText,
    taskType: payload.taskType ?? 'GENERAL',
    tone: payload.tone ?? 'PROFESSIONAL',
    format: payload.format ?? 'STRUCTURED',
    targetLlm: payload.targetLlm ?? 'OPENAI',
    tags: payload.tags ?? [],
    isPublic: false,
  })

  const tags = Array.from(new Set(['desktop', ...normalized.tags]))

  const prompt = await prisma.prompt.create({
    data: {
      userId,
      rawInput: normalized.rawInput,
      optimizedText: normalized.optimizedText,
      taskType: normalized.taskType,
      tone: normalized.tone,
      format: normalized.format,
      targetLlm: normalized.targetLlm,
      tags,
      isPublic: false,
    },
    select: {
      id: true,
      rawInput: true,
      optimizedText: true,
      taskType: true,
      tone: true,
      format: true,
      targetLlm: true,
      tags: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return { prompt }
}
