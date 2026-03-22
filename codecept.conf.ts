/// <reference types='codeceptjs' />

const dotenv = require('dotenv');

// CodeceptJS does not auto-load .env like Next.js, so load it explicitly.
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const e2eBaseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';

/** @type {CodeceptJS.MainConfig} */
exports.config = {
  tests: './tests/e2e/**/*_test.js',
  output: './output',
  helpers: {
    Playwright: {
      url: e2eBaseUrl,
      show: !process.env.HEADLESS,
      browser: 'chromium'
    }
  },
  include: {
    I: './steps_file.js'
  },
  plugins: {
    // Bật Allure Report
    allure: {
      enabled: true,
      require: '@codeceptjs/allure-legacy',
      outputDir: './output/allure-results'
    },
    // Tự động chụp màn hình khi test lỗi
    screenshotOnFail: {
      enabled: true
    }
  },
  name: 's2o-frontend-test'
}