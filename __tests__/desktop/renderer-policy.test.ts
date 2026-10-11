import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { expect, test } from 'vitest'

test('renderer permits its exact bootstrap shim without arbitrary inline execution', () => {
  const html = readFileSync('desktop/renderer/index.html', 'utf8')
  const policy = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/u)?.[1]
  expect(policy).toBeDefined()
  const scripts = policy?.split(';').find((directive) => directive.trim().startsWith('script-src'))
  expect(scripts).toBeDefined()
  expect(scripts).not.toContain("'unsafe-inline'")
  expect(scripts).not.toContain("'unsafe-eval'")
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/gu)) {
    const hash = createHash('sha256').update(match[1]).digest('base64')
    expect(scripts).toContain(`'sha256-${hash}'`)
  }
})
