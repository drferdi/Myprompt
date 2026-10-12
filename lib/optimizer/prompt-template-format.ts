// Prompt Template parser — port of the Metaprompt notebook's extract_prompt / extract_variables.

export interface ParsedPromptTemplate {
  /** Template body with the Metaprompt's own `{$VAR}` placeholders. */
  template: string
  /** Brace contents as extract_variables returns them (e.g. `$EMAIL`), deduplicated and sorted. */
  variables: string[]
}

/** A Metaprompt response that cannot yield a complete template; its message is shown as is. */
export class PromptTemplateError extends Error {
  override name = 'PromptTemplateError'
}

const LEADING_VARIABLES_PATTERN = /^\[([^\]]+)\]\s+([\s\S]+)$/
const INSTRUCTIONS_PATTERN = /<Instructions>([\s\S]+?)<\/Instructions>/
const TRAILING_EMPTY_TAG_PATTERN = /<(\w+)><\/\1>$/
const VARIABLE_PATTERN = /\{([^}]+)\}/g

/**
 * Reads the notebook's optional VARIABLES from a leading `[A, B] task` list, normalized like the
 * notebook (`strip().lstrip("$").upper()`). Without a list the task is returned untouched.
 */
export function splitTemplateVariables(rawIdea: string): { task: string; variables: string[] } {
  const match = LEADING_VARIABLES_PATTERN.exec(rawIdea.trim())
  const variables = (match?.[1] ?? '')
    .split(',')
    .map((name) => name.trim().replace(/^\$+/, '').toUpperCase())
    .filter((name) => name !== '')
  if (!match || variables.length === 0) {
    return { task: rawIdea, variables: [] }
  }
  return { task: match[2].trim(), variables }
}

function removeTrailingEmptyTag(text: string): string {
  return text.replace(TRAILING_EMPTY_TAG_PATTERN, '')
}

/** Throws when the response holds no closed `<Instructions>` block, which also catches a cut-off response. */
export function parsePromptTemplate(raw: string): ParsedPromptTemplate {
  const match = raw.match(INSTRUCTIONS_PATTERN)
  if (!match) {
    throw new PromptTemplateError(
      'No <Instructions> block found in the response. Run the same request again.'
    )
  }

  // Same double pass as the notebook: an empty tag can sit before or after the trim.
  const template = removeTrailingEmptyTag(removeTrailingEmptyTag(match[1]).trim()).trim()
  const variables = new Set(Array.from(template.matchAll(VARIABLE_PATTERN), ([, name]) => name))

  return { template, variables: [...variables].sort() }
}
