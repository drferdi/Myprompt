// Drferdi Transformer Engine V2 — Embedding Generator
import OpenAI from 'openai'

import { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from '@/lib/constants'

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY required for embeddings')
    client = new OpenAI({ apiKey })
  }
  return client
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getClient()

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000),
    dimensions: EMBEDDING_DIMENSIONS,
  })

  return response.data[0].embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getClient()

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.slice(0, 8000)),
    dimensions: EMBEDDING_DIMENSIONS,
  })

  return response.data.map((d) => d.embedding)
}
