# Integration Testing Guide - Login Form & Auth Guard

Hướng dẫn viết integration tests cho **login form flow** và **auth guard flow** sử dụng Vitest + React Testing Library + MSW.

---

## 1. Khái Niệm Cơ Bản

### Integration Test là gì?
- Test **nhiều components + modules cùng hoạt động**
- Khác unit test: không mock tất cả dependencies
- Khác E2E test: chạy trong Node.js (jsdom), không dùng browser thực
- **Mục đích**: Verify logic flow (form → API → state → UI update)

### Stack sử dụng
```
Vitest 4.1.0        ← Test runner
React Testing RTL   ← Component interaction
MSW 2.12.14         ← Mock API responses
Zustand             ← State management
```

---

## 2. Cấu Trúc Thư Mục

```
tests/
├── integration/                    # Integration tests
│   ├── login-form.test.tsx        # Login form flow
│   ├── auth-guard.test.tsx        # Auth guard redirect logic
│   └── [feature].test.tsx         # Thêm test cho feature khác
├── unit/                           # Unit tests (isolated)
├── setup/
│   ├── vitest.setup.ts            # Global setup
│   └── test-utils.tsx             # Custom render wrapper
└── mocks/
    ├── handlers.ts                # MSW request handlers
    └── server.ts                  # MSW server instance
```

---

## 3. Login Form Flow Test

### 3.1 Kiến Trúc

```
┌─────────────────────────────────────┐
│   MockLoginForm Component           │
│  - State: email, password, loading  │
│  - Handler: form submit             │
└─────────────────────────┬───────────┘
                          │
                    fetch("/Auth/tenant-login")
                          │
                ┌─────────▼──────────┐
                │  MSW Handler       │
                │ ✓ Valid: 200 + JWT │
                │ ✗ Invalid: 401     │
                └─────────┬──────────┘
                          │
            ┌─────────────▼────────────────┐
            │  Zustand authStore           │
            │  - setAuth(user, token)      │
            │  - localStorage persist      │
            └─────────────┬────────────────┘
                          │
                    ┌─────▼─────┐
                    │  UI Update │
                    │  - Success │
                    │  - Error   │
                    └───────────┘
```

### 3.2 Viết Test

**File: `tests/integration/login-form.test.tsx`**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "@/src/store/authStore";

/**
 * Step 1: Setup component
 */
