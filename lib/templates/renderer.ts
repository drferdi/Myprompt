// Drferdi Transformer Engine V2 — Template Renderer
import type { TemplateDefinition } from '@/types'

interface RenderContext {
  variables?: Record<string, string>
}

export function renderTemplate(
  template: TemplateDefinition,
  context: RenderContext = {},
  forLlm: boolean = false
): string {
  const { variables = {} } = context
  const t = template.template

  let output = `ROLE: ${t.role}\n\n`
  output += `TASK STRUCTURE:\n${t.taskStructure}\n\n`
  output += `CHAIN OF THOUGHT GUIDANCE:\n${t.cotGuidance}\n\n`
  output += `CONSTRAINTS:\n${t.constraints.map((c) => `- ${c}`).join('\n')}\n\n`
  output += `OUTPUT FORMAT:\n${t.formatSpec}`

  if (!forLlm) {
    output += `\n\nQUALITY CHECKLIST:\n${t.qualityChecklist.map((q) => `- [ ] ${q}`).join('\n')}`
  }

  // Replace template variables
  for (const [key, value] of Object.entries(variables)) {
    output = output.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }

  // Fill in defaults for remaining variables
  for (const variable of template.variables) {
    const placeholder = `{{${variable.name}}}`
    if (output.includes(placeholder) && variable.defaultValue) {
      output = output.replace(
        new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g'),
        variable.defaultValue
      )
    }
  }

  return output
}

export function extractVariables(template: TemplateDefinition): Array<{
  name: string
  description: string
  required: boolean
  defaultValue?: string
}> {
  return template.variables.map((v) => ({
    name: v.name,
    description: v.description,
    required: v.required,
    defaultValue: v.defaultValue,
  }))
}
