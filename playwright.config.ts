import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './browser',
  fullyParallel: true,
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:3851', trace: 'retain-on-failure' },
  projects: ['chromium', 'firefox', 'webkit'].map(name => ({ name, use: { browserName: name as 'chromium' | 'firefox' | 'webkit' } })),
  webServer: [{
    command: 'bun run browser/fixture/server.ts',
    url: 'http://127.0.0.1:3851/health',
    reuseExistingServer: false,
  }, {
    command: "YVEE_BUN_PORT=3852 bun run test/yvee-bun/server.ts",
    url: "http://127.0.0.1:3852/",
    reuseExistingServer: false,
  }],
});
