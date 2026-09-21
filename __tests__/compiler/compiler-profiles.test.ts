import { describe, it, expect } from 'vitest'
import { TransformRequestSchema } from '../../lib/transform/schemas'
import { transformPrompt } from '../../lib/transform/engine'


describe('Compiler Profiles & Effort Controls (Phase 1)', () => {
  describe('Schema Backward Compatibility & Validation', () => {
    it('parses legacy request payload without new fields with default values', () => {
      const legacyPayload = {
        prompt: 'Rancang sistem autentikasi multi-tenant dengan Next.js',
      }

      const parsed = TransformRequestSchema.parse(legacyPayload)
      expect(parsed.prompt).toBe('Rancang sistem autentikasi multi-tenant dengan Next.js')
      expect(parsed.profile).toBeUndefined()
      expect(parsed.effort).toBe('high')
      expect(parsed.target).toBe('general')
      expect(parsed.model).toBe('claude-sonnet')
      expect(parsed.mode).toBe('professional')
    })

    it('parses explicit profile, effort, and target options', () => {
      const payload = {
        prompt: 'Rancang sistem autentikasi multi-tenant dengan Next.js',
        profile: 'claude-fable-5',
        effort: 'xhigh',
        target: 'agent',
      }

      const parsed = TransformRequestSchema.parse(payload)
      expect(parsed.profile).toBe('claude-fable-5')
      expect(parsed.effort).toBe('xhigh')
      expect(parsed.target).toBe('agent')
    })

    it('rejects invalid profile or effort values', () => {
      expect(() => {
        TransformRequestSchema.parse({
          prompt: 'Rancang sistem autentikasi multi-tenant',
          profile: 'unsupported-model-9',
        })
      }).toThrow()

      expect(() => {
        TransformRequestSchema.parse({
          prompt: 'Rancang sistem autentikasi multi-tenant',
          effort: 'ultra-high',
        })
      }).toThrow()
    })
  })

  describe('Default Requests (Legacy Preservation)', () => {
    it('retains exact legacy compiler output when profile is omitted or default', () => {
      const rawPrompt = 'Buatkan arsitektur microservices untuk e-commerce platform'

      const legacyResult = transformPrompt({
        prompt: rawPrompt,
        model: 'claude-sonnet',
        mode: 'professional',
        temperature: 0.7,
        maxTokens: 1024,
        locale: 'id',
      })

      // Output must contain standard Drferdi CTE V2 sections and legacy footer
      expect(legacyResult.transformedPrompt).toContain('<role>')
      expect(legacyResult.transformedPrompt).toContain('<context>')
      expect(legacyResult.transformedPrompt).toContain('<task>')
      expect(legacyResult.transformedPrompt).toContain('<constraints>')
      expect(legacyResult.transformedPrompt).toContain('<output_format>')
      expect(legacyResult.transformedPrompt).toContain('Model optimization: Gunakan XML tags untuk struktur')
      expect(legacyResult.tokensEstimate).toBeGreaterThan(0)
    })
  })

  describe('Claude Fable 5 Compiler Profile', () => {
    it('enforces XML section order: <context>, <task>, <constraints>, <output_format>', () => {
      const rawPrompt = 'Implementasikan endpoint pembayaran webhook dengan HMAC signature'

      const result = transformPrompt({
        prompt: rawPrompt,
        model: 'claude-sonnet',
        mode: 'technical',
        temperature: 0.7,
        maxTokens: 2048,
        locale: 'id',
        profile: 'claude-fable-5',
        effort: 'high',
        target: 'general',
      })

      const promptText = result.transformedPrompt
      const contextIdx = promptText.indexOf('<context>')
      const taskIdx = promptText.indexOf('<task>')
      const constraintsIdx = promptText.indexOf('<constraints>')
      const outputFormatIdx = promptText.indexOf('<output_format>')

      expect(contextIdx).toBeGreaterThan(-1)
      expect(taskIdx).toBeGreaterThan(contextIdx)
      expect(constraintsIdx).toBeGreaterThan(taskIdx)
      expect(outputFormatIdx).toBeGreaterThan(constraintsIdx)
    })

    it('injects direct-language and scope-boundary directives', () => {
      const rawPrompt = 'Perbaiki modul billing agar tidak double charge saat retry'

      const result = transformPrompt({
        prompt: rawPrompt,
        model: 'claude-sonnet',
        mode: 'technical',
        temperature: 0.7,
        maxTokens: 1024,
        locale: 'id',
        profile: 'claude-fable-5',
        effort: 'high',
        target: 'general',
      })

      const promptText = result.transformedPrompt
      // Direct-language directive
      expect(promptText).toContain('Please remove all mannered prose')
      expect(promptText).toContain('When a literal phrase is available, use it over metaphor')

      // Scope-boundary directive
      expect(promptText).toContain('Surgically edit targeted blocks')
      expect(promptText).toContain('avoid whole-file rewrites')
      expect(promptText).toContain('Do not fix or refactor pre-existing code unless directly requested')
    })
  })

  describe('Claude Mythos 5 Compiler Profile', () => {
    it('applies extended architectural-synthesis framing with explicit output boundary', () => {
      const rawPrompt = 'Evaluasi arsitektur data ingestion pipeline untuk toleransi partisi jaringan'

      const result = transformPrompt({
        prompt: rawPrompt,
        model: 'claude-sonnet',
        mode: 'technical',
        temperature: 0.7,
        maxTokens: 3000,
        locale: 'en',
        profile: 'claude-mythos-5',
        effort: 'high',
        target: 'general',
      })

      const promptText = result.transformedPrompt
      // Architectural synthesis framing
      expect(promptText).toMatch(/architectural|synthesis|topology|trade-off/i)
      expect(promptText).toContain('<output_format>')
      expect(promptText).toContain('Please remove all mannered prose')
      expect(promptText).toContain('Surgically edit targeted blocks')
    })
  })

  describe('Effort-Specific Behavior (Anti-Duplication Guard)', () => {
    it('does NOT inject anti-duplicate-deliverable directive at low, medium, and high effort', () => {
      for (const effort of ['low', 'medium', 'high'] as const) {
        const result = transformPrompt({
          prompt: 'Buatkan fungsi validasi token JWT di middleware',
          model: 'claude-sonnet',
          mode: 'technical',
          temperature: 0.7,
          maxTokens: 1024,
          locale: 'id',
          profile: 'claude-fable-5',
          effort,
          target: 'general',
        })

        expect(result.transformedPrompt).not.toContain(
          'Do not draft the full deliverable in reasoning and again in output'
        )
      }
    })

    it('injects observable anti-duplicate directive ONLY at xhigh and max effort', () => {
      for (const effort of ['xhigh', 'max'] as const) {
        const result = transformPrompt({
          prompt: 'Buatkan fungsi validasi token JWT di middleware',
          model: 'claude-sonnet',
          mode: 'technical',
          temperature: 0.7,
          maxTokens: 1024,
          locale: 'id',
          profile: 'claude-fable-5',
          effort,
          target: 'general',
        })

        expect(result.transformedPrompt).toContain(
          'Do not draft the full deliverable in reasoning and again in output'
        )
        expect(result.transformedPrompt).toContain(
          'produce the final deliverable only in the final output space'
        )
      }
    })
  })

  describe('Agent Batching Nudge (Explicit Targeting)', () => {
    it('does NOT activate agent batching when target is general, even if prompt mentions agents or tools', () => {
      const result = transformPrompt({
        prompt: 'Build an autonomous agent with tool execution and multi-step batch tools',
        model: 'claude-sonnet',
        mode: 'technical',
        temperature: 0.7,
        maxTokens: 1024,
        locale: 'en',
        profile: 'claude-fable-5',
        effort: 'high',
        target: 'general', // Explicitly general
      })

      expect(result.transformedPrompt).not.toContain(
        "First privately list what you need next; then request every item that doesn't depend on another's result in this one response"
      )
    })

    it('activates agent batching nudge ONLY when target is explicitly agent', () => {
      const result = transformPrompt({
        prompt: 'Inspect database connections and check active pools',
        model: 'claude-sonnet',
        mode: 'technical',
        temperature: 0.7,
        maxTokens: 1024,
        locale: 'en',
        profile: 'claude-fable-5',
        effort: 'high',
        target: 'agent', // Explicitly agent
      })

      expect(result.transformedPrompt).toContain(
        "First privately list what you need next; then request every item that doesn't depend on another's result in this one response"
      )
    })
  })

  describe('Transform Surface UI Controls Contract', () => {
    it('declares profile and effort controls in desktop index.html', async () => {
      const fs = await import('node:fs')
      const path = await import('node:path')
      const htmlPath = path.resolve(__dirname, '../../desktop/renderer/index.html')
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8')

      expect(htmlContent).toContain('id="transformControls"')
      expect(htmlContent).toContain('id="transformProfileSwitch"')
      expect(htmlContent).toContain('data-profile="default"')
      expect(htmlContent).toContain('data-profile="claude-fable-5"')
      expect(htmlContent).toContain('data-profile="claude-mythos-5"')

      expect(htmlContent).toContain('id="transformEffortSwitch"')
      expect(htmlContent).toContain('data-effort="low"')
      expect(htmlContent).toContain('data-effort="medium"')
      expect(htmlContent).toContain('data-effort="high"')
      expect(htmlContent).toContain('data-effort="xhigh"')
      expect(htmlContent).toContain('data-effort="max"')
    })
  })
})

