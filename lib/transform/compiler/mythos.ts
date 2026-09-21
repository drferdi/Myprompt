import type { CompilerOptions, CompilerProfileHandler } from './types'

export const mythosCompiler: CompilerProfileHandler = {
  compile(options: CompilerOptions): string {
    const {
      prompt,
      locale,
      temperature,
      maxTokens,
      effort,
      target,
      intent,
      intentInstruction,
      persona,
    } = options

    const sections: string[] = []

    // 1. <context>
    sections.push('<context>')
    sections.push(`- Role: ${persona.role}`)
    sections.push(
      '- Architectural synthesis: Synthesize architectural trade-offs, multi-component invariants, holistic system topology, and failure modes across layers.'
    )
    sections.push(`- Intent: ${intent}`)
    sections.push(`- Target audience: ${locale === 'id' ? 'Indonesia' : 'International'}`)
    sections.push(`- Communication style: ${persona.style}`)
    if (temperature > 1.2) {
      sections.push('- Reasoning depth: Maximal — explore non-obvious systemic interactions')
    } else if (temperature < 0.4) {
      sections.push('- Reasoning depth: Deterministic — prioritize strict verification and formal boundaries')
    }
    sections.push('</context>')

    // 2. <task>
    sections.push(`<task>\n${prompt}\n</task>`)

    // 3. <constraints>
    sections.push('<constraints>')
    sections.push(`- ${intentInstruction}`)
    sections.push(`- Limit response to ~${maxTokens} tokens`)

    if (locale === 'id') {
      sections.push('- Gunakan Bahasa Indonesia yang baik dan benar')
      sections.push('- Sesuaikan konteks dan referensi untuk audiens Indonesia')
    }

    // Direct-language directive
    sections.push(
      '- Please remove all mannered prose. Say what you mean directly. When a literal phrase is available, use it over metaphor.'
    )

    // Scope-boundary directive
    sections.push(
      '- Surgically edit targeted blocks; avoid whole-file rewrites. Do not fix or refactor pre-existing code unless directly requested.'
    )

    // Effort-specific anti-duplicate directive (only for xhigh and max)
    if (effort === 'xhigh' || effort === 'max') {
      sections.push(
        '- Do not draft the full deliverable in reasoning and again in output. Use reasoning space strictly to settle structure and resolve edge cases; produce the final deliverable only in the final output space.'
      )
    }

    // Agent batching nudge (only when target is explicitly agent)
    if (target === 'agent') {
      sections.push(
        "- First privately list what you need next; then request every item that doesn't depend on another's result in this one response."
      )
    }

    sections.push('- Do not add unsolicited disclaimers or conversational meta-explanations.')
    sections.push('</constraints>')

    // 4. <output_format>
    sections.push('<output_format>')
    sections.push(
      `Provide the final response directly inside the output space according to the requested task (${intent}).`
    )
    sections.push('Synthesize recommendations into high-order architectural trade-offs followed by concrete, actionable implementation specifications.')
    sections.push('</output_format>')

    sections.push('')
    sections.push('---')
    sections.push(
      `Model optimization: Claude Mythos 5 profile (effort: ${effort}, target: ${target})`
    )

    return sections.join('\n')
  },
}
