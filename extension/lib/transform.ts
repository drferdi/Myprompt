// Sentra Prompt — Transform Engine (Extension Port)
// Pure function: raw prompt -> structured super prompt
// No external API calls — deterministic string builder
// Ported from desktop lib/transform/ — self-contained, zero parent imports

import type { TransformRequest, TransformResult, TransformMode, ModelId, CompilerProfile, EffortLevel } from './types';

// ── Personas ────────────────────────────────────────────────

const MODE_PERSONAS: Record<TransformMode, { role: string; style: string }> = {
  professional: {
    role: 'Anda adalah konsultan profesional berpengalaman dengan keahlian mendalam di bidang yang relevan.',
    style: 'Gunakan bahasa formal, terstruktur, dan berorientasi pada hasil. Sertakan data dan fakta pendukung.',
  },
  creative: {
    role: 'Anda adalah kreator konten berbakat dengan kemampuan storytelling yang kuat dan pemahaman mendalam tentang audiens digital.',
    style: 'Gunakan bahasa yang ekspresif, engaging, dan penuh imajinasi. Buat konten yang memicu emosi dan resonansi.',
  },
  technical: {
    role: 'Anda adalah senior engineer dengan pengalaman 10+ tahun dalam software development dan system architecture.',
    style: 'Gunakan bahasa teknis yang presisi. Sertakan code examples, best practices, dan pertimbangan edge cases.',
  },
  academic: {
    role: 'Anda adalah peneliti akademis dengan track record publikasi di jurnal internasional bereputasi.',
    style: 'Gunakan bahasa ilmiah yang objektif. Sertakan framework teori, metodologi, dan referensi akademis.',
  },
  casual: {
    role: 'Anda adalah teman yang cerdas dan asik diajak ngobrol, dengan pengetahuan luas tapi cara penyampaian yang santai.',
    style: 'Gunakan bahasa sehari-hari yang natural. Boleh pakai slang ringan, analogi sederhana, dan humor.',
  },
};

const MODEL_HINTS: Record<ModelId, string> = {
  'openai-gpt4o': 'Format instruksi sebagai system message yang jelas. Gunakan numbered lists untuk multi-step tasks.',
  'claude-sonnet': 'Gunakan XML tags untuk struktur (<context>, <task>, <constraints>). Claude merespons baik terhadap instruksi yang eksplisit.',
  'claude-opus': 'Berikan konteks mendalam dan biarkan ruang untuk reasoning. Opus unggul dalam analisis kompleks dan nuansa.',
  'mistral-large': 'Gunakan instruksi langsung dan to-the-point. Mistral optimal dengan prompt yang ringkas tapi komprehensif.',
  'deepseek-v3': 'Gunakan chain-of-thought prompting. DeepSeek unggul dalam reasoning step-by-step.',
};

// ── Intent Detection ────────────────────────────────────────

export function detectIntent(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (/terjemah|translate|alih bahasa|konversi bahasa/.test(lower)) return 'translation';
  if (/ringkas|singkat|resume|summarize|rangkum|summary/.test(lower)) return 'summarization';
  if (/analisis|analisa|analyze|analyse|evaluasi|nilai|kaji|telaah|review|assess/.test(lower)) return 'analysis';
  if (/bandingkan|compare|perbedaan|difference| vs | versus /.test(lower)) return 'comparison';
  if (/perbaiki|benahi|atasi|fix|debug|error|bug|masalah/.test(lower)) return 'debugging';
  if (/jelaskan|ceritakan|deskripsikan|explain|apa itu|what is|apa yang|bagaimana|how/.test(lower)) return 'explanation';
  if (/buatkan|bikin|buat|tulis|susun|rancang|compose|draft|generate|create|write/.test(lower)) return 'generation';

  return 'general';
}

function getIntentInstruction(intent: string, locale: 'id' | 'en'): string {
  const map: Record<string, { id: string; en: string }> = {
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
      id: 'Terjemahkan dengan akurat sambil mempertahankan nuansa, gaya, dan konteks budaya aslinya.',
      en: 'Translate accurately while preserving the original nuance, style, and cultural context.',
    },
    comparison: {
      id: 'Bandingkan secara sistematis dengan tabel atau daftar paralel. Sorot persamaan, perbedaan, kelebihan, dan kekurangan masing-masing.',
      en: 'Compare systematically using a table or parallel list. Highlight similarities, differences, strengths, and weaknesses of each.',
    },
    general: {
      id: 'Berikan respons yang komprehensif, terstruktur, dan langsung menjawab kebutuhan pengguna.',
      en: "Provide a comprehensive, structured response that directly addresses the user's needs.",
    },
  };

  const inst = map[intent] ?? map.general;
  return locale === 'id' ? inst.id : inst.en;
}

