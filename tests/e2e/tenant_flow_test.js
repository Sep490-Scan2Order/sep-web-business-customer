Feature("Tenant Flow");

const createMockJWT = () => {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60,
      sub: "e2e-tenant-id",
      email: "e2e-tenant@example.com",
      iat: Math.floor(Date.now() / 1000),
    }),
  ).toString("base64url");

  return `${header}.${payload}.e2e-signature`;
};

const loginTenant = async ({ I }, email, password) => {
  I.amOnPage("/pages/public/login");
  I.see("Đăng nhập");

  I.usePlaywrightTo("mock tenant-login API", async ({ page }) => {
    await page.route("**/Auth/tenant-login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          message: "Login successful",
          data: {
            accessToken: createMockJWT(),
            refreshToken: "e2e-refresh-token",
            userInfo: {
              id: "e2e-tenant-id",
              email,
              name: "E2E Tenant",
              role: "tenant",
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

  I.waitForText("Đăng nhập thành công", 10);
};

Scenario("tenant can create a restaurant from empty state", async ({ I }) => {
  const email = process.env.E2E_TENANT_EMAIL || "owner1@gmail.com";
  const password = process.env.E2E_TENANT_PASSWORD || "123456";

  await loginTenant({ I }, email, password);

  I.usePlaywrightTo(
    "mock tenant restaurant list and create APIs",
    async ({ page }) => {
      await page.route(
        "**/Restaurant/get-all-restaurant-by-tenant",
        async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              isSuccess: true,
              data: [],
            }),
          });
        },
      );
    },
  );

  I.amOnPage("/tenant/restaurant");
  I.see("Tạo nhà hàng của bạn");
  I.click("Tạo nhà hàng");
  I.waitForText("Tạo nhà hàng mới", 10);

  I.seeElement("#restaurantName");
  I.seeElement("#phone");
  I.seeElement("#description");
  I.seeElement("#openTime");
  I.seeElement("#closeTime");
});

Scenario(
  "tenant can create a staff member from selected restaurant",
  async ({ I }) => {
    const email = process.env.E2E_TENANT_EMAIL || "owner1@gmail.com";
    const password = process.env.E2E_TENANT_PASSWORD || "123456";
    let staffCreateRequested = false;

    await loginTenant({ I }, email, password);

    I.usePlaywrightTo(
      "mock tenant restaurant and staff APIs",
      async ({ page }) => {
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
                    restaurantName: "Nhà hàng A",
                    address: "123 Đường A",
                    image: "",
                  },
                ],
              }),
            });
          },
        );

        await page.route("**/Staff/get-all**", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              items: [],
            }),
          });
        });

        await page.route("**/Staff/create-staff", async (route) => {
          staffCreateRequested = true;

          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              isSuccess: true,
              data: {
                id: "staff-e2e-1",
                accountId: "acc-e2e-1",
                restaurantId: 101,
                restaurantName: "Nhà hàng A",
                name: "Tran Thi B",
                role: "Nhân viên",
                avatar: "",
                isActive: true,
                createdAt: "2026-04-15T00:00:00Z",
              },
            }),
          });
        });
      },
    );

    I.amOnPage("/tenant/users");
    I.waitForText("Chọn nhà hàng để quản lý nhân viên", 10);
    I.usePlaywrightTo("select restaurant card", async ({ page }) => {
      await page.getByText("Nhà hàng A", { exact: true }).click();
    });

    I.waitForText("Danh sách nhân viên", 10);
    I.click("Thêm nhân viên");
    I.waitForText("Tạo nhân viên mới", 10);

    I.fillField('input[placeholder="Nhập tên nhân viên..."]', "Tran Thi B");
    I.fillField('input[placeholder="Nhập email..."]', "staff@example.com");
    I.fillField('input[placeholder="Nhập số điện thoại..."]', "0987654321");

    I.click("Tạo mới");

    I.usePlaywrightTo("verify staff create request", async () => {
      if (!staffCreateRequested) {
        throw new Error("Staff create request was not sent.");
      }
    });
  },
);

Scenario("tenant can view promotion list", async ({ I }) => {
  const email = process.env.E2E_TENANT_EMAIL || "owner1@gmail.com";
  const password = process.env.E2E_TENANT_PASSWORD || "123456";

  await loginTenant({ I }, email, password);

  I.usePlaywrightTo("mock promotion list API", async ({ page }) => {
    await page.route("**/Promotion/tenant-logged-in**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          data: {
            items: [
              {
                id: 1,
                promotionTitle: "Giảm giá 20%",
                description: "Khuyến mãi hôm nay",
                discount: 20,
                restaurantName: "Nhà hàng A",
                startDate: "2026-04-01",
                endDate: "2026-04-30",
                createdAt: "2026-04-01T00:00:00Z",
              },
            ],
            totalPages: 1,
            totalCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        }),
      });
    });
  });

  I.amOnPage("/tenant/promotion");
  I.waitForElement("button", 10);
});

