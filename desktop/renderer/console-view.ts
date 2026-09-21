import type { DesktopPrimaryModeId } from './modes'

const MODE_COPY: Record<
  DesktopPrimaryModeId,
  {
    title: string
    tag: string
    copy: string
    subtitle: string
    placeholder: string
  }
> = {
  transform: {
    title: 'Transform',
    tag: 'Zero Cost',
    copy: 'Wrap raw prompts into a deterministic prompt-engineering scaffold.',
    subtitle: 'Deterministic prompt shell',
    placeholder: 'Masukkan prompt mentah untuk dibungkus...',
  },
  optimize: {
    title: 'Optimizer',
    tag: 'LLM Mode',
    copy: 'Generate a Grok-backed Super Prompt with provider-aware structure.',
    subtitle: 'LLM-backed prompt shell',
    placeholder: 'Masukkan ide mentah untuk dioptimalkan...',
  },
}

export function appendConsoleLine(
  display: HTMLElement,
  type: 'sys' | 'user' | 'agent',
  text: string
) {
  const line = document.createElement('div')
  line.className = `line type-${type}`
  line.textContent = text
  display.appendChild(line)
  display.scrollTop = display.scrollHeight
}

export function applyMode(
  shell: HTMLElement,
  mode: DesktopPrimaryModeId,
  modeButtons: HTMLElement[],
  input?: HTMLInputElement | null
) {
  const copy = MODE_COPY[mode]
  const modeSubtitle = document.getElementById('modeSubtitle') as HTMLElement | null
  const statusTitle = document.getElementById('statusTitle') as HTMLElement | null
  const statusTag = document.getElementById('statusTag') as HTMLElement | null
  const statusCopy = document.getElementById('statusCopy') as HTMLElement | null

  shell.dataset.mode = mode

  if (modeSubtitle) {
    modeSubtitle.textContent = copy.subtitle
  }

  if (statusTitle) {
    statusTitle.textContent = copy.title
  }

  if (statusTag) {
    statusTag.textContent = copy.tag
  }

  if (statusCopy) {
    statusCopy.textContent = copy.copy
  }

  if (input) {
    input.placeholder = copy.placeholder
  }

  for (const button of modeButtons) {
    button.classList.toggle('active', button.dataset.mode === mode)
  }
}

export function resetConsoleView(display: HTMLElement, mode: DesktopPrimaryModeId) {
  display.innerHTML = ''
  appendConsoleLine(display, 'sys', '[BOOT] Sentra Prompt Console ready.')
  appendConsoleLine(display, 'agent', `${MODE_COPY[mode].title} mode active.`)
  appendConsoleLine(
    display,
    'sys',
    '[INFO] Commands: /evaluate, /library search, /templates list, /usage summary.'
  )
}
