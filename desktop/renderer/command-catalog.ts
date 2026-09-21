import type { DesktopCommandId as DesktopTransportCommandId } from '@/lib/desktop/contracts'
import type { ProductCommandId } from '@/lib/desktop/product-surface'

export interface CommandCatalogEntry {
  id: ProductCommandId
  slash: string
  summary: string
  transportCommand?: DesktopTransportCommandId
}

export const COMMAND_CATALOG: CommandCatalogEntry[] = [
  {
    id: 'help.show',
    slash: '/help',
    summary: 'Show available commands and badges',
    transportCommand: 'help:show',
  },
  {
    id: 'evaluate',
    slash: '/evaluate <prompt>',
    summary: 'Evaluate one prompt with the current provider',
    transportCommand: 'evaluate:run',
  },
  {
    id: 'library.list',
    slash: '/library',
    summary: 'Browse saved prompts from Library',
    transportCommand: 'library:list',
  },
  {
    id: 'library.search',
    slash: '/library search <query>',
    summary: 'Search saved prompts in Library',
    transportCommand: 'library:search',
  },
  {
    id: 'library.save',
    slash: '/library save',
    summary: 'Save the current output to Library',
    transportCommand: 'library:save',
  },
  {
    id: 'library.get',
    slash: '/library open <id>',
    summary: 'Open one saved library prompt',
    transportCommand: 'library:get',
  },
  {
    id: 'draft.list',
    slash: '/drafts',
    summary: 'List local draft prompts',
    transportCommand: 'draft:list',
  },
  {
    id: 'draft.save',
    slash: '/draft save',
    summary: 'Save the current run as a local draft',
    transportCommand: 'draft:save',
  },
  {
    id: 'draft.get',
    slash: '/draft open <id>',
    summary: 'Open one local draft prompt',
    transportCommand: 'draft:get',
  },
  {
    id: 'recent.list',
    slash: '/recent',
    summary: 'Open recent runs in the workbench',
    transportCommand: 'recent:list',
  },
  {
    id: 'benchmark.list',
    slash: '/benchmark list',
    summary: 'List saved benchmark cases',
    transportCommand: 'benchmark:list',
  },
  {
    id: 'benchmark.save',
    slash: '/benchmark save',
    summary: 'Save the current run as a benchmark case',
    transportCommand: 'benchmark:save',
  },
  {
    id: 'benchmark.run',
    slash: '/benchmark run <id>',
    summary: 'Run one saved benchmark case',
    transportCommand: 'benchmark:run',
  },
  {
    id: 'templates.list',
    slash: '/templates [category]',
    summary: 'Browse prompt templates by category',
    transportCommand: 'templates:list',
  },
  {
    id: 'provider.list',
    slash: '/provider list',
    summary: 'List configured providers',
    transportCommand: 'provider:list',
  },
  {
    id: 'provider.save',
    slash: '/provider save <provider> <api-key>',
    summary: 'Store one provider API key',
    transportCommand: 'provider:save',
  },
  {
    id: 'provider.delete',
    slash: '/provider delete <provider>',
    summary: 'Remove one saved provider key',
    transportCommand: 'provider:delete',
  },
  {
    id: 'usage.summary',
    slash: '/usage',
    summary: 'Show desktop usage summary',
    transportCommand: 'usage:summary',
  },
  {
    id: 'subscription.upgrade',
    slash: '/subscription upgrade <tier> <interval>',
    summary: 'Open subscription upgrade flow',
    transportCommand: 'subscription:upgrade',
  },
  {
    id: 'auth.login',
    slash: '/auth login <email> <password>',
    summary: 'Sign in to the desktop shell',
    transportCommand: 'auth:login',
  },
  {
    id: 'auth.register',
    slash: '/auth register <name> <email> <password>',
    summary: 'Create a new desktop account',
    transportCommand: 'auth:register',
  },
  {
    id: 'auth.logout',
    slash: '/auth logout',
    summary: 'Sign out from the desktop shell',
    transportCommand: 'auth:logout',
  },
]