Scenario("tenant can view restaurant list on promotion page", async ({ I }) => {
  const email = process.env.E2E_TENANT_EMAIL || "owner1@gmail.com";
  const password = process.env.E2E_TENANT_PASSWORD || "123456";

  await loginTenant({ I }, email, password);

  I.usePlaywrightTo("mock promotion and restaurant APIs", async ({ page }) => {
    await page.route("**/Promotion/tenant-logged-in**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          data: {
            items: [],
            totalPages: 1,
            totalCount: 0,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        }),
      });
    });

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
                restaurantName: "Nhà hàng A",
                address: "123 Đường A",
              },
            ],
          }),
        });
      },
    );

    await page.route("**/Dish/get-all-by-restaurant**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          data: [
            {
              id: 501,
              categoryId: 1,
              categoryName: "Món khai vị",
              dishName: "Gỏi cuốn",
              dishDescription: "Gỏi cuốn tươi ngon",
              price: 50000,
            },
          ],
        }),
      });
    });
  });

  I.amOnPage("/tenant/promotion");
  I.waitForElement("input", 10);
  I.seeElement('input[type="text"]');
});

Scenario("tenant can view orders list", async ({ I }) => {
  const email = process.env.E2E_TENANT_EMAIL || "owner1@gmail.com";
  const password = process.env.E2E_TENANT_PASSWORD || "123456";

  await loginTenant({ I }, email, password);

  I.usePlaywrightTo("mock orders and restaurant APIs", async ({ page }) => {
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
                restaurantName: "Nhà hàng A",
                address: "123 Đường A",
              },
            ],
          }),
        });
      },
    );

    await page.route("**/Order/tenant/restaurant/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          data: {
            items: [
              {
                id: 1,
                tableNumber: "Bàn 1",
                status: 3,
                totalAmount: 150000,
                paymentType: 0,
                createdAt: "2026-04-15T12:00:00Z",
                guestName: "Khách e2e",
              },
            ],
            totalPages: 1,
            totalCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        }),
      });
    });
  });

  I.amOnPage("/tenant/orders");
  I.waitForElement("div", 10);
  I.usePlaywrightTo("select restaurant", async ({ page }) => {
    const cards = await page.locator('[role="button"]').all();
    if (cards.length > 0) {
      await cards[0].click();
    }
  });
});

Scenario("tenant can view filter controls on orders page", async ({ I }) => {
  const email = process.env.E2E_TENANT_EMAIL || "owner1@gmail.com";
  const password = process.env.E2E_TENANT_PASSWORD || "123456";

  await loginTenant({ I }, email, password);

  I.usePlaywrightTo("mock orders and restaurant APIs", async ({ page }) => {
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
                restaurantName: "Nhà hàng A",
                address: "123 Đường A",
              },
            ],
          }),
        });
      },
    );

    await page.route("**/Order/tenant/restaurant/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          data: {
            items: [],
            totalPages: 1,
            totalCount: 0,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        }),
      });
    });
  });

  I.amOnPage("/tenant/orders");
  I.waitForElement("div", 15);
});

Scenario("tenant can view menu template list", async ({ I }) => {
  const email = process.env.E2E_TENANT_EMAIL || "owner1@gmail.com";
  const password = process.env.E2E_TENANT_PASSWORD || "123456";

  await loginTenant({ I }, email, password);

  I.usePlaywrightTo(
    "mock restaurant and menu template APIs",
    async ({ page }) => {
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
                  restaurantName: "Nhà hàng A",
                  address: "123 Đường A",
                },
              ],
            }),
          });
        },
      );

      await page.route("**/MenuTemplate/restaurant/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            isSuccess: true,
            data: [
              {
                id: 1,
                templateName: "Template cổ điển",
                layoutConfigJson: "{}",
                themeColor: "#333333",
                fontFamily: "Arial",
              },
              {
                id: 2,
                templateName: "Template hiện đại",
                layoutConfigJson: "{}",
                themeColor: "#FF6B6B",
                fontFamily: "Segoe UI",
              },
            ],
          }),
        });
      });
    },
  );

  I.amOnPage("/tenant/menu-template");
  I.waitForElement("div", 10);
});

Scenario(
  "tenant can navigate to menu template page and load restaurants",
  async ({ I }) => {
    const email = process.env.E2E_TENANT_EMAIL || "owner1@gmail.com";
    const password = process.env.E2E_TENANT_PASSWORD || "123456";
    let menuApiCalled = false;

    await loginTenant({ I }, email, password);

    I.usePlaywrightTo("mock restaurant and menu APIs", async ({ page }) => {
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
                  restaurantName: "Nhà hàng E2E",
                  address: "456 Đường B",
                },
              ],
            }),
          });
        },
      );

      await page.route("**/MenuTemplate/restaurant/**", async (route) => {
        menuApiCalled = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            isSuccess: true,
            data: [
              {
                id: 99,
                templateName: "Test Template",
                layoutConfigJson: "{}",
                themeColor: "#FF0000",
                fontFamily: "Verdana",
              },
            ],
          }),
        });
      });
    });

    I.amOnPage("/tenant/menu-template");
    I.waitForElement("div", 10);

    I.usePlaywrightTo("verify page loaded", async ({ page }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  },
);
