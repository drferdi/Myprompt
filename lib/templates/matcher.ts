// Drferdi Transformer Engine V2 — Template Matcher
import { allTemplates, templatesByCategory } from '@/data/templates'
import { generateEmbedding, generateEmbeddings } from '@/lib/embeddings/generator'
import { cosineSimilarity } from '@/lib/embeddings/similarity'
import { logger } from '@/lib/logger'
import type { TemplateDefinition, TaskType } from '@/types'

// Bilingual synonym map: each canonical form expands to its synonyms.
// Both the user query and template tokens pass through this map before scoring.
const SYNONYMS: Record<string, string[]> = {
  // Generation
  buat: [
    'buatkan',
    'bikin',
    'susun',
    'rancang',
    'tulis',
    'hasilkan',
    'create',
    'write',
    'generate',
    'compose',
    'draft',
  ],
  tulis: ['buat', 'buatkan', 'bikin', 'susun', 'compose', 'draft', 'write'],
  // Analysis
  analisis: [
    'analisa',
    'analyze',
    'analyse',
    'evaluasi',
    'kaji',
    'telaah',
    'nilai',
    'review',
    'assess',
  ],
  evaluasi: ['analisis', 'analisa', 'kaji', 'nilai', 'review', 'assess', 'evaluate'],
  // Explanation
  jelaskan: ['ceritakan', 'deskripsikan', 'explain', 'describe', 'clarify'],
  explain: ['jelaskan', 'ceritakan', 'deskripsikan', 'describe', 'clarify'],
  // Debugging
  perbaiki: ['benahi', 'atasi', 'fix', 'debug', 'solve', 'repair'],
  fix: ['perbaiki', 'benahi', 'atasi', 'debug', 'solve', 'repair'],
  // Summarization
  ringkas: ['singkat', 'resume', 'rangkum', 'summarize', 'summary', 'recap'],
  summarize: ['ringkas', 'singkat', 'rangkum', 'resume', 'summary', 'recap'],
  // Code
  code: ['kode', 'coding', 'program', 'script', 'implementasi', 'implement'],
  kode: ['code', 'coding', 'program', 'script', 'implementasi'],
  // Email
  email: ['surat', 'pesan', 'message', 'memo'],
  surat: ['email', 'pesan', 'message', 'memo'],
  // Research
  riset: ['penelitian', 'research', 'studi', 'study', 'investigasi'],
  research: ['riset', 'penelitian', 'studi', 'study', 'investigasi'],
  // Business
  bisnis: ['business', 'usaha', 'perusahaan', 'company', 'proposal'],
  business: ['bisnis', 'usaha', 'perusahaan', 'company', 'proposal'],
  // Marketing
  marketing: ['pemasaran', 'iklan', 'promosi', 'campaign', 'advertise'],
  pemasaran: ['marketing', 'iklan', 'promosi', 'campaign'],
  // Education
  belajar: ['education', 'edukasi', 'pelajaran', 'tutorial', 'materi'],
  education: ['belajar', 'edukasi', 'pelajaran', 'tutorial', 'materi'],
  // Creative
  kreatif: ['creative', 'konten', 'content', 'cerita', 'story', 'fiksi'],
  creative: ['kreatif', 'konten', 'content', 'cerita', 'story', 'fiksi'],
}

function expandWithSynonyms(tokens: string[]): Set<string> {
  const expanded = new Set(tokens)
  for (const token of tokens) {
    const syns = SYNONYMS[token]
    if (syns) syns.forEach((s) => expanded.add(s))
  }
  return expanded
}

// Module-level cache so template embeddings are computed once per process.
const _templateEmbeddingCache = new Map<string, number[]>()

// Exported for test isolation only — clears in-process cache between test runs.
export function _clearEmbeddingCacheForTest(): void {
  _templateEmbeddingCache.clear()
}

const TASK_TO_CATEGORY: Record<TaskType, string> = {
  CODING: 'CODING',
  EMAIL: 'EMAIL',
  ANALYSIS: 'ANALYSIS',
  CREATIVE: 'CREATIVE',
  RESEARCH: 'RESEARCH',
  BUSINESS: 'BUSINESS',
  EDUCATION: 'EDUCATION',
  MARKETING: 'MARKETING',
  GENERAL: '',
}

export function matchTemplate(rawIdea: string, taskType: TaskType): TemplateDefinition | undefined {
  const category = TASK_TO_CATEGORY[taskType]

  // If task type maps to a category, find best match within that category
  if (category && category in templatesByCategory) {
    const candidates = templatesByCategory[category as keyof typeof templatesByCategory]
    return findBestMatch(rawIdea, candidates)
  }

  // For GENERAL, search all templates
  return findBestMatch(rawIdea, allTemplates)
}

