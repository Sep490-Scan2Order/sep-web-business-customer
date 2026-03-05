/**
 * HƯỚNG DẪN SỬ DỤNG USER INFO TỪ useAuth
 * 
 * File này mô tả cách truy cập các field trong user object từ useAuth hook
 */

import { useAuth } from '@/src/hooks/useAuth';

// =====================================================
// EXAMPLE 1: Sử dụng trong Component
// =====================================================

export function TenantProfileExample() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <div>Vui lòng đăng nhập</div>;
  }

  return (
    <div>
      {/* Basic Info */}
      <h1>Xin chào, {user.name || 'User'}</h1>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Role: {user.role}</p>
      
      {/* Avatar */}
      {user.avatar && (
        <img src={user.avatar} alt="Avatar" />
      )}

      {/* Status */}
      <p>Trạng thái: {user.isActive ? 'Đang hoạt động' : 'Không hoạt động'}</p>
      <p>Đã xác thực: {user.verified ? 'Có' : 'Chưa'}</p>

      {/* Bank Info */}
      <div>
        <h2>Thông tin ngân hàng</h2>
        <p>Ngân hàng: {user.bankName}</p>
        <p>Số thẻ: {user.cardNumber}</p>
        <p>Đã xác thực: {user.isVerifyBank ? 'Có' : 'Chưa'}</p>
        {user.bankLogo && (
          <img src={user.bankLogo} alt="Bank Logo" />
        )}
      </div>

      {/* Tax Info */}
      <div>
        <h2>Thông tin thuế</h2>
        <p>Mã số thuế: {user.taxNumber || 'Chưa cập nhật'}</p>
        <p>Đã xác thực: {user.isVerifyTax ? 'Có' : 'Chưa'}</p>
      </div>

      {/* Subscription Info */}
      <div>
        <h2>Gói đăng ký</h2>
        <p>Gói hiện tại: {user.planName}</p>
        <p>Ngày hết hạn: {user.subscriptionExpiryDate}</p>
        <p>Tổng nợ: {user.totalDebtAmount?.toLocaleString('vi-VN')} VNĐ</p>
      </div>

      {/* Stats */}
      <div>
        <h2>Thống kê</h2>
        <p>Số nhà hàng: {user.totalRestaurants}</p>
        <p>Số món ăn: {user.totalDishes}</p>
        <p>Số danh mục: {user.totalCategories}</p>
      </div>
    </div>
  );
}

// =====================================================
// EXAMPLE 2: Kiểm tra điều kiện
// =====================================================

export function ConditionalFeatureExample() {
  const { user } = useAuth();

  // Kiểm tra xác thực ngân hàng
  if (!user?.isVerifyBank) {
    return <div>Vui lòng xác thực tài khoản ngân hàng để tiếp tục</div>;
  }

  // Kiểm tra xác thực thuế
  if (!user?.isVerifyTax) {
    return <div>Vui lòng xác thực mã số thuế để tiếp tục</div>;
  }

  // Kiểm tra subscription
  if (user?.subscriptionExpiryDate) {
    const expiryDate = new Date(user.subscriptionExpiryDate);
    const isExpired = expiryDate < new Date();
    
    if (isExpired) {
      return <div>Gói đăng ký đã hết hạn. Vui lòng gia hạn.</div>;
    }
  }

  return <div>Feature content</div>;
}

// =====================================================
// EXAMPLE 3: Sử dụng trong logic
// =====================================================

export function useUserStats() {
  const { user } = useAuth();

  const canAddMoreRestaurants = () => {
    // Logic kiểm tra dựa vào gói đăng ký
    const maxRestaurants = user?.planName === 'Premium' ? 10 : 3;
    return (user?.totalRestaurants || 0) < maxRestaurants;
  };

  const needsBankVerification = () => {
    return !user?.isVerifyBank;
  };

  const needsTaxVerification = () => {
    return !user?.isVerifyTax;
  };

  const hasActiveSubscription = () => {
    if (!user?.subscriptionExpiryDate) return false;
    const expiryDate = new Date(user.subscriptionExpiryDate);
    return expiryDate > new Date();
  };

  return {
    canAddMoreRestaurants,
    needsBankVerification,
    needsTaxVerification,
    hasActiveSubscription,
  };
}

// =====================================================
// EXAMPLE 4: Hiển thị thông tin trong Header/Sidebar
// =====================================================

