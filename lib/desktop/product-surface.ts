export const PRODUCT_SURFACE = {
  primaryModes: [
    {
      id: 'transform',
      title: 'Transform',
      subtitle: 'Deterministic prompt scaffolder',
    },
    {
      id: 'optimize',
      title: 'Optimizer',
      subtitle: 'LLM-backed super-prompt editor',
    },
  ],
  commandGroups: [
    {
      id: 'discover',
      commands: [{ id: 'help.show' }],
    },
    {
      id: 'quality',
      commands: [{ id: 'evaluate' }],
    },
    {
      id: 'library',
      commands: [
        { id: 'library.list' },
        { id: 'library.search' },
        { id: 'library.save' },
        { id: 'library.get' },
      ],
    },
    {
      id: 'workspace',
      commands: [
        { id: 'draft.list' },
        { id: 'draft.save' },
        { id: 'draft.get' },
        { id: 'recent.list' },
      ],
    },
    {
      id: 'benchmark',
      commands: [{ id: 'benchmark.list' }, { id: 'benchmark.save' }, { id: 'benchmark.run' }],
    },
    {
      id: 'templates',
      commands: [{ id: 'templates.list' }],
    },
    {
      id: 'settings',
      commands: [
        { id: 'provider.list' },
        { id: 'provider.save' },
        { id: 'provider.delete' },
        { id: 'usage.summary' },
        { id: 'subscription.upgrade' },
      ],
    },
    {
      id: 'auth',
      commands: [{ id: 'auth.login' }, { id: 'auth.register' }, { id: 'auth.logout' }],
    },
  ],
  sidebarGroups: [
    {
      id: 'tools',
      label: 'Tools',
      items: [
        {
          id: 'optimizer',
          title: 'Optimizer',
          url: '/optimizer',
          description: 'Transform ideas into Super Prompts',
        },
        {
          id: 'evaluator',
          title: 'Evaluator',
          url: '/evaluator',
          description: 'Score and improve prompts',
        },
        {
          id: 'library',
          title: 'Library',
          url: '/library',
          description: 'Saved prompts collection',
        },
        {
          id: 'templates',
          title: 'Templates',
          url: '/templates',
          description: 'Browse prompt templates',
        },
      ],
    },
    {
      id: 'system',
      label: 'System',
      items: [
        {
          id: 'settings',
          title: 'Settings',
          url: '/settings',
          description: 'API keys & preferences',
        },
      ],
    },
  ],
} as const

export type ProductPrimaryModeId = (typeof PRODUCT_SURFACE.primaryModes)[number]['id']
export type ProductCommandId =
  (typeof PRODUCT_SURFACE.commandGroups)[number]['commands'][number]['id']
export type ProductSidebarItemId =
  (typeof PRODUCT_SURFACE.sidebarGroups)[number]['items'][number]['id']
