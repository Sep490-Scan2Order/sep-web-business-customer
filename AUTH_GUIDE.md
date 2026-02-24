# Hướng dẫn sử dụng Auth Store

## 📚 Giới thiệu
Hệ thống xác thực toàn cục dùng **Zustand** để quản lý trạng thái user sau khi đăng nhập. Thông tin user được giải mã từ JWT token và lưu vào store.

## 🎯 Cách sử dụng

### 1. **Lấy thông tin user trong component**
```tsx
'use client';

import { useAuth } from '@/src/hooks/useAuth';

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Vui lòng đăng nhập</div>;
  }

  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Tên: {user?.name}</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}
```

### 2. **Truy cập store trực tiếp**
```tsx
'use client';

import { useAuthStore } from '@/src/store/authStore';

export function AnotherComponent() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

  return (
    <div>
      <p>Authenticated: {isAuthenticated ? 'Có' : 'Không'}</p>
      <p>Token: {token?.slice(0, 10)}...</p>
    </div>
  );
}
```

### 3. **Đặt/Xóa auth thủ công**
```tsx
'use client';

import { useAuthStore } from '@/src/store/authStore';

export function AuthControl() {
  const { setAuth, logout } = useAuthStore();

  const handleLogin = async () => {
    // Giả lập đăng nhập
    const user = { id: '1', email: 'user@example.com', name: 'John' };
    const token = 'your-jwt-token';
    setAuth(user, token); // Token sẽ tự động lưu vào localStorage
  };

  const handleLogout = () => {
    logout(); // Xóa user, token và localStorage
  };

  return (
    <div>
      <button onClick={handleLogin}>Đăng nhập</button>
      <button onClick={handleLogout}>Đăng xuất</button>
    </div>
  );
}
```

## 🔄 Flow hoạt động

1. **Đăng nhập**: 
   - User nhập email/password
   - API trả về token
   - Token được giải mã để lấy thông tin user
   - `setAuth(user, token)` lưu vào store và localStorage

2. **Khởi động app**:
   - `AuthInitializer` component tự động chạy
   - Kiểm tra localStorage có token không
   - Nếu có, giải mã token và khôi phục auth state

3. **Đăng xuất**:
   - Gọi `logout()`
   - Xóa user, token từ store và localStorage

## 📁 Tập tin liên quan

- `src/store/authStore.ts` - Zustand store và hàm decode token
- `src/hooks/useAuth.ts` - Hook để sử dụng auth state
- `src/hooks/useInitializeAuth.ts` - Hook khởi tạo auth
- `src/components/AuthInitializer.tsx` - Component khởi tạo auth
- `src/types/type.ts` - Định nghĩa type User và AuthState

## 🔑 Cấu trúc User từ JWT Token

Cấu trúc User được trích xuất từ JWT token:
```typescript
interface User {
  id: string;           // sub hoặc id từ token
  email: string;        // email từ token
  name?: string;        // name hoặc userName
  phone?: string;       // phone từ token
  role?: string;        // role từ token
  [key: string]: any;   // Các field khác từ token
}
```

**Ghi chú**: Nếu cấu trúc token của API khác, hãy update hàm `decodeToken()` trong `src/store/authStore.ts`

## 💾 Lưu trữ

- Token được lưu vào `localStorage` với key: `TOKEN_STORAGE_KEY` (từ constants)
- User state chỉ lưu trong memory (Zustand store)
- Khi F5 trang, token sẽ tự động khôi phục

## ⚡ Tips

- Luôn sử dụng `useAuth()` hook thay vì truy cập store trực tiếp
- `isAuthenticated` trả về `true` khi có user và token
- Có thể extend User interface để thêm field khác
- Token được giải mã an toàn (try-catch), nếu lỗi sẽ trả về null
