import config from '/Users/oberon/Projects/coding/javascript/malevolent-crawler/playwright.config.mjs';
export default {
  ...config,
  testDir: '/Users/oberon/Projects/coding/javascript/malevolent-crawler/tests',
  use: { ...config.use, baseURL: 'http://127.0.0.1:4175' },
  webServer: { ...config.webServer, cwd: "/Users/oberon/Projects/coding/javascript/malevolent-crawler", command: 'npx http-server . -a 127.0.0.1 -p 4175 -c-1 --silent', url: 'http://127.0.0.1:4175' },
  reporter: [['list']],
  outputDir: '/tmp/phase6d-final-geometry-results'
};
