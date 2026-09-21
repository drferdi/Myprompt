// Drferdi CTE V2 — Transform Engine
// Pure function: raw prompt -> structured super prompt
// No external API calls — deterministic string builder

import type { TransformRequest, ModelId, TransformMode } from './schemas'

interface TransformResult {
  transformedPrompt: string
  tokensEstimate: number
}

const MODE_PERSONAS: Record<TransformMode, { role: string; style: string }> = {
  professional: {
    role: 'Anda adalah konsultan profesional berpengalaman dengan keahlian mendalam di bidang yang relevan.',
    style:
      'Gunakan bahasa formal, terstruktur, dan berorientasi pada hasil. Sertakan data dan fakta pendukung.',
  },
  creative: {
    role: 'Anda adalah kreator konten berbakat dengan kemampuan storytelling yang kuat dan pemahaman mendalam tentang audiens digital.',
    style:
      'Gunakan bahasa yang ekspresif, engaging, dan penuh imajinasi. Buat konten yang memicu emosi dan resonansi.',
  },
  technical: {
    role: 'Anda adalah senior engineer dengan pengalaman 10+ tahun dalam software development dan system architecture.',
    style:
      'Gunakan bahasa teknis yang presisi. Sertakan code examples, best practices, dan pertimbangan edge cases.',
  },
  academic: {
    role: 'Anda adalah peneliti akademis dengan track record publikasi di jurnal internasional bereputasi.',
    style:
      'Gunakan bahasa ilmiah yang objektif. Sertakan framework teori, metodologi, dan referensi akademis.',
  },
  casual: {
    role: 'Anda adalah teman yang cerdas dan asik diajak ngobrol, dengan pengetahuan luas tapi cara penyampaian yang santai.',
    style:
      'Gunakan bahasa sehari-hari yang natural. Boleh pakai slang ringan, analogi sederhana, dan humor.',
  },
}

const MODEL_HINTS: Record<ModelId, string> = {
  'openai-gpt4o':
    'Format instruksi sebagai system message yang jelas. Gunakan numbered lists untuk multi-step tasks.',
  'claude-sonnet':
    'Gunakan XML tags untuk struktur (<context>, <task>, <constraints>). Claude merespons baik terhadap instruksi yang eksplisit.',
  'claude-opus':
    'Berikan konteks mendalam dan biarkan ruang untuk reasoning. Opus unggul dalam analisis kompleks dan nuansa.',
  'mistral-large':
    'Gunakan instruksi langsung dan to-the-point. Mistral optimal dengan prompt yang ringkas tapi komprehensif.',
  'deepseek-v3':
    'Gunakan chain-of-thought prompting. DeepSeek unggul dalam reasoning step-by-step.',
}

