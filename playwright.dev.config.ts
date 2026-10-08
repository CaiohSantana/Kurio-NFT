import { defineConfig } from '@playwright/test'
import config from './playwright.config'

export default defineConfig({ ...config,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-dev', open: 'never' }]],
  use: { ...config.use, baseURL: 'http://127.0.0.1:5174' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort', url: 'http://127.0.0.1:5174', reuseExistingServer: false },
})
