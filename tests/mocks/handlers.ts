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
];
