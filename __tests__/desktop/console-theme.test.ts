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
  it('uses the approved Sentra DesignOption material tokens', () => {
    expect(rendererCss).toContain('--bg-deep: #0D0F14;')
    expect(rendererCss).toContain('--card-bg: #161922;')
    expect(rendererCss).toContain('--text-primary: #F2F4F7;')
    expect(rendererCss).toContain('--text-secondary: #9CA3AF;')
    expect(rendererCss).toContain('--text-muted: #6B7280;')
    expect(rendererCss).toContain('--accent: #3B82F6;')
  })

  it('renders a card enclosure with a recessed console display', () => {
    expect(rendererCss).toMatch(/\.console-body\s*\{[\s\S]*?background:\s*var\(--card-bg\)/)
    expect(rendererCss).toMatch(/\.console-box\s*\{[\s\S]*?background:\s*var\(--bg-deep\)/)
    expect(rendererCss).toMatch(/\.console-box\s*\{[\s\S]*?box-shadow:\s*inset/)
    expect(rendererCss).toMatch(/\.card-header\s*\{[\s\S]*?cursor:\s*grab/)
    // The rack hardware from the previous theme must stay collapsed.
    expect(rendererCss).toMatch(
      /\.front-panel,\s*\.top-vent-section,[\s\S]*?display:\s*none\s*!important/
    )
  })

  it('preserves the existing workflow controls and drag exclusions', () => {
    for (const id of [
      'transformModeBtn',
      'optimizeModeBtn',
      'cmdInput',
      'clearBtn',
      'runBtn',
      'copyLastBtn',
      'miniToggleBtn',
      'powerBtn',
    ]) {
      expect(rendererHtml).toContain(`id="${id}"`)
    }

    expect(rendererCss).toMatch(
      /\.window-controls, \.mode-bar,[\s\S]*-webkit-app-region:\s*no-drag/
    )
  })

  it('styles every class the renderer injects at runtime', () => {
    // Regression guard: renderer.ts builds this markup dynamically, so a CSS rewrite that
    // drops these selectors ships an unstyled console without breaking any other test.
    for (const cls of [
      'shell-badges',
      'shell-badge',
      'tone-danger',
      'line',
      'type-sys',
      'type-agent',
      'line-has-copy',
      'copy-line-btn',
      'output-action-row',
      'output-action-btn',
      'suggestion-panel',
      'suggestion-chip',
      'suggestion-copy',
      'slash-palette',
      'catalog-item',
      'overlay-panel',
      'overlay-panel-header',
      'overlay-panel-body',
      'panel-close-btn',
      'workbench-empty',
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
