Feature('Tenant Login');

Scenario('tenant can login successfully and persist auth state', async ({ I }) => {
  const email = process.env.E2E_TENANT_EMAIL || 'owner1@gmail.com';
  const password = process.env.E2E_TENANT_PASSWORD || '123456';

  I.amOnPage('/pages/public/login');
  I.see('Đăng nhập');

  I.usePlaywrightTo('mock tenant-login API', async ({ page }) => {
    await page.route('**/Auth/tenant-login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isSuccess: true,
          message: 'Login successful',
          data: {
            accessToken: 'e2e-access-token',
            refreshToken: 'e2e-refresh-token',
            userInfo: {
              id: 'e2e-tenant-id',
              email,
              fullName: 'E2E Tenant',
              role: 'tenant',
              avatar: null,
            },
          },
        }),
      });
    });
  });

  I.fillField('input[name="email"]', email);
  I.fillField('input[name="password"]', password);
  I.click('button[type="submit"]');

  I.waitForText('Đăng nhập thành công', 10);

  I.usePlaywrightTo('verify auth storage after tenant-login', async ({ page }) => {
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    const authStorage = await page.evaluate(() => localStorage.getItem('auth-storage'));

    if (!refreshToken || !authStorage) {
      throw new Error('Auth tokens were not saved to localStorage after login.');
    }
  });
});

Scenario('tenant login fails with invalid credentials and does not persist auth state', async ({ I }) => {
  const email = process.env.E2E_TENANT_EMAIL || 'tenant.e2e@example.com';
  const wrongPassword = 'WrongPassword@123';
  const errorMessage = 'Sai tài khoản hoặc mật khẩu';

  I.amOnPage('/pages/public/login');
  I.see('Đăng nhập');

  I.usePlaywrightTo('clear localStorage before invalid login attempt', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  I.usePlaywrightTo('mock tenant-login API failure', async ({ page }) => {
    await page.route('**/Auth/tenant-login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isSuccess: false,
          message: errorMessage,
          data: null,
        }),
      });
    });
  });

  I.fillField('input[name="email"]', email);
  I.fillField('input[name="password"]', wrongPassword);
  I.click('button[type="submit"]');

  I.waitForText(errorMessage, 10);
  I.seeInCurrentUrl('/pages/public/login');

  I.usePlaywrightTo('verify auth storage is not persisted after failed login', async ({ page }) => {
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    const authStorage = await page.evaluate(() => localStorage.getItem('auth-storage'));

    if (refreshToken || authStorage) {
      throw new Error('Auth storage should be empty after failed login.');
    }
  });
});
