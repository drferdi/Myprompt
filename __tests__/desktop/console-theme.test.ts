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

  it('lays text out in character cells: one font size, a two-space margin, a six-character prefix column, 72-character prose', () => {
    expect(rendererCss).toContain('--console-size-body: 13px;')
    expect(rendererCss).toContain('--console-size-chrome: 13px;')
    expect(rendererCss).toContain('--console-margin: 2ch;')
    expect(rendererCss).toContain('--console-prefix: 6ch;')
    expect(rendererCss).toContain('--console-prose: 72ch;')
    expect(rendererCss).toMatch(/\.line\s*\{[\s\S]*?padding-left:\s*var\(--console-margin\)/)
    expect(rendererCss).toMatch(
      /\.line\.status-ok,\s*\.line\.status-warn,\s*\.line\.status-error\s*\{[\s\S]*?padding-left:\s*var\(--console-prefix\);[\s\S]*?text-indent:\s*calc\(-1 \* var\(--console-prefix\)\)/
    )
    expect(rendererCss).toMatch(/\.prompt-line\s*\{[\s\S]*?padding-left:\s*var\(--console-margin\)/)
    expect(rendererCss).toMatch(/\.title\s*\{[\s\S]*?position:\s*relative;[\s\S]*?top:\s*1px/)
    expect(rendererCss).not.toMatch(/font-size:\s*1[0-2]px/)
  })

  it('keeps the font token and never drops a size token below 11px', () => {
    // Guard: an edit that removes --console-font or shrinks a size token breaks the
    // locked contract (JetBrains Mono, one 13px size), whatever else it changes.
    expect(rendererCss).toMatch(/--console-font:\s*'JetBrains Mono'/)
    const sizeTokens = Array.from(rendererCss.matchAll(/--console-size-[\w-]+:\s*([\d.]+)px;/g))
    expect(sizeTokens.length).toBeGreaterThan(0)
    for (const match of sizeTokens) {
      expect(Number(match[1])).toBeGreaterThanOrEqual(11)
    }
  })

  it('uses the approved console palette tokens', () => {
    expect(rendererCss).toContain('--console-bg-app: #1e2227;')
    expect(rendererCss).toContain('--console-bg-window: #1e2227;')
    expect(rendererCss).toContain('--console-text: #c5cad3;')
    expect(rendererCss).toContain('--console-text-strong: #ffffff;')
    expect(rendererCss).toContain('--console-text-dim: #8a929e;')
    expect(rendererCss).toContain('--console-accent: #2bbac5;')
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
      'banner-title',
      'banner-subtitle',
      'banner-rule',
      'banner-hint',
      'banner-blank',
      'banner-session',
      'banner-example',
      'banner-command',
      'blank-line',
      'cell-probe',
      'seg-bright',
      'seg-dim',
      'seg-label',
      'seg-cmd',
      'seg-heading',
      'seg-dir',
      'seg-file',
    ]) {
      expect(rendererCss).toMatch(new RegExp(`\\.${cls}[\\s,:{)]`))
    }
  })

  it('keeps the compiled renderer bundle loadable as a classic script', () => {
    // strings.js and renderer.js are emitted as CommonJS; without this shim the `exports`
    // preamble and renderer.js's require('./strings') throw and every listener in the shell
    // silently fails to register. strings.js must load first so the shared exports object
    // is populated before renderer.js requires it.
    expect(rendererHtml).toMatch(
      /<script>\s*var exports = \{\}; function require\(id\) \{ if \(id === '\.\/strings'\) return exports; throw new Error\('Unknown module: ' \+ id\) \}\s*<\/script>/
    )
    expect(rendererHtml).toMatch(/<script src="\.\/strings\.js">[\s\S]*<script src="\.\/renderer\.js">/)
    expect(rendererHtml).toMatch(/<script src="\.\/renderer\.js">/)
  })

  it('carries the build-time version placeholder the banner reads', () => {
    // desktop:build replaces the placeholder with package.json's version while copying
    // index.html into dist-electron; the renderer reads the meta tag at boot.
    expect(rendererHtml).toContain('<meta name="sentra-version" content="__SENTRA_VERSION__">')
  })
})