export function detectIntent(prompt: string): string {
  const lower = prompt.toLowerCase()

  // Specific intents checked before generation — prevents "buatkan ringkasan"
  // from matching the broad generation branch before reaching summarization.

  // translation (early — "terjemah" can co-occur with "buat")
  if (
    lower.includes('terjemah') ||
    lower.includes('translate') ||
    lower.includes('alih bahasa') ||
    lower.includes('konversi bahasa')
  ) {
    return 'translation'
  }

  // summarization (early — "buatkan ringkasan" should not fall into generation)
  if (
    lower.includes('ringkas') ||
    lower.includes('singkat') ||
    lower.includes('resume') ||
    lower.includes('summarize') ||
    lower.includes('rangkum') ||
    lower.includes('summary')
  ) {
    return 'summarization'
  }

  // analysis (early — "buatkan analisis" is analysis, not generation)
  if (
    lower.includes('analisis') ||
    lower.includes('analisa') ||
    lower.includes('analyze') ||
    lower.includes('analyse') ||
    lower.includes('evaluasi') ||
    lower.includes('nilai') ||
    lower.includes('kaji') ||
    lower.includes('telaah') ||
    lower.includes('review') ||
    lower.includes('assess')
  ) {
    return 'analysis'
  }

  // comparison (early — "bandingkan dan buat laporan" is comparison)
  if (
    lower.includes('bandingkan') ||
    lower.includes('compare') ||
    lower.includes('perbedaan') ||
    lower.includes('difference') ||
    lower.includes(' vs ') ||
    lower.includes(' versus ')
  ) {
    return 'comparison'
  }

  // debugging (early — "buatkan fix untuk bug ini" is debugging)
  if (
    lower.includes('perbaiki') ||
    lower.includes('benahi') ||
    lower.includes('atasi') ||
    lower.includes('fix') ||
    lower.includes('debug') ||
    lower.includes('error') ||
    lower.includes('bug') ||
    lower.includes('masalah')
  ) {
    return 'debugging'
  }

  // explanation (early — "buatkan penjelasan" is explanation)
  if (
    lower.includes('jelaskan') ||
    lower.includes('ceritakan') ||
    lower.includes('deskripsikan') ||
    lower.includes('explain') ||
    lower.includes('apa itu') ||
    lower.includes('what is') ||
    lower.includes('apa yang') ||
    lower.includes('bagaimana') ||
    lower.includes('how')
  ) {
    return 'explanation'
  }

  // generation — broad catch after all specific intents
  if (
    lower.includes('buatkan') ||
    lower.includes('bikin') ||
    lower.includes('buat') ||
    lower.includes('tulis') ||
    lower.includes('susun') ||
    lower.includes('rancang') ||
    lower.includes('compose') ||
    lower.includes('draft') ||
    lower.includes('generate') ||
    lower.includes('create') ||
    lower.includes('write')
  ) {
    return 'generation'
  }

  return 'general'
}

export function getIntentInstruction(intent: string, locale: 'id' | 'en'): string {
  const instructions: Record<string, { id: string; en: string }> = {
    generation: {
      id: 'Hasilkan output yang lengkap, terstruktur, dan siap pakai. Berikan versi final, bukan draft.',
      en: 'Generate complete, structured, and ready-to-use output. Provide the final version, not a draft.',
    },
    analysis: {
      id: 'Lakukan analisis mendalam dengan framework yang jelas. Sertakan temuan kunci, implikasi, dan rekomendasi actionable.',
      en: 'Perform deep analysis with a clear framework. Include key findings, implications, and actionable recommendations.',
    },
    explanation: {
      id: 'Jelaskan dengan bertahap dari konsep dasar ke detail. Gunakan analogi dan contoh konkret.',
      en: 'Explain step by step from basic concepts to details. Use analogies and concrete examples.',
    },
    debugging: {
      id: 'Identifikasi root cause secara sistematis. Berikan solusi spesifik dengan code fix yang bisa langsung diterapkan.',
      en: 'Identify root cause systematically. Provide specific solutions with immediately applicable code fixes.',
    },
    summarization: {
      id: 'Buat ringkasan yang padat dan informatif. Pertahankan poin-poin kunci tanpa kehilangan nuansa penting.',
      en: 'Create a concise and informative summary. Retain key points without losing important nuances.',
    },
    translation: {
      id: 'Terjemahkan dengan akurat sambil mempertahankan nuansa, gaya, dan konteks budaya aslinya. Sebutkan asumsi jika ada ambiguitas.',
      en: 'Translate accurately while preserving the original nuance, style, and cultural context. State any assumptions if ambiguity exists.',
    },
    comparison: {
      id: 'Bandingkan secara sistematis dengan tabel atau daftar paralel. Sorot persamaan, perbedaan, kelebihan, dan kekurangan masing-masing.',
      en: 'Compare systematically using a table or parallel list. Highlight similarities, differences, strengths, and weaknesses of each.',
    },
    general: {
      id: 'Berikan respons yang komprehensif, terstruktur, dan langsung menjawab kebutuhan pengguna.',
      en: "Provide a comprehensive, structured response that directly addresses the user's needs.",
    },
  }

  const inst = instructions[intent] ?? instructions.general
  return locale === 'id' ? inst.id : inst.en
}

const MODEL_TOKEN_DIVISORS: Partial<Record<ModelId, number>> = {
  'claude-sonnet': 3.2,
  'claude-opus': 3.2,
  'openai-gpt4o': 3.5,
  'mistral-large': 3.4,
  'deepseek-v3': 3.4,
}

