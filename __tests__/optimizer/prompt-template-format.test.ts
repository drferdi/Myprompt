import { describe, expect, it } from 'vitest'

import { parsePromptTemplate, splitTemplateVariables } from '@/lib/optimizer/prompt-template-format'

const RESPONSE = `<Inputs>
{$CUSTOMER_EMAIL}
{$COMPANY_NAME}
</Inputs>
<Instructions Structure>
Put the long email first, then the directions.
</Instructions Structure>
<Instructions>
You are a support agent for {$COMPANY_NAME}.

<customer_email>
{$CUSTOMER_EMAIL}
</customer_email>

Write your reply inside <reply> tags.
<reply></reply>
</Instructions>`

describe('parsePromptTemplate', () => {
  it('extracts the Instructions block, not the Instructions Structure plan', () => {
    const { template } = parsePromptTemplate(RESPONSE)

    expect(template.startsWith('You are a support agent')).toBe(true)
    expect(template).not.toContain('Put the long email first')
  })

  it('strips the trailing empty tag pair', () => {
    const { template } = parsePromptTemplate(RESPONSE)

    expect(template.endsWith('Write your reply inside <reply> tags.')).toBe(true)
  })

  it('keeps {$VAR} as written and lists each variable once, sorted, like extract_variables', () => {
    const { template, variables } = parsePromptTemplate(RESPONSE)

    expect(template).toContain('You are a support agent for {$COMPANY_NAME}.')
    expect(template).toContain('{$CUSTOMER_EMAIL}')
    expect(variables).toEqual(['$COMPANY_NAME', '$CUSTOMER_EMAIL'])
  })

  it('throws when the response has no closed Instructions block (e.g. cut off)', () => {
    expect(() => parsePromptTemplate('<Inputs>\n{$X}\n</Inputs>\n<Instructions>\nHalf a')).toThrow(
      'No <Instructions> block'
    )
  })
})

describe('splitTemplateVariables', () => {
  it('reads a leading [..] list the way the notebook formats VARIABLES', () => {
    expect(splitTemplateVariables('[email, $Company Name ] Balas email keluhan')).toEqual({
      task: 'Balas email keluhan',
      variables: ['EMAIL', 'COMPANY NAME'],
    })
  })

  it('leaves a task without a leading list untouched', () => {
    expect(splitTemplateVariables('Balas email [segera]')).toEqual({
      task: 'Balas email [segera]',
      variables: [],
    })
  })
})
