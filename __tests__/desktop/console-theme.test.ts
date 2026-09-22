import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const rendererCss = readFileSync(path.resolve(testDir, '../../desktop/renderer/index.css'), 'utf8')
const rendererHtml = readFileSync(
  path.resolve(testDir, '../../desktop/renderer/index.html'),
  'utf8'
)

describe('Sentra console visual contract', () => {
  it('contains long output without expanding the desktop layout', () => {
    expect(rendererCss).toMatch(/\.transcript[\s\S]*?overflow-wrap:\s*anywhere/)
    expect(rendererCss).toMatch(/\.line[\s\S]*?max-inline-size:\s*100%/)
  })

  it('uses the approved console palette tokens', () => {
    expect(rendererCss).toContain('--console-bg-app: #1a1a1a;')
    expect(rendererCss).toContain('--console-bg-window: #2b303b;')
    expect(rendererCss).toContain('--console-text: #d8dee9;')
    expect(rendererCss).toContain('--console-text-strong: #ffffff;')
    expect(rendererCss).toContain('--console-text-dim: #5c6370;')
    expect(rendererCss).toContain('--console-accent: #56b6c2;')
  })

  it('renders one window with a title bar and a transcript', () => {
    expect(rendererCss).toMatch(/\.window\s*\{[\s\S]*?background:\s*var\(--console-bg-window\)/)
    expect(rendererCss).toMatch(/\.window\s*\{[\s\S]*?border-radius:\s*10px/)
    expect(rendererCss).toMatch(/\.transcript\s*\{[\s\S]*?background:\s*var\(--console-bg-app\)/)
    expect(rendererCss).toMatch(/\.title-bar\s*\{[\s\S]*?cursor:\s*grab/)
  })

  it('preserves the existing workflow controls and drag exclusions', () => {
    for (const id of ['cmdInput', 'closeBtn', 'minimizeBtn', 'display', 'titleBar']) {
      expect(rendererHtml).toContain(`id="${id}"`)
    }

    expect(rendererCss).toMatch(/\.title-bar\s*\{[\s\S]*?-webkit-app-region:\s*no-drag/)
  })

  it('styles every class the renderer injects at runtime', () => {
    // Regression guard: renderer.ts builds this markup dynamically, so a CSS rewrite that
    // drops these selectors ships an unstyled console without breaking any other test.
    for (const cls of [
      'line',
      'type-sys',
      'type-user',
      'type-agent',
      'status-ok',
      'status-warn',
      'status-error',
      'meta-line',
      'quality-line',
      'tx-action',
      'tx-actions',
      'scramble-line',
    ]) {
      expect(rendererCss).toMatch(new RegExp(`\\.${cls}[\\s,:{)]`))
    }
  })

  it('keeps the compiled renderer bundle loadable as a classic script', () => {
    // renderer.js is emitted as CommonJS; without this shim the `exports` preamble throws
    // and every listener in the shell silently fails to register.
    expect(rendererHtml).toMatch(/<script>\s*var exports = \{\};\s*<\/script>/)
    expect(rendererHtml).toMatch(/<script src="\.\/renderer\.js">/)
  })
})
