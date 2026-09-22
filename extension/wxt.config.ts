import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Sentra Prompt',
    description: 'Transform raw prompts into structured super prompts — right from your browser.',
    permissions: ['storage'],
    action: {
      default_title: 'Sentra Prompt',
    },
  },
});