// ── Token Estimation ────────────────────────────────────────

function estimateTokens(text: string, model?: ModelId, locale?: 'id' | 'en'): number {
  const divisors: Partial<Record<ModelId, number>> = {
    'claude-sonnet': 3.2, 'claude-opus': 3.2,
    'openai-gpt4o': 3.5, 'mistral-large': 3.4, 'deepseek-v3': 3.4,
  };
  const divisor = (model && divisors[model]) ?? 3.5;
  const multiplier = locale === 'id' ? 1.15 : 1.0;
  return Math.ceil((text.length * multiplier) / divisor);
}

// ── Compiler Helpers ────────────────────────────────────────

function escapeXml(value: string): string {
  return value.replace(/[<>&]/g, (c) => c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;');
}

interface CompilerOptions {
  prompt: string;
  mode: TransformMode;
  locale: 'id' | 'en';
  temperature: number;
  maxTokens: number;
  effort: EffortLevel;
  target: string;
  intent: string;
  intentInstruction: string;
  persona: { role: string; style: string };
}

function buildConstraints(opts: CompilerOptions): string[] {
  const c = [
    opts.intentInstruction,
    `Keep the final response within approximately ${opts.maxTokens} tokens.`,
    'Use direct, concrete language. Do not add unsolicited meta-commentary.',
  ];
  if (opts.locale === 'id') c.push('Write in clear, professional Bahasa Indonesia.');
  if (opts.intent === 'debugging' || opts.target === 'agent') c.push('Limit implementation changes to explicitly requested behavior and files.');
  if (opts.effort === 'xhigh' || opts.effort === 'max') c.push('Produce each requested deliverable exactly once. Return only the final deliverable.');
  if (opts.target === 'agent') c.push('Batch independent inspection work in one response when tools are available.');
  return c;
}

const bullet = (items: string[]) => items.map((i) => `- ${i}`);

// ── Compiler Profiles ───────────────────────────────────────

const compilers: Record<CompilerProfile, (opts: CompilerOptions) => string> = {
  claude: (opts) => [
    '<instructions>', `- Act as: ${opts.persona.role}`, `- Intent: ${opts.intent}`, `- Style: ${opts.persona.style}`, '</instructions>',
    '<context>', `- Audience: ${opts.locale === 'id' ? 'Indonesia' : 'International'}`, `- Creativity: ${opts.temperature}`, '</context>',
    '<task>', escapeXml(opts.prompt), '</task>',
    '<constraints>', ...bullet(buildConstraints(opts)), '</constraints>',
    '<output_format>', 'Return the requested deliverable with clear headings and only the necessary assumptions.', '</output_format>',
  ].join('\n'),

  codex: (opts) => [
    '# Task', opts.prompt, '',
    '## Repository context', `- Role: ${opts.persona.role}`, `- Intent: ${opts.intent}`, `- Style: ${opts.persona.style}`, '',
    '## Constraints', ...bullet(buildConstraints(opts)), '',
    '## Acceptance criteria', '- Satisfy the requested behavior without unrelated changes.', '- State assumptions only when the task lacks required information.', '',
    '## Verification', '- Name the focused checks that demonstrate the requested behavior.', '- Report only results supported by executed evidence.',
  ].join('\n'),

  gemini: (opts) => [
    '## System instruction', `Act as ${opts.persona.role}. Follow the requested output format exactly.`, '',
    '## Context', `- Intent: ${opts.intent}`, `- Audience: ${opts.locale === 'id' ? 'Indonesia' : 'International'}`, `- Style: ${opts.persona.style}`, '',
    '## Task', opts.prompt, '',
    '## Constraints', ...bullet(buildConstraints(opts)), '',
    '## Output schema', '1. Direct answer', '2. Assumptions, only if required', '3. Verification or next action when applicable',
  ].join('\n'),

  grok: (opts) => [
    '## Objective', opts.prompt, '',
    '## Context', `- Role: ${opts.persona.role}`, `- Intent: ${opts.intent}`, `- Audience: ${opts.locale === 'id' ? 'Indonesia' : 'International'}`, '',
    '## Evidence and uncertainty', '- Separate provided facts from assumptions.', '- Identify uncertainty instead of presenting an unsupported claim as fact.', '',
    '## Constraints', ...bullet(buildConstraints(opts)), '',
    '## Output', 'Provide a direct answer, followed by evidence-based rationale and concrete next actions.',
  ].join('\n'),
};

// ── Main Transform ──────────────────────────────────────────

export function transformPrompt(request: TransformRequest): TransformResult {
  const {
    prompt,
    model = 'claude-sonnet',
    mode = 'professional',
    temperature = 0.7,
    maxTokens = 1024,
    locale = 'id',
    profile,
    effort = 'high',
    target = 'general',
  } = request;

  const persona = MODE_PERSONAS[mode];
  const intent = detectIntent(prompt);
  const intentInstruction = getIntentInstruction(intent, locale);

  // Compiler profile path
  if (profile && profile in compilers) {
    const transformedPrompt = compilers[profile]({ prompt, mode, locale, temperature, maxTokens, effort, target, intent, intentInstruction, persona });
    return { transformedPrompt, tokensEstimate: estimateTokens(transformedPrompt, model, locale) };
  }

  // Default path
  const isClaudeModel = model === 'claude-sonnet' || model === 'claude-opus';
  const modelHint = MODEL_HINTS[model];
  const sections: string[] = [];

  if (isClaudeModel) {
    sections.push(`<role>\n${persona.role}\n</role>`);
    sections.push('<context>');
    sections.push(`- Intent: ${intent}`);
    sections.push(`- Target audience: ${locale === 'id' ? 'Indonesia' : 'International'}`);
    sections.push(`- Communication style: ${persona.style}`);
    if (temperature > 1.2) sections.push('- Creativity level: Tinggi — eksplorasi ide-ide berani dan unconventional');
    else if (temperature < 0.4) sections.push('- Creativity level: Rendah — fokus pada akurasi dan konsistensi');
    sections.push('</context>');
    sections.push(`<task>\n${prompt}\n</task>`);
    sections.push('<constraints>');
    sections.push(`- ${intentInstruction}`);
    sections.push(`- Batasi respons maksimal ~${maxTokens} tokens`);
    if (locale === 'id') {
      sections.push('- Gunakan Bahasa Indonesia yang baik dan benar');
      sections.push('- Sesuaikan konteks dan referensi untuk audiens Indonesia');
    }
    sections.push('- Jangan menambahkan disclaimer atau penjelasan meta yang tidak diminta');
    sections.push('</constraints>');
    sections.push('<output_format>');
    sections.push(`Berikan output dalam format yang paling sesuai untuk tipe tugas ini (${intent}).`);
    sections.push('Gunakan heading, bullet points, atau numbered lists untuk keterbacaan.');
    sections.push('</output_format>');
  } else {
    sections.push('# Role', persona.role, '');
    sections.push('# Context');
    sections.push(`- Intent: ${intent}`);
    sections.push(`- Target audience: ${locale === 'id' ? 'Indonesia' : 'International'}`);
    sections.push(`- Communication style: ${persona.style}`);
    if (temperature > 1.2) sections.push('- Creativity level: High — explore bold and unconventional ideas');
    else if (temperature < 0.4) sections.push('- Creativity level: Low — focus on accuracy and consistency');
    sections.push('');
    sections.push('# Task', prompt, '');
    sections.push('# Constraints');
    sections.push(`- ${intentInstruction}`);
    sections.push(`- Limit response to ~${maxTokens} tokens`);
    if (locale === 'id') {
      sections.push('- Use proper Bahasa Indonesia');
      sections.push('- Adapt context and references for Indonesian audience');
    }
    sections.push('- Do not add unsolicited disclaimers or meta-explanations');
    sections.push('');
    sections.push('# Output Format');
    sections.push(`Provide output in the most appropriate format for this task type (${intent}).`);
    sections.push('Use headings, bullet points, or numbered lists for readability.');
  }

  sections.push('', '---', `Model optimization: ${modelHint}`);

  const transformedPrompt = sections.join('\n');
  return { transformedPrompt, tokensEstimate: estimateTokens(transformedPrompt, model, locale) };
}