function MockLoginForm() {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/Auth/tenant-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.isSuccess) {
        const { accessToken, userInfo, refreshToken } = data.data;
        setAuth(userInfo, accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        data-testid="email-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        data-testid="password-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

/**
 * Step 2: Describe + Setup
 */
describe("Integration: Login Form Flow", () => {
  beforeEach(() => {
    // Reset state trước mỗi test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    localStorage.clear();
  });

  /**
   * Test 1: Happy path - Login thành công
   */
  it("should login successfully with valid credentials", async () => {
    // Arrange: Setup user event helper
    const user = userEvent.setup();
    render(<MockLoginForm />);

    // Act: Tương tác với form
    await user.type(screen.getByTestId("email-input"), "tenant@example.com");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.click(screen.getByRole("button"));

    // Assert: Verify kết quả
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.email).toBe("tenant@example.com");
      expect(authState.token).toBeTruthy();
    });

    // Verify localStorage
    expect(localStorage.getItem("refreshToken")).toBe("refresh_token_mock");
  });

  /**
   * Test 2: Sad path - Login failed
   */
  it("should handle login failure with invalid credentials", async () => {
    const user = userEvent.setup();
    render(<MockLoginForm />);

    await user.type(screen.getByTestId("email-input"), "wrong@example.com");
    await user.type(screen.getByTestId("password-input"), "wrong");
    await user.click(screen.getByRole("button"));

    // MSW sẽ trả 401 (configured trong handlers.ts)
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
    });
  });

  /**
   * Test 3: Form state during async operation
   */
  it("should show loading state during form submission", async () => {
    const user = userEvent.setup();
    render(<MockLoginForm />);

    const submitButton = screen.getByRole("button");
    expect(submitButton).not.toBeDisabled();

    await user.type(screen.getByTestId("email-input"), "tenant@example.com");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.click(submitButton);

    // Sau khi hoàn tất, button trở lại normal state
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
```

### 3.3 Best Practices

| ✅ Làm | ❌ Không Làm |
|------|-----------|
| Dùng `data-testid` cho input | Dùng `id` hoặc class selectors |
| Dùng `userEvent.setup()` và `user.type()` | `fireEvent` (không giống user behavior) |
| Mock chỉ API endpoint, không mock component | Mock tất cả dependencies |
| Test behavior (người dùng thấy gì) | Test implementation details |
| Dùng `waitFor()` cho async | Dùng `setTimeout` |

---

## 4. Auth Guard Flow Test

### 4.1 Kiến Trúc

```
┌──────────────────────────────────┐
│  AuthProvider (wrapper)          │
│  - Check: isAuthenticated?       │
│  - Check: token expired?         │
│  - Check: role authorized?       │
└───────┬──────────────┬───────────┘
        │              │
   ┌────▼─────┐   ┌───▼──────┐
   │   Pass    │   │  Fail    │
   │   ↓       │   │   ↓      │
   │ Render    │   │ Redirect │
   │ children  │   │ router.  │
   │           │   │ replace()│
   └───────────┘   └──────────┘
```

### 4.2 Viết Test

**File: `tests/integration/auth-guard.test.tsx`**

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/src/components/providers/AuthProvider";
import { useAuthStore, isTokenExpired } from "@/src/store/authStore";
import { useRouter } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => "/tenant/dashboard"),
}));

/**
 * Step 1: Mock protected page component
 */
function MockProtectedPage() {
  const { user, isAuthenticated } = useAuthStore();
  return (
    <div>
      <h1>Protected Dashboard</h1>
      {isAuthenticated && user ? (
        <p data-testid="welcome-message">Welcome, {user.name}!</p>
      ) : (
        <p data-testid="no-access">No access</p>
      )}
    </div>
  );
}

/**
 * Step 2: Test wrapper - Để test AuthProvider behavior
 */
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider requiredRole="tenant" redirectTo="/">
      {children}
    </AuthProvider>
  );
}

describe("Integration: Auth Guard Flow", () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);

    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: true,
    });
    localStorage.clear();
  });

  /**
   * Test 1: Authenticated user → Page renders
   */
  it("should allow access to protected page when authenticated", async () => {
    // Arrange: Setup authenticated state
    const mockUser = {
      id: "tenant-1",
      email: "tenant@example.com",
      name: "Test Tenant",
      role: "tenant",
      avatar: null,
    };
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTksInN1YiI6InRlc3QtdXNlciIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTcxNjM5Njc0N30.mock";

    useAuthStore.setState({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      _hasHydrated: true,
    });

    // Act: Render protected page
    render(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    // Assert: Welcome message should appear
    await waitFor(() => {
      expect(screen.getByTestId("welcome-message")).toBeInTheDocument();
    });
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  /**
   * Test 2: No login → Redirect
   */
  it("should redirect when user is not authenticated", async () => {
    render(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/");
    });
  });

  /**
   * Test 3: Token expired → Logout + Redirect
   */
  it("should redirect when token is expired", async () => {
    // Token với exp trong quá khứ
    const expiredToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDAsInN1YiI6InRlc3QtdXNlciIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTcxNjM5Njc0N30.mock";

    useAuthStore.setState({
      user: {
        id: "tenant-1",
        email: "tenant@example.com",
        name: "Test Tenant",
        role: "tenant",
        avatar: null,
      },
      token: expiredToken,
      isAuthenticated: true,
      _hasHydrated: true,
    });

    // Verify token is expired
    expect(isTokenExpired(expiredToken)).toBe(true);

    render(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    // Should redirect và clear auth
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/");
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  /**
   * Test 4: Wrong role → Access denied
   */
  it("should enforce role-based access control", async () => {
    useAuthStore.setState({
      user: {
        id: "admin-1",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin", // ← Wrong role
        avatar: null,
      },
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTksInN1YiI6ImFkbWluLXVzZXIiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwiaWF0IjoxNzE2Mzk2NzQ3fQ.mock",
      isAuthenticated: true,
      _hasHydrated: true,
    });

    render(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/");
    });
  });

  /**
   * Test 5: State persistence across re-renders
   */
  it("should persist login state across page reloads", async () => {
    const mockUser = {
      id: "tenant-1",
      email: "tenant@example.com",
      name: "Test Tenant",
      role: "tenant",
      avatar: null,
    };

    useAuthStore.setState({
      user: mockUser,
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTksInN1YiI6InRlc3QtdXNlciIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTcxNjM5Njc0N30.mock",
      isAuthenticated: true,
      _hasHydrated: true,
    });

    const { rerender } = render(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("welcome-message")).toBeInTheDocument();
    });

    // Simulate re-render (page reload)
    rerender(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    // Should still show protected content
    expect(screen.getByTestId("welcome-message")).toBeInTheDocument();
  });
});
```

### 4.3 Best Practices

| ✅ Làm | ❌ Không Làm |
|------|-----------|
| Mock `useRouter` với `vi.mock()` | Không mock router |
| Set `_hasHydrated: true` để bypass hydration check | Quên set hydration state |
| Test redirect call: `expect(router.replace).toHaveBeenCalled()` | Test actual navigation |
| Verify auth state changes: `useAuthStore.getState()` | Chỉ check UI |
| Test expired token logic: `isTokenExpired()` function | Skip token validation |

---

## 5. MSW Handler Configuration

### 5.1 Login Endpoint Handler

**File: `tests/mocks/handlers.ts`**

```typescript
import { http, HttpResponse } from "msw";

// Helper: Create valid JWT token
const createMockJWT = () => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor(Date.now() / 1000) + 4 * 60 * 60; // 4 hours
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
  // Login endpoint
  http.post("/Auth/tenant-login", async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    // Valid credentials
    if (
      body.email === "tenant@example.com" &&
      body.password === "password123"
    ) {
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
```

### 5.2 Thêm Handler Tạm Thời Trong Test

```typescript
import { server } from "@/tests/mocks/server";
import { http, HttpResponse } from "msw";

it("should handle 500 server error", async () => {
  // Override default handler cho test này
  server.use(
    http.post("/Auth/tenant-login", () => {
      return HttpResponse.json(
        { message: "Server error" },
        { status: 500 }
      );
    })
  );

  // Test code...
  // Sau test, handler được reset tự động
});
```

---

## 6. Chạy & Debug Tests

### Run Commands

```bash
# Run all tests once
npm run test:unit

# Watch mode (rerun khi file thay đổi)
npm run test:unit:watch

# Coverage report
npm run test:coverage

# Run chỉ 1 file
npm run test:unit -- tests/integration/login-form.test.tsx

# Run chỉ test có tên matching
npm run test:unit -- --grep "should login successfully"
```

### Debug Tips

```typescript
// 1. Log trong test
console.log("Auth state:", useAuthStore.getState());

// 2. Screen debug (hiểu DOM structure)
import { screen } from "@testing-library/react";
screen.debug(); // Print DOM

// 3. Check MSW logs
import { server } from "@/tests/mocks/server";
server.listen({ onUnhandledRequest: "error" });

// 4. Timeout issue?
await waitFor(
  () => {
    expect(something).toBe(true);
  },
  { timeout: 5000 } // Increase timeout
);
```

---

## 7. Expanding Tests - Ví Dụ Mở Rộng

### 7.1 Test Form Validation

```typescript
it("should show error when email is empty", async () => {
  const user = userEvent.setup();
  render(<MockLoginForm />);

  await user.type(screen.getByTestId("password-input"), "password123");
  await user.click(screen.getByRole("button"));

  // Không gọi API nếu validation fail
  expect(mockFetch).not.toHaveBeenCalled();
});
```

### 7.2 Test Multiple Roles

```typescript
describe("Auth Guard with Multiple Roles", () => {
  it("should allow tenant role", async () => {
    useAuthStore.setState({ user: { role: "tenant" }, isAuthenticated: true });
    render(
      <AuthProvider requiredRole={["admin", "tenant"]}>
        <MockProtectedPage />
      </AuthProvider>
    );
    expect(screen.getByTestId("welcome-message")).toBeInTheDocument();
  });

  it("should allow admin role", async () => {
    useAuthStore.setState({ user: { role: "admin" }, isAuthenticated: true });
    render(
      <AuthProvider requiredRole={["admin", "tenant"]}>
        <MockProtectedPage />
      </AuthProvider>
    );
    expect(screen.getByTestId("welcome-message")).toBeInTheDocument();
  });
});
```

### 7.3 Test Token Refresh

```typescript
it("should refresh token when expired", async () => {
  server.use(
    http.post("/Auth/refresh-token", () => {
      return HttpResponse.json({
        isSuccess: true,
        data: { accessToken: createMockJWT() },
      });
    })
  );

  // Trigger refresh...
  expect(localStorage.getItem("auth_token")).toBeTruthy();
});
```

---

## 8. Checklist Khi Viết Integration Test

- [ ] Clear `beforeEach()` setup (state + localStorage)
- [ ] Render component với wrapper providers (nếu cần)
- [ ] Dùng `userEvent.setup()` cho user interactions
- [ ] Dùng `waitFor()` cho async operations
- [ ] Assert trên state (`useAuthStore.getState()`) hoặc DOM
- [ ] Mock router nếu test redirect behavior
- [ ] Add MSW handler nếu gọi API endpoint
- [ ] Test happy path + error cases
- [ ] Clean up mocks (`vi.clearAllMocks()`)

---

## 9. Tài Liệu Tham Khảo

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library Best Practices](https://testing-library.com/docs/queries/about)
- [MSW Getting Started](https://mswjs.io/docs/getting-started)
- [Zustand Testing](https://github.com/pmndrs/zustand#testing)

---

## 10. Hướng Dẫn Viết E2E Test (CodeceptJS + Playwright + Allure)

Phần này dành cho test end-to-end chạy trên browser thật.

### 10.1 Khi nào dùng E2E?

- Dùng khi cần kiểm tra luồng thật từ góc nhìn người dùng.
- Dùng cho happy path quan trọng: login, checkout, payment callback, phân quyền route.
- Không dùng E2E để test logic nhỏ (logic đó nên để unit/integration).

---

### 10.2 Stack và cấu hình đang dùng trong project

- Test runner: CodeceptJS
- Browser engine: Playwright (chromium)
- Báo cáo: Allure
- Config chính: codecept.conf.ts
- File test mẫu: tests/e2e/tenant_login_test.js

Config hiện tại:

```ts
exports.config = {
  tests: './tests/e2e/**/*_test.js',
  output: './output',
  helpers: {
    Playwright: {
      url: process.env.E2E_BASE_URL || 'http://localhost:3000',
      show: !process.env.HEADLESS,
      browser: 'chromium'
    }
  },
  plugins: {
    allure: {
      enabled: true,
      require: '@codeceptjs/allure-legacy',
      outputDir: './output/allure-results'
    },
    screenshotOnFail: {
      enabled: true
    }
  }
}
```

---

### 10.3 Cấu trúc file E2E nên dùng

```text
tests/e2e/
├── tenant_login_test.js
├── auth_guard_test.js
├── subscription_flow_test.js
└── profile_update_test.js
```

Quy ước tên file: [feature]_test.js

---

### 10.4 Mẫu E2E test hoàn chỉnh cho login

```js
Feature('Tenant Login');

Scenario('tenant can login successfully and persist auth state', async ({ I }) => {
  const email = process.env.E2E_TENANT_EMAIL || 'owner1@gmail.com';
  const password = process.env.E2E_TENANT_PASSWORD || '123456';

  I.amOnPage('/pages/public/login');
  I.see('Đăng nhập');

  // Mock API login để test ổn định và không phụ thuộc backend thật
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

  // Assert state lưu vào localStorage
  I.usePlaywrightTo('verify auth storage after tenant-login', async ({ page }) => {
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    const authStorage = await page.evaluate(() => localStorage.getItem('auth-storage'));

    if (!refreshToken || !authStorage) {
      throw new Error('Auth tokens were not saved to localStorage after login.');
    }
  });
});
```

---

### 10.5 Mẫu fail case cho login

```js
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
```

---

### 10.6 Command chạy E2E trong project

```bash
# Chạy toàn bộ E2E
npm run test:e2e

# Chạy riêng luồng tenant login
npm run test:e2e:tenant-login

# Chạy E2E + generate Allure report
npm run test:e2e:report

# Mở Allure report
npm run allure:open
```

Lưu ý:
- Nếu thiếu browser binary thì chạy: npx playwright install chromium
- Nếu app chưa chạy thì E2E sẽ fail ở bước open page

---

### 10.7 Viết test auth guard kiểu E2E (gợi ý)

```js
Feature('Auth Guard');

Scenario('redirects guest user when opening protected tenant page', async ({ I }) => {
  I.amOnPage('/tenant/dashboard');

  // Tùy app logic, bạn assert login page hoặc trang public
  I.waitInUrl('/pages/public/login', 10);
  I.see('Đăng nhập');
});
```

Mở rộng:
- Case token hết hạn: inject auth-storage với token expired rồi mở route protected
- Case đúng role: inject auth-storage hợp lệ rồi assert nội dung dashboard
- Case sai role: inject role admin vào route tenant và assert redirect/access denied

---

### 10.8 Best practices cho E2E

| Nen lam | Khong nen lam |
|---|---|
| Mock API ở mức network (page.route) cho flow quan trọng | Phụ thuộc backend thật cho mọi test |
| Assert hành vi user nhìn thấy (text, url, toast) | Assert implementation details nội bộ |
| Verify side effects quan trọng (localStorage, cookies) | Chỉ assert 1 text rồi kết thúc |
| Mỗi scenario tập trung 1 hành vi chính | Nhồi quá nhiều bước vào 1 scenario |
| Dùng env cho credentials/base URL | Hardcode toàn bộ giá trị môi trường |

---

### 10.9 Checklist trước khi merge E2E

- [ ] Test pass ở local với headless mode
- [ ] Không phụ thuộc dữ liệu backend thật khi không cần thiết
- [ ] Có ít nhất 1 happy path và 1 fail path cho flow quan trọng
- [ ] Có ảnh fail trong output khi scenario lỗi
- [ ] Allure report generate được và có kết quả rõ ràng
- [ ] Selector ổn định (ưu tiên name, data-testid, role)
