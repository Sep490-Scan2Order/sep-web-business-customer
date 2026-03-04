# Authentication Provider Documentation

## Tổng quan

Hệ thống Authentication Provider giúp bảo vệ các trang trong ứng dụng bằng cách kiểm tra:
1. User đã đăng nhập chưa (authentication)
2. User có đúng role yêu cầu không (authorization)

Nếu không đáp ứng điều kiện, hệ thống sẽ:
- Hiển thị thông báo lỗi
- Redirect về trang phù hợp

## Components

### 1. AuthProvider (Generic Provider)

Provider tổng quát, có thể tái sử dụng cho nhiều loại role khác nhau.

**Props:**
- `requiredRole`: string | string[] - Role yêu cầu (ví dụ: "tenant", "admin")
- `redirectTo`: string - URL redirect khi không đủ quyền (mặc định: "/")
- `loginMessage`: string - Thông báo khi chưa đăng nhập
- `accessDeniedMessage`: string - Thông báo khi không đủ quyền
- `children`: React.ReactNode - Nội dung được bảo vệ

**Ví dụ sử dụng:**

```tsx
// Bảo vệ với một role
<AuthProvider requiredRole="tenant" redirectTo="/">
  {children}
</AuthProvider>

// Bảo vệ với nhiều role
<AuthProvider requiredRole={["tenant", "admin"]} redirectTo="/">
  {children}
</AuthProvider>

// Custom messages
<AuthProvider
  requiredRole="manager"
  redirectTo="/login"
  loginMessage="Vui lòng đăng nhập để tiếp tục"
  accessDeniedMessage="Bạn không có quyền truy cập"
>
  {children}
</AuthProvider>
```

### 2. TenantAuthProvider

Provider chuyên dụng cho các trang tenant.

**Mặc định:**
- Required role: "tenant"
- Redirect to: "/"
- Login message: "Vui lòng đăng nhập để tiếp tục"
- Access denied: "Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản tenant."

**Ví dụ sử dụng:**

```tsx
export default function TenantPageLayout({children}: {children: React.ReactNode}) {
  return (
    <TenantAuthProvider>
      <TenantLayout>{children}</TenantLayout>
    </TenantAuthProvider>
  )
}
```

### 3. AdminAuthProvider

Provider chuyên dụng cho các trang admin.

**Mặc định:**
- Required role: "admin"
- Redirect to: "/admin-login"
- Login message: "Vui lòng đăng nhập với tài khoản admin"
- Access denied: "Bạn không có quyền truy cập trang quản trị. Vui lòng đăng nhập với tài khoản admin."

**Ví dụ sử dụng:**

```tsx
export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminAuthProvider>
  )
}
```

## Cách hoạt động

1. **Kiểm tra Authentication:**
   - Provider kiểm tra `isAuthenticated` và `user` từ auth store
   - Nếu không authenticated, hiển thị thông báo và redirect

2. **Kiểm tra Authorization:**
   - So sánh `user.role` với `requiredRole`
   - Hỗ trợ kiểm tra một hoặc nhiều role
   - Case-insensitive (không phân biệt chữ hoa/thường)

3. **Loading State:**
   - Hiển thị loading spinner trong quá trình kiểm tra
   - Tránh flash content không mong muốn

4. **Redirect & Notification:**
   - Dùng `react-toastify` để hiển thị thông báo
   - Dùng `useRouter` để redirect về trang phù hợp

## Integration

### Đã được tích hợp:

✅ Tenant Layout (`/tenant/**`)
- Bảo vệ tất cả trang tenant
- Yêu cầu role: "tenant"
- Redirect: "/"

✅ Admin Layout (`/admin/**`)
- Bảo vệ tất cả trang admin
- Yêu cầu role: "admin"
- Redirect: "/admin-login"

### Cách thêm protection cho trang khác:

1. **Trong layout file:**

```tsx
import { AuthProvider } from '@/src/components/providers';

export default function MyProtectedLayout({children}) {
  return (
    <AuthProvider requiredRole="your-role" redirectTo="/login">
      {children}
    </AuthProvider>
  );
}
```

2. **Trong page file (nếu không dùng layout):**

```tsx
'use client';
import { AuthProvider } from '@/src/components/providers';

export default function MyProtectedPage() {
  return (
    <AuthProvider requiredRole="your-role">
      <div>Your protected content</div>
    </AuthProvider>
  );
}
```

## Dependencies

- `useAuth` hook - Lấy auth state
- `react-toastify` - Hiển thị notifications
- `next/navigation` - Router và pathname
- Auth store (Zustand) - Quản lý state

## Testing

Để test providers:

1. **Test với user authenticated và đúng role:**
   - Đăng nhập với role phù hợp
   - Truy cập trang được bảo vệ
   - Kỳ vọng: Hiển thị nội dung bình thường

2. **Test với user chưa đăng nhập:**
   - Xóa token trong localStorage
   - Truy cập trang được bảo vệ
   - Kỳ vọng: Redirect + thông báo "Vui lòng đăng nhập"

3. **Test với user sai role:**
   - Đăng nhập với role khác (ví dụ: admin truy cập tenant page)
   - Truy cập trang được bảo vệ
   - Kỳ vọng: Redirect + thông báo "Không có quyền truy cập"

## Troubleshooting

**Vấn đề: Redirect loop**
- Kiểm tra `redirectTo` không trỏ đến trang có provider tương tự
- Đảm bảo trang redirect không yêu cầu authentication

**Vấn đề: Flash of unauthorized content**
- Provider đã có loading state
- Đảm bảo không render content trước khi check xong

**Vấn đề: Toast không hiển thị**
- Kiểm tra `ToastContainer` đã được add vào root layout
- Import và config react-toastify đúng

## Best Practices

1. ✅ Dùng provider ở level layout thay vì từng page
2. ✅ Dùng TenantAuthProvider/AdminAuthProvider cho common cases
3. ✅ Dùng AuthProvider generic cho custom requirements
4. ✅ Đặt provider bên ngoài layout component
5. ❌ Không nest nhiều provider trong cùng một route
6. ❌ Không dùng provider cho public pages
