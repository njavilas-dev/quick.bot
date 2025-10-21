import { resolve } from 'path'
import { defineConfig, devices } from '@playwright/test'
import { env } from '@quickbot.io/env'

// eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
require('dotenv').config({ path: resolve(__dirname, '../../.env') })

export default defineConfig({
  timeout: process.env.CI ? 90 * 1000 : 60 * 1000,
  expect: {
    timeout: process.env.CI ? 20 * 1000 : 10 * 1000,
  },
  forbidOnly: !!process.env.CI,
  workers: 4,
  retries: 1,
  fullyParallel: true,
  reporter: process.env.CI
    ? [['github']]
    : [
      ['list'],
      ['html', { outputFolder: '../../tests/viewer-html-report' }],
    ],
  webServer: {
    command: 'bun run start',
    port: 3001,
    reuseExistingServer: true,
    timeout: 180_000,
  },
  outputDir: '../../tests/viewer',
  use: {
    trace: process.env.CI ? 'off' : 'retain-on-failure',
    locale: 'en-US',
    baseURL: env.NEXT_PUBLIC_VIEWER_URL[0],
    permissions: ['microphone'],
    ...devices['Desktop Chrome'],
    viewport: { width: 1400, height: 1000 },
    video: process.env.CI ? 'off' : 'retain-on-failure',
    screenshot: process.env.CI ? 'off' : 'only-on-failure',
    launchOptions: {
      headless: true,
      args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    },
  },
  projects: [
    {
      name: 'setup db',
      testMatch: /global\.setup\.ts/,
      testDir: '../builder/src/test',
    },
    {
      name: 'login',
      testMatch: /global\.login\.ts/,
      dependencies: ['setup db'],
      testDir: '../builder/src/test',
      use: {
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'tests',
      testMatch: /src\/test\/.*\.spec\.ts/,
      dependencies: ['login'],
      use: {
        storageState: resolve(__dirname, '../../tests/storageState.json'),
      },
    },
  ]
})
