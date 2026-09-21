// Drferdi Transformer Engine V2 — Similarity Search
import { Prisma } from '@prisma/client'

import { generateEmbedding } from './generator'

import { prisma } from '@/lib/db/prisma'
import type { PromptRecord } from '@/types'

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length)
  let dot = 0,
    normA = 0,
    normB = 0
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

interface SimilarPrompt {
  prompt: PromptRecord
  similarity: number
}

export async function findSimilarPrompts(
  text: string,
  userId: string,
  limit = 5,
  includePublic = true
): Promise<SimilarPrompt[]> {
  const embedding = await generateEmbedding(text)
  const vectorStr = `[${embedding.join(',')}]`
  const visibilityClause = includePublic
    ? Prisma.sql`AND (user_id = ${userId} OR is_public = true)`
    : Prisma.sql`AND user_id = ${userId}`

  // Use pgvector cosine similarity via raw query
  const results = await prisma.$queryRaw<
    Array<{
      id: string
      raw_input: string
      optimized_text: string
      task_type: string
      tone: string
      format: string
      target_llm: string
      tags: string[]
      is_public: boolean
      created_at: Date
      updated_at: Date
      similarity: number
    }>
  >`
    SELECT
      id, raw_input, optimized_text, task_type, tone, format, target_llm,
      tags, is_public, created_at, updated_at,
      1 - (embedding <=> ${vectorStr}::vector) as similarity
    FROM prompts
    WHERE deleted_at IS NULL
      AND embedding IS NOT NULL
      ${visibilityClause}
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${limit}
  `

  return results.map((r) => ({
    prompt: {
      id: r.id,
      rawInput: r.raw_input,
      optimizedText: r.optimized_text,
      taskType: r.task_type as PromptRecord['taskType'],
      tone: r.tone as PromptRecord['tone'],
      format: r.format as PromptRecord['format'],
      targetLlm: r.target_llm as PromptRecord['targetLlm'],
      tags: r.tags,
      isPublic: r.is_public,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    },
    similarity: r.similarity,
  }))
}
