// Drferdi CTE V2 — Transform Feature Constants & Presets

import type { ModelId, TransformMode } from './schemas'

export interface ModelInfo {
  id: ModelId
  name: string
  provider: string
  description: string
}

export interface ModeInfo {
  id: TransformMode
  name: string
  description: string
  icon: string
}

export interface PromptPreset {
  id: string
  title: string
  description: string
  prompt: string
  mode: TransformMode
  model: ModelId
  category: 'content-creator' | 'business' | 'student' | 'professional'
}

/**
 * Transform feature model IDs (e.g. 'claude-sonnet') are NOT the same as
 * provider registry LLMProviderName values (e.g. 'CLAUDE'). Do not mix these
 * namespaces. Reconciliation is tracked in DECISIONS.md under P2 migration.
 */
export const MODELS: ModelInfo[] = [
  {
    id: 'openai-gpt4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Model multimodal terbaik OpenAI',
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet',
    provider: 'Anthropic',
    description: 'Seimbang antara kecepatan dan kualitas',
  },
  {
    id: 'claude-opus',
    name: 'Claude Opus',
    provider: 'Anthropic',
    description: 'Model paling cerdas untuk tugas kompleks',
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    description: 'Model open-weight berkualitas tinggi',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'Model reasoning kuat dengan efisiensi tinggi',
  },
]

export const MODES: ModeInfo[] = [
  {
    id: 'professional',
    name: 'Profesional',
    description: 'Nada formal, terstruktur, cocok untuk bisnis',
    icon: 'Briefcase',
  },
  {
    id: 'creative',
    name: 'Kreatif',
    description: 'Ekspresif, imajinatif, cocok untuk konten',
    icon: 'Sparkles',
  },
  {
    id: 'technical',
    name: 'Teknis',
    description: 'Presisi, detail, cocok untuk engineering',
    icon: 'Code',
  },
  {
    id: 'academic',
    name: 'Akademis',
    description: 'Ilmiah, terstruktur, cocok untuk riset',
    icon: 'GraduationCap',
  },
  {
    id: 'casual',
    name: 'Santai',
    description: 'Percakapan ringan, cocok untuk media sosial',
    icon: 'MessageCircle',
  },
]

export const PRESETS: PromptPreset[] = [
  {
    id: 'cc-instagram',
    title: 'Caption Instagram Viral',
    description: 'Buat caption Instagram yang menarik dan viral',
    prompt:
      'Buatkan caption Instagram untuk post tentang produktivitas kerja dari rumah yang relatable untuk anak muda Indonesia',
    mode: 'creative',
    model: 'claude-sonnet',
    category: 'content-creator',
  },
  {
    id: 'cc-youtube',
    title: 'Script YouTube',
    description: 'Buat script video YouTube yang engaging',
    prompt:
      'Buatkan script pembuka video YouTube 5 menit tentang tips belajar coding untuk pemula, gaya bahasa santai tapi informatif',
    mode: 'creative',
    model: 'openai-gpt4o',
    category: 'content-creator',
  },
  {
    id: 'cc-thread',
    title: 'Twitter/X Thread',
    description: 'Buat thread edukatif untuk Twitter/X',
    prompt:
      'Buatkan thread Twitter 7 tweet tentang kenapa AI tidak akan menggantikan pekerjaan manusia sepenuhnya, sertakan data dan contoh',
    mode: 'professional',
    model: 'claude-sonnet',
    category: 'content-creator',
  },
  {
    id: 'biz-proposal',
    title: 'Proposal Bisnis',
    description: 'Buat proposal bisnis yang persuasif',
    prompt:
      'Buatkan kerangka proposal bisnis untuk layanan konsultasi digital marketing UMKM di Indonesia, target market: pemilik toko online di Shopee/Tokopedia',
    mode: 'professional',
    model: 'claude-opus',
    category: 'business',
  },
  {
    id: 'biz-email',
    title: 'Email Penjualan',
    description: 'Buat cold email yang efektif',
    prompt:
      'Buatkan template cold email untuk menawarkan jasa pembuatan website ke pemilik restoran yang belum punya online presence',
    mode: 'professional',
    model: 'claude-sonnet',
    category: 'business',
  },
  {
    id: 'biz-copywriting',
    title: 'Landing Page Copy',
    description: 'Buat copywriting landing page yang konversi tinggi',
    prompt:
      'Buatkan copywriting landing page untuk aplikasi manajemen keuangan pribadi, target: milenial Indonesia umur 25-35 tahun',
    mode: 'creative',
    model: 'openai-gpt4o',
    category: 'business',
  },
  {
    id: 'edu-essay',
    title: 'Outline Esai Akademis',
    description: 'Buat kerangka esai ilmiah',
    prompt:
      'Buatkan outline esai akademis 2000 kata tentang dampak kecerdasan buatan terhadap sistem pendidikan di Indonesia, sertakan referensi framework',
    mode: 'academic',
    model: 'claude-opus',
    category: 'student',
  },
  {
    id: 'edu-literature',
    title: 'Review Literatur',
    description: 'Buat kerangka literature review',
    prompt:
      'Buatkan kerangka literature review tentang penggunaan machine learning dalam diagnosis penyakit tropis di Asia Tenggara',
    mode: 'academic',
    model: 'deepseek-v3',
    category: 'student',
  },
  {
    id: 'pro-report',
    title: 'Laporan Eksekutif',
    description: 'Buat laporan ringkas untuk manajemen',
    prompt:
      'Buatkan template laporan eksekutif bulanan untuk departemen IT, mencakup: pencapaian, masalah, rencana bulan depan, dan kebutuhan sumber daya',
    mode: 'professional',
    model: 'claude-sonnet',
    category: 'professional',
  },
  {
    id: 'pro-sop',
    title: 'SOP Perusahaan',
    description: 'Buat Standard Operating Procedure',
    prompt:
      'Buatkan SOP untuk proses onboarding karyawan baru di startup teknologi, dari hari pertama sampai minggu kedua',
    mode: 'professional',
    model: 'claude-opus',
    category: 'professional',
  },
  {
    id: 'tech-api',
    title: 'Dokumentasi API',
    description: 'Buat dokumentasi REST API yang jelas',
    prompt:
      'Buatkan dokumentasi REST API untuk endpoint user authentication (register, login, refresh token, logout) dengan contoh request/response',
    mode: 'technical',
    model: 'claude-sonnet',
    category: 'professional',
  },
  {
    id: 'tech-debug',
    title: 'Analisis Bug',
    description: 'Buat prompt untuk debugging sistematis',
    prompt:
      "Bantu analisis bug: aplikasi React saya crash saat user submit form dengan file upload lebih dari 5MB di mobile browser. Error: 'Maximum call stack size exceeded'",
    mode: 'technical',
    model: 'claude-opus',
    category: 'professional',
  },
]

export const TRANSFORM_LIMITS = {
  maxHistoryItems: 50,
  rateLimitPerMinute: 10,
  maxPromptLength: 5000,
  minPromptLength: 10,
} as const

export const CATEGORY_LABELS: Record<PromptPreset['category'], string> = {
  'content-creator': 'Content Creator',
  business: 'Pebisnis Online',
  student: 'Mahasiswa & Riset',
  professional: 'Profesional',
}
