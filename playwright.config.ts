import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/e2e/results',
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  timeout: 30_000,
})