const LOCALE_TOKEN_MULTIPLIER: Record<'id' | 'en', number> = {
  id: 1.15,
  en: 1.0,
}

export function estimateTokens(text: string, model?: ModelId, locale?: 'id' | 'en'): number {
  const divisor = (model && MODEL_TOKEN_DIVISORS[model]) ?? 3.5
  const multiplier = locale ? LOCALE_TOKEN_MULTIPLIER[locale] : 1.0
  return Math.ceil((text.length * multiplier) / divisor)
}

export function transformPrompt(request: TransformRequest): TransformResult {
  const { prompt, model, mode, temperature, maxTokens, locale } = request
  const persona = MODE_PERSONAS[mode]
  const modelHint = MODEL_HINTS[model]
  const intent = detectIntent(prompt)
  const intentInstruction = getIntentInstruction(intent, locale)

  const isClaudeModel = model === 'claude-sonnet' || model === 'claude-opus'

  const sections: string[] = []

  if (isClaudeModel) {
    sections.push(`<role>\n${persona.role}\n</role>`)
    sections.push(`<context>`)
    sections.push(`- Intent: ${intent}`)
    sections.push(`- Target audience: ${locale === 'id' ? 'Indonesia' : 'International'}`)
    sections.push(`- Communication style: ${persona.style}`)
    if (temperature > 1.2) {
      sections.push(`- Creativity level: Tinggi — eksplorasi ide-ide berani dan unconventional`)
    } else if (temperature < 0.4) {
      sections.push(`- Creativity level: Rendah — fokus pada akurasi dan konsistensi`)
    }
    sections.push(`</context>`)
    sections.push(`<task>\n${prompt}\n</task>`)
    sections.push(`<constraints>`)
    sections.push(`- ${intentInstruction}`)
    sections.push(`- Batasi respons maksimal ~${maxTokens} tokens`)
    if (locale === 'id') {
      sections.push(`- Gunakan Bahasa Indonesia yang baik dan benar`)
      sections.push(`- Sesuaikan konteks dan referensi untuk audiens Indonesia`)
    }
    sections.push(`- Jangan menambahkan disclaimer atau penjelasan meta yang tidak diminta`)
    sections.push(`</constraints>`)
    sections.push(`<output_format>`)
    sections.push(
      `Berikan output dalam format yang paling sesuai untuk tipe tugas ini (${intent}).`
    )
    sections.push(`Gunakan heading, bullet points, atau numbered lists untuk keterbacaan.`)
    sections.push(`</output_format>`)
  } else {
    sections.push(`# Role`)
    sections.push(persona.role)
    sections.push(``)
    sections.push(`# Context`)
    sections.push(`- Intent: ${intent}`)
    sections.push(`- Target audience: ${locale === 'id' ? 'Indonesia' : 'International'}`)
    sections.push(`- Communication style: ${persona.style}`)
    if (temperature > 1.2) {
      sections.push(`- Creativity level: High — explore bold and unconventional ideas`)
    } else if (temperature < 0.4) {
      sections.push(`- Creativity level: Low — focus on accuracy and consistency`)
    }
    sections.push(``)
    sections.push(`# Task`)
    sections.push(prompt)
    sections.push(``)
    sections.push(`# Constraints`)
    sections.push(`- ${intentInstruction}`)
    sections.push(`- Limit response to ~${maxTokens} tokens`)
    if (locale === 'id') {
      sections.push(`- Use proper Bahasa Indonesia`)
      sections.push(`- Adapt context and references for Indonesian audience`)
    }
    sections.push(`- Do not add unsolicited disclaimers or meta-explanations`)
    sections.push(``)
    sections.push(`# Output Format`)
    sections.push(`Provide output in the most appropriate format for this task type (${intent}).`)
    sections.push(`Use headings, bullet points, or numbered lists for readability.`)
  }

  sections.push(``)
  sections.push(`---`)
  sections.push(`Model optimization: ${modelHint}`)

  const transformedPrompt = sections.join('\n')
  const tokensEstimate = estimateTokens(transformedPrompt, model, locale)

  return { transformedPrompt, tokensEstimate }
}