function scoreTemplate(
  template: TemplateDefinition,
  ideaTokens: Set<string>,
  normalizedIdea: string
): number {
  let score = 0
  for (const word of template.slug.split('-')) {
    const w = normalizeWord(word)
    if (w.length > 3 && ideaTokens.has(w)) score += 3
  }
  for (const word of template.name.toLowerCase().split(/\s+/)) {
    const w = normalizeWord(word)
    if (w.length > 3 && ideaTokens.has(w)) score += 2
  }
  for (const word of template.description.toLowerCase().split(/\s+/)) {
    const w = normalizeWord(word)
    if (w.length > 3 && ideaTokens.has(w)) score += 1
  }
  const tName = normalizePhrase(template.name)
  if (tName.length > 8 && normalizedIdea.includes(tName)) score += 4
  return score
}

function findBestMatch(
  rawIdea: string,
  candidates: readonly TemplateDefinition[]
): TemplateDefinition | undefined {
  if (candidates.length === 0) return undefined

  const ideaLower = rawIdea.toLowerCase()
  const normalizedIdea = normalizePhrase(ideaLower)
  const ideaTokens = expandWithSynonyms(tokenize(ideaLower))
  let bestScore = 0
  let bestTemplate: TemplateDefinition | undefined

  for (const template of candidates) {
    const score = scoreTemplate(template, ideaTokens, normalizedIdea)
    if (score > bestScore) {
      bestScore = score
      bestTemplate = template
    }
  }

  return bestScore > 0 ? bestTemplate : undefined
}

async function warmEmbeddingCache(candidates: readonly TemplateDefinition[]): Promise<number[][]> {
  const uncached = candidates.filter((t) => !_templateEmbeddingCache.has(t.slug))
  if (uncached.length > 0) {
    // One batch request for all uncached templates
    const texts = uncached.map((t) => `${t.name}: ${t.description}`)
    const embeddings = await generateEmbeddings(texts)
    uncached.forEach((t, i) => _templateEmbeddingCache.set(t.slug, embeddings[i]))
  }
  return candidates.map((t) => {
    const embedding = _templateEmbeddingCache.get(t.slug)

    if (!embedding) {
      throw new Error(`Missing template embedding for ${t.slug}`)
    }

    return embedding
  })
}

// Async variant: keyword match enhanced with semantic similarity.
// Falls back to keyword result on any embedding error — logs via logger.warn for observability.
// Use this from async callers (e.g., optimizer engine); sync callers use matchTemplate.
export async function matchTemplateWithEmbeddings(
  rawIdea: string,
  taskType: TaskType
): Promise<TemplateDefinition | undefined> {
  const category = TASK_TO_CATEGORY[taskType]
  const candidates: readonly TemplateDefinition[] =
    category && category in templatesByCategory
      ? templatesByCategory[category as keyof typeof templatesByCategory]
      : allTemplates

  try {
    const [queryEmbedding, templateEmbeddings] = await Promise.all([
      generateEmbedding(rawIdea),
      warmEmbeddingCache(candidates),
    ])

    let bestKeywordScore = 0
    let bestSemanticScore = -1
    let bestKeyword: TemplateDefinition | undefined
    let bestSemantic: TemplateDefinition | undefined

    const ideaTokens = expandWithSynonyms(tokenize(rawIdea.toLowerCase()))
    const normalizedIdea = normalizePhrase(rawIdea.toLowerCase())

    for (let i = 0; i < candidates.length; i++) {
      const template = candidates[i]

      const kScore = scoreTemplate(template, ideaTokens, normalizedIdea)
      if (kScore > bestKeywordScore) {
        bestKeywordScore = kScore
        bestKeyword = template
      }

      const sScore = cosineSimilarity(queryEmbedding, templateEmbeddings[i])
      if (sScore > bestSemanticScore) {
        bestSemanticScore = sScore
        bestSemantic = template
      }
    }

    // Use semantic result when keyword matching found nothing or semantic is clearly better
    if (bestKeywordScore === 0 && bestSemanticScore > 0.35) return bestSemantic
    if (bestKeyword && bestSemantic && bestSemantic !== bestKeyword && bestSemanticScore > 0.55)
      return bestSemantic
    return bestKeyword
  } catch (err) {
    logger.warn(
      { route: 'template-matcher' },
      `Embedding match failed, falling back to keyword: ${err instanceof Error ? err.message : String(err)}`
    )
    return matchTemplate(rawIdea, taskType)
  }
}

function normalizeWord(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function normalizePhrase(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokenize(value: string) {
  return normalizePhrase(value)
    .split(/\s+/)
    .filter((word) => word.length > 0)
}
