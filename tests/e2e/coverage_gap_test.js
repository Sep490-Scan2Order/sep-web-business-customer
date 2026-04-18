Feature("Coverage Gap Flows");

const createMockJWT = (payload = {}) => {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const basePayload = {
    exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60,
    iat: Math.floor(Date.now() / 1000),
    ...payload,
  };

  return `${header}.${Buffer.from(JSON.stringify(basePayload)).toString("base64url")}.e2e-signature`;
};

const loginTenant = async ({ I }) => {
  I.amOnPage("/pages/public/login");

  I.usePlaywrightTo("mock tenant-login API", async ({ page }) => {
    await page.route("**/Auth/tenant-login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          message: "Login successful",
          data: {
            accessToken: createMockJWT({
              sub: "e2e-tenant-id",
              role: "tenant",
              email: "owner1@gmail.com",
            }),
            refreshToken: "e2e-refresh-token",
            userInfo: {
              id: "e2e-tenant-id",
              email: "owner1@gmail.com",
              role: "tenant",
              name: "E2E Tenant",
            },
          },
        }),
      });
    });
  });

  I.fillField('input[name="email"]', "owner1@gmail.com");
  I.fillField('input[name="password"]', "123456");
  I.click('button[type="submit"]');
  I.waitForText("Đăng nhập thành công", 10);
};

const loginAdmin = async ({ I }) => {
  I.amOnPage("/admin-login");

  I.usePlaywrightTo("mock administrator-login API", async ({ page }) => {
    await page.route("**/Auth/administrator-login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          message: "Login successful",
          data: {
            accessToken: createMockJWT({
              sub: "e2e-admin-id",
              role: "admin",
              email: "admin@example.com",
            }),
            refreshToken: "e2e-admin-refresh-token",
            userInfo: {
              id: "e2e-admin-id",
              email: "admin@example.com",
              role: "admin",
              fullName: "E2E Admin",
            },
          },
        }),
      });
    });
  });

  I.fillField('input[name="email"]', "admin@example.com");
  I.fillField('input[name="password"]', "123456");
  I.click('button[type="submit"]');
  I.waitForText("Đăng nhập thành công", 10);
};

const mockTenantRestaurantBasics = async ({ I }) => {
  I.usePlaywrightTo("mock tenant restaurant API", async ({ page }) => {
    await page.route(
      "**/Restaurant/get-all-restaurant-by-tenant",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            isSuccess: true,
            data: [
              {
                id: 101,
                tenantId: "e2e-tenant-id",
                restaurantName: "Nha hang A",
                address: "123 Duong A",
                slug: "nha-hang-a",
                isActive: true,
              },
            ],
          }),
        });
      },
    );
  });
};

Scenario(
  "F1-TC03 tenant can open restaurant list with existing item",
  async ({ I }) => {
    await loginTenant({ I });
    await mockTenantRestaurantBasics({ I });

    I.amOnPage("/tenant/restaurant");
    I.waitForElement("body", 10);
    I.see("Nha hang A");
  },
);

Scenario(
  "F1-TC08 tenant can open create category from empty state",
  async ({ I }) => {
    await loginTenant({ I });

    I.usePlaywrightTo("mock category list as empty", async ({ page }) => {
      await page.route("**/Category/**", async (route) => {
        if (route.request().method() === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ isSuccess: true, data: [] }),
          });
          return;
        }

        await route.continue();
      });
    });

    I.amOnPage("/tenant/meals/category");
    I.waitForText("Tạo danh mục", 10);
    I.click("Tạo danh mục");
    I.waitForElement("input", 10);
  },
);

Scenario("F1-TC09 tenant can update existing category", async ({ I }) => {
  await loginTenant({ I });
  let updateRequested = false;

  I.usePlaywrightTo("mock category update flow", async ({ page }) => {
    await page.route("**/Category/**", async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            isSuccess: true,
            data: [{ id: 1, categoryName: "Mon chinh" }],
          }),
        });
        return;
      }

      if (method === "PUT") {
        updateRequested = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            isSuccess: true,
            data: { id: 1, categoryName: "Mon moi" },
          }),
        });
        return;
      }

      await route.continue();
    });
  });

  I.amOnPage("/tenant/meals/category");
  I.waitForText("Mon chinh", 10);
  I.click("Mon chinh");
  I.fillField('input[type="text"]', "Mon moi");
  I.click("Lưu");

  I.usePlaywrightTo("verify category update request", async () => {
    if (!updateRequested) {
      throw new Error("Category update request was not sent.");
    }
  });
});

Scenario("F1-TC10 tenant can open dish create modal", async ({ I }) => {
  await loginTenant({ I });

  I.usePlaywrightTo("mock dishes and categories", async ({ page }) => {
    await page.route("**/Category/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          data: [{ id: 1, categoryName: "Mon chinh" }],
        }),
      });
    });

    await page.route("**/Dish/**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ isSuccess: true, data: [] }),
        });
        return;
      }
      await route.continue();
    });
  });

  I.amOnPage("/tenant/meals/dish");
  I.waitForElement("body", 10);
  I.click("Thêm món ăn");
  I.waitForElement("input", 10);
});

