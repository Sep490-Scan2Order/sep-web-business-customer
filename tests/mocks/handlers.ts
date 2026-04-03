import { http, HttpResponse } from "msw";

// Simple JWT creation for mock purposes
// JWT format: header.payload.signature
// We create valid format but don't verify signature in client-side
const createMockJWT = () => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor(Date.now() / 1000) + 4 * 60 * 60; // 4 hours from now
  const payload = btoa(
    JSON.stringify({
      exp,
      sub: "test-user",
      email: "tenant@example.com",
      iat: Math.floor(Date.now() / 1000),
    })
  );
  const signature = btoa("mock-signature");
  return `${header}.${payload}.${signature}`;
};

export const handlers = [
  http.get("/health", () => {
    return HttpResponse.json({ ok: true });
  }),

  // Login endpoint handler
  http.post("/Auth/tenant-login", async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    // Valid credentials
    if (body.email === "tenant@example.com" && body.password === "password123") {
      return HttpResponse.json(
        {
          isSuccess: true,
          data: {
            accessToken: createMockJWT(),
            refreshToken: "refresh_token_mock",
            userInfo: {
              id: "tenant-1",
              email: "tenant@example.com",
              name: "Test Tenant",
              role: "tenant",
              avatar: null,
            },
          },
          message: "Login successful",
        },
        { status: 200 }
      );
    }

    // Invalid credentials
    return HttpResponse.json(
      {
        isSuccess: false,
        message: "Email hoặc mật khẩu không đúng",
      },
      { status: 401 }
    );
  }),

  // Category endpoints
  http.get("/Category/get-category-by-tenantId/:tenantId", ({ params }) => {
    const { tenantId } = params;
    
    // Return mock categories
    if (tenantId === "tenant-1") {
      return HttpResponse.json(
        {
          isSuccess: true,
          data: [
            {
              id: 1,
              categoryName: "Đồ ăn nhanh",
              tenantId: "tenant-1",
              createdDate: "2024-01-01T00:00:00",
              status: 1,
            },
            {
              id: 2,
              categoryName: "Đồ uống",
              tenantId: "tenant-1",
              createdDate: "2024-01-02T00:00:00",
              status: 1,
            },
          ],
          message: "Success",
        },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      {
        isSuccess: false,
        message: "Tenant not found",
      },
      { status: 404 }
    );
  }),

  http.post("/Category/create-category", async ({ request }) => {
    const body = (await request.json()) as { categoryName?: string };

    if (!body.categoryName) {
      return HttpResponse.json(
        {
          isSuccess: false,
          message: "Invalid category name",
        },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        isSuccess: true,
        data: {
          id: 3,
          categoryName: body.categoryName,
          tenantId: "tenant-1",
          createdDate: new Date().toISOString(),
          status: 1,
        },
        message: "Category created successfully",
      },
      { status: 201 }
    );
  }),

  http.put("/Category/update-category/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as { categoryName?: string };

    if (!body.categoryName) {
      return HttpResponse.json(
        {
          isSuccess: false,
          message: "Invalid category name",
        },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        isSuccess: true,
        data: {
          id: parseInt(id as string),
          categoryName: body.categoryName,
          tenantId: "tenant-1",
          createdDate: "2024-01-01T00:00:00",
          status: 1,
        },
        message: "Category updated successfully",
      },
      { status: 200 }
    );
  }),

  http.delete("/Category/delete-category/:id", ({ params }) => {
    const { id } = params;

    if (!id) {
      return HttpResponse.json(
        {
          isSuccess: false,
          message: "Invalid category id",
        },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        isSuccess: true,
        data: true,
        message: "Category deleted successfully",
      },
      { status: 200 }
    );
  }),
];