export function UserMenuExample() {
  const { user, logout } = useAuth();

  return (
    <div className="user-menu">
      <div className="user-info">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name || 'User'} />
        ) : (
          <div className="avatar-placeholder">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <div className="user-name">{user?.name}</div>
          <div className="user-email">{user?.email}</div>
          <div className="user-plan">Gói: {user?.planName}</div>
        </div>
      </div>

      <div className="user-stats">
        <div>Nhà hàng: {user?.totalRestaurants}</div>
        <div>Món ăn: {user?.totalDishes}</div>
        <div>Danh mục: {user?.totalCategories}</div>
      </div>

      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}

// =====================================================
// EXAMPLE 5: Type-safe access với optional chaining
// =====================================================

export function SafeAccessExample() {
  const { user } = useAuth();

  // ✅ Đúng: Sử dụng optional chaining
  const userName = user?.name ?? 'Guest';
  const userEmail = user?.email ?? '';
  const bankName = user?.bankName ?? 'Chưa cập nhật';
  const planName = user?.planName ?? 'Free';
  
  // ✅ Đúng: Kiểm tra trước khi truy cập
  if (user && user.subscriptionExpiryDate) {
    const expiryDate = new Date(user.subscriptionExpiryDate);
    console.log('Subscription expires:', expiryDate);
  }

  // ✅ Đúng: Sử dụng type guard
  const hasVerifiedBank = user?.isVerifyBank === true;
  const hasVerifiedTax = user?.isVerifyTax === true;

  // ❌ Sai: Không kiểm tra null/undefined
  // const email = user.email; // Có thể gây lỗi nếu user là null

  return (
    <div>
      <p>Name: {userName}</p>
      <p>Email: {userEmail}</p>
      <p>Bank: {bankName}</p>
      <p>Plan: {planName}</p>
      <p>Bank Verified: {hasVerifiedBank ? 'Yes' : 'No'}</p>
      <p>Tax Verified: {hasVerifiedTax ? 'Yes' : 'No'}</p>
    </div>
  );
}

// =====================================================
// EXAMPLE 6: Format và display helpers
// =====================================================

export const formatUserData = (user: Awaited<ReturnType<typeof useAuth>>['user'] | null) => {
  if (!user) return null;

  return {
    // Format subscription date
    subscriptionExpiry: user.subscriptionExpiryDate
      ? new Date(user.subscriptionExpiryDate).toLocaleDateString('vi-VN')
      : 'Không có',

    // Format debt amount
    debtAmount: user.totalDebtAmount
      ? `${user.totalDebtAmount.toLocaleString('vi-VN')} VNĐ`
      : '0 VNĐ',

    // Format created date
    memberSince: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('vi-VN')
      : 'N/A',

    // Verification status
    verificationStatus: {
      bank: user.isVerifyBank ? '✓ Đã xác thực' : '✗ Chưa xác thực',
      tax: user.isVerifyTax ? '✓ Đã xác thực' : '✗ Chưa xác thực',
    },

    // Stats summary
    summary: `${user.totalRestaurants || 0} nhà hàng, ${user.totalDishes || 0} món ăn`,
  };
};

// =====================================================
// TÓM TẮT CÁC FIELD AVAILABLE
// =====================================================

/*
user object có các field sau:

✅ BASIC INFO:
- id: string
- accountId?: string
- email: string
- name?: string | null
- phone?: string
- role?: string
- avatar?: string | null

✅ STATUS:
- isActive?: boolean
- verified?: boolean

✅ BANK INFO:
- bankId?: string
- cardNumber?: string
- bankName?: string
- bankLogo?: string
- isVerifyBank?: boolean

✅ TAX INFO:
- taxNumber?: string | null
- isVerifyTax?: boolean

✅ SUBSCRIPTION:
- debtStartedAt?: string | null
- subscriptionExpiryDate?: string | null
- lastWarningSentAt?: string | null
- totalDebtAmount?: number
- planName?: string

✅ STATS:
- totalRestaurants?: number
- totalDishes?: number
- totalCategories?: number

✅ TIMESTAMPS:
- createdAt?: string

LƯU Ý:
1. Luôn sử dụng optional chaining (?.) khi truy cập
2. Kiểm tra isAuthenticated và user trước khi sử dụng
3. Hầu hết các field là optional, cần xử lý giá trị null/undefined
4. Các field về số tiền nên format với toLocaleString('vi-VN')
5. Các field về ngày tháng nên parse qua new Date() trước khi hiển thị
*/