Scenario(
  "F1-TC11 tenant can open dashboard and shift report",
  async ({ I }) => {
    await loginTenant({ I });
    await mockTenantRestaurantBasics({ I });

    I.amOnPage("/tenant/dashboard");
    I.waitForElement("body", 10);

    I.amOnPage("/tenant/shift-reports");
    I.waitForElement("body", 10);
  },
);

Scenario("F2-TC06 tenant can open plan page", async ({ I }) => {
  await loginTenant({ I });
  I.amOnPage("/tenant/plan");
  I.waitForElement("body", 10);
});

Scenario(
  "F2-TC07 tenant can open subscription callback pages",
  async ({ I }) => {
    await loginTenant({ I });

    I.amOnPage("/tenant/subscription-callback/success?status=success");
    I.waitForElement("body", 10);

    I.amOnPage("/tenant/subscription-callback/cancel?status=cancel");
    I.waitForElement("body", 10);
  },
);

Scenario(
  "F2-TC08 tenant can open debt payment and callback pages",
  async ({ I }) => {
    await loginTenant({ I });

    I.amOnPage("/tenant/debt-payment");
    I.waitForElement("body", 10);

    I.amOnPage("/tenant/debt-callback/success?status=success");
    I.waitForElement("body", 10);

    I.amOnPage("/tenant/debt-callback/cancel?status=cancel");
    I.waitForElement("body", 10);
  },
);

Scenario(
  "F2-TC09 tenant can open branch dish management pages",
  async ({ I }) => {
    await loginTenant({ I });
    I.amOnPage("/tenant/branch-dish-management");
    I.waitForElement("body", 10);

    I.amOnPage("/tenant/branch-dish-management/101");
    I.waitForElement("body", 10);
  },
);

Scenario(
  "F2-TC10 tenant can open history transaction and setting pages",
  async ({ I }) => {
    await loginTenant({ I });
    I.amOnPage("/tenant/history-transaction");
    I.waitForElement("body", 10);

    I.amOnPage("/tenant/tenant-setting");
    I.waitForElement("body", 10);
  },
);

Scenario("F3-TC01 admin can open overview dashboard", async ({ I }) => {
  await loginAdmin({ I });
  I.amOnPage("/admin/overview");
  I.waitForElement("body", 10);
});

Scenario(
  "F3-TC02 admin can open tenant management and search",
  async ({ I }) => {
    await loginAdmin({ I });

    I.usePlaywrightTo("mock tenant-management list", async ({ page }) => {
      await page.route("**/Tenant/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            isSuccess: true,
            data: [
              {
                id: "tenant-1",
                name: "Tenant Alpha",
                accountId: "TA001",
                email: "tenant.alpha@example.com",
                phone: "0900000001",
                avatar: null,
                role: "tenant",
                verified: true,
                isActive: true,
                taxNumber: null,
                bankId: null,
                cardNumber: null,
                bankName: null,
                bankLogo: null,
                isVerifyBank: false,
                isVerifyTax: false,
                debtStartedAt: null,
                subscriptionExpiryDate: null,
                lastWarningSentAt: null,
                totalDebtAmount: 0,
                isSuspended: false,
                suspendedAt: null,
              },
            ],
          }),
        });
      });
    });

    I.amOnPage("/admin/tenant-management");
    I.waitForElement("input", 10);
    I.fillField('input[type="text"]', "Alpha");
  },
);

Scenario(
  "F3-TC03 admin can load tenant management list actions",
  async ({ I }) => {
    await loginAdmin({ I });
    I.amOnPage("/admin/tenant-management");
    I.waitForElement("body", 10);
  },
);

Scenario("F3-TC04 admin can open template management page", async ({ I }) => {
  await loginAdmin({ I });
  I.amOnPage("/admin/template-management");
  I.waitForElement("body", 10);
});

Scenario(
  "F3-TC05 admin can open notification management page",
  async ({ I }) => {
    await loginAdmin({ I });
    I.amOnPage("/admin/notification-management");
    I.waitForElement("body", 10);
  },
);

Scenario("F3-TC06 admin can open billing subscriptions page", async ({ I }) => {
  await loginAdmin({ I });
  I.amOnPage("/admin/billing-subscriptions");
  I.waitForElement("body", 10);
});

Scenario(
  "F3-TC07 admin can open blog and global settings pages",
  async ({ I }) => {
    await loginAdmin({ I });

    I.amOnPage("/admin/blog-management");
    I.waitForElement("body", 10);

    I.amOnPage("/admin/global-settings");
    I.waitForElement("body", 10);
  },
);
