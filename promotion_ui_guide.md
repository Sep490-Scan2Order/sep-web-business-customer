# Hướng dẫn UI — Quản lý Khuyến mãi (Promotion)

> Dựa trên phân tích logic từ `PromotionService`, `Promotion.cs`, và các Enum liên quan.

---

## 1. Mô hình dữ liệu tổng quan

```
Promotion
├── Nhận dạng:        Id, Name, IsActive, Priority
├── Loại (Type):      Standard | HappyHour | Clearance | WeeklySpecial
├── Giảm giá:         DiscountType (% | VNĐ), DiscountValue, MaxDiscountValue, MinOrderValue
├── Thời gian chung:  StartDate?, EndDate?
├── Thời gian chi tiết: DailyStartTime?, DailyEndTime?, DaysOfWeek (Flags)
├── Phạm vi (Scope):  Dish → áp dụng vào giá từng món
│                     Order → áp dụng vào tổng hóa đơn lúc thanh toán
├── IsGlobal:         true → áp dụng tất cả chi nhánh
│                     false → chỉ áp dụng RestaurantIds được chọn
└── Liên kết:         DishIds (nếu Scope=Dish, IsGlobal=false)
                      RestaurantIds (nếu IsGlobal=false)
```

---

## 2. Phân biệt Promotion Scope

> [!IMPORTANT]
> Đây là điểm quan trọng nhất cần UI thể hiện rõ ràng.

| | `Scope = Dish` | `Scope = Order` |
|---|---|---|
| **Áp dụng lúc nào** | Hiển thị ngay trên menu (giá món đã giảm) | Chỉ áp dụng tại màn hình thanh toán |
| **Hiển thị ở menu** | ✅ Badge giảm giá trên card món | ❌ Không hiển thị trên từng món |
| **Hiển thị ở checkout** | Đã tính vào giá từng item | ✅ Hiện dòng "Giảm theo đơn hàng" riêng |
| **Chọn món cụ thể** | Có thể chọn `DishIds` | ❌ Bỏ qua `DishIds`, áp dụng cả đơn |
| **Ví dụ** | "Bún bò giảm 20%" | "Đơn từ 200k giảm 30k" |

### Lưu ý cho UI:
- Khi người dùng chọn **Scope = Order** → **ẩn hoàn toàn** phần "Chọn món áp dụng"
- Ở trang menu khách hàng → **không hiển thị** badge cho `Scope = Order`
- Ở màn hình checkout → hiển thị dòng giảm trừ riêng phía dưới subtotal

---

## 3. Bốn loại Promotion — Fields bắt buộc & tùy chọn

### 3.1 `Standard` — Khuyến mãi thường

| Field | Trạng thái | Ghi chú |
|-------|-----------|---------|
| StartDate | ✅ Bắt buộc | |
| EndDate | ✅ Bắt buộc | |
| DailyStartTime | ❌ Ẩn | Backend tự xóa |
| DailyEndTime | ❌ Ẩn | Backend tự xóa |
| DaysOfWeek | ❌ Ẩn | Backend tự xóa |
| Priority mặc định | 10 | |

**Mô tả:** Chạy liên tục trong khoảng StartDate → EndDate, không phân biệt giờ hay ngày.

---

### 3.2 `HappyHour` — Giờ vàng

| Field | Trạng thái | Ghi chú |
|-------|-----------|---------|
| StartDate | ⬜ Tùy chọn | Nếu bỏ trống → chạy vô thời hạn |
| EndDate | ⬜ Tùy chọn | |
| DailyStartTime | ✅ Bắt buộc | Giờ bắt đầu mỗi ngày |
| DailyEndTime | ✅ Bắt buộc | Phải > DailyStartTime |
| DaysOfWeek | ❌ Ẩn | Backend tự xóa |
| Priority mặc định | 80 | |

**Mô tả:** Mỗi ngày chỉ áp dụng trong khung giờ đã chọn (VD: 14:00 → 17:00).

---

### 3.3 `Clearance` — Xả hàng

| Field | Trạng thái | Ghi chú |
|-------|-----------|---------|
| StartDate | ✅ Bắt buộc | |
| EndDate | ✅ Bắt buộc | Tạo cảm giác khan hiếm |
| DailyStartTime | ❌ Ẩn | Backend tự xóa |
| DailyEndTime | ❌ Ẩn | Backend tự xóa |
| DaysOfWeek | ❌ Ẩn | Backend tự xóa |
| Priority mặc định | **100** (cao nhất) | Luôn thắng Standard & HappyHour |

**Mô tả:** Giống Standard nhưng ưu tiên cao nhất — dùng cho đợt xả hàng tồn đặc biệt.

---

### 3.4 `WeeklySpecial` — Ngày trong tuần

| Field | Trạng thái | Ghi chú |
|-------|-----------|---------|
| StartDate | ✅ Bắt buộc | Khoảng ngày hiệu lực |
| EndDate | ✅ Bắt buộc | |
| DaysOfWeek | ✅ Bắt buộc | Chọn ≥1 ngày (multi-select) |
| DailyStartTime | ⬜ Tùy chọn | Nếu có → limit giờ trong ngày đó |
| DailyEndTime | ⬜ Tùy chọn | Phải > DailyStartTime nếu nhập |
| Priority mặc định | 50 | |

**Mô tả:** Chỉ active vào các ngày đã chọn trong tuần, trong khoảng StartDate → EndDate.

`DaysOfWeek` là **Flags enum** — gửi lên là tổng các bit:

| Ngày | Giá trị |
|------|--------|
| Chủ nhật | 1 |
| Thứ Hai | 2 |
| Thứ Ba | 4 |
| Thứ Tư | 8 |
| Thứ Năm | 16 |
| Thứ Sáu | 32 |
| Thứ Bảy | 64 |

**Ví dụ:** Chọn Thứ Hai + Thứ Tư + Thứ Sáu → gửi `2 + 8 + 32 = 42`

---

## 4. Form Tạo / Chỉnh sửa Promotion

### Cấu trúc form đề xuất (theo thứ tự)

```
┌──────────────────────────────────────────────────────────────┐
│ BƯỚC 1 — Loại khuyến mãi (chọn trước, điều khiển toàn form) │
│                                                              │
│  ○ Standard      ○ Happy Hour                                │
│  ○ Clearance     ○ Weekly Special                            │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ BƯỚC 2 — Thông tin cơ bản                  │
│                                             │
│ Tên chương trình *  [____________________]  │
│ Trạng thái          [Toggle Bật / Tắt]      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 3 — Giảm giá                                           │
│                                                             │
│ Kiểu giảm *     ○ Phần trăm (%)   ○ Số tiền cố định (đ)   │
│ Giảm *          [_____] % hoặc đ                            │
│ Giảm tối đa     [_____] đ          ← chỉ hiện khi chọn %  │
│ Đơn tối thiểu   [_____] đ                                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ BƯỚC 4 — Thời gian (thay đổi theo Type)                     │
│                                                             │
│ [Standard / Clearance]                                       │
│   Từ ngày * [dd/mm/yyyy]   Đến ngày * [dd/mm/yyyy]          │
│                                                             │
│ [HappyHour]                                                  │
│   Từ ngày   [dd/mm/yyyy]   Đến ngày   [dd/mm/yyyy]  (opt)   │
│   Từ giờ *  [HH:MM]        Đến giờ *  [HH:MM]               │
│                                                             │
│ [WeeklySpecial]                                              │
│   Từ ngày * [dd/mm/yyyy]   Đến ngày * [dd/mm/yyyy]          │
│   Áp dụng thứ *                                             │
│   [Hai][Ba][Tư][Năm][Sáu][Bảy][CN]   ← toggle multi-select │
│   Khung giờ (tùy chọn)                                      │
│   Từ giờ   [HH:MM]         Đến giờ   [HH:MM]                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ BƯỚC 5 — Phạm vi áp dụng                                    │
│                                                             │
│ Scope *         ○ Theo từng món   ○ Theo đơn hàng           │
│                   (Dish)              (Order)                │
│                                                             │
│ Áp dụng * ○ Toàn bộ chi nhánh (Global)                     │
│           ○ Chọn chi nhánh cụ thể                           │
│             [Multi-select danh sách chi nhánh]              │
│                                                             │
│ ← Chỉ hiện khi Scope = Dish ──────────────────────────────  │
│ Chọn món áp dụng  ← Ẩn nếu IsGlobal = true                 │
│ [Searchable multi-select danh sách món]                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Màn hình danh sách Promotions

### Thông tin hiển thị trên mỗi thẻ

```
┌──────────────────────────────────────────────────── [● Đang chạy]
│  🏷 CLEARANCE     "Xả hàng tháng 3"          Pri: 100
│  ────────────────────────────────────────────
│  Giảm 30%  (tối đa 50,000đ · Đơn từ 100,000đ)
│  📅 01/03/2026 → 31/03/2026
│  📍 Scope: Món  ·  Toàn hệ thống
│  🍽 5 món được chọn
└──────────────────────────────── [Sửa]  [Tắt]  [Xóa]

┌──────────────────────────────────────────────────── [● Đang chạy]
│  ⏰ HAPPY HOUR    "Giờ vàng chiều"            Pri: 80
│  ────────────────────────────────────────────
│  Giảm 15,000đ/món
│  🕑 14:00 → 17:00 mỗi ngày
│  📍 Scope: Món  ·  2 chi nhánh
└──────────────────────────────── [Sửa]  [Tắt]  [Xóa]

┌──────────────────────────────────────────────────── [● Đang chạy]
│  📆 WEEKLY        "Thứ 2 vui vẻ"             Pri: 50
│  ────────────────────────────────────────────
│  Giảm 20%
│  Thứ Hai, Thứ Tư, Thứ Sáu  ·  10:00 → 22:00
│  📅 01/03 → 30/05/2026
│  📍 Scope: Đơn hàng  ·  1 chi nhánh
└──────────────────────────────── [Sửa]  [Tắt]  [Xóa]
```

### Badge trạng thái theo thời gian

| Trạng thái | Điều kiện | Màu |
|-----------|----------|-----|
| 🟢 Đang chạy | `IsActive=true` và `IsValidAt(now)=true` | Xanh |
| 🟡 Chưa bắt đầu | `StartDate > now` | Vàng |
| 🔴 Đã kết thúc | `EndDate < now` | Đỏ |
| ⚫ Đã tắt | `IsActive=false` | Xám |
| ⏸ Ngoài giờ | HappyHour/WeeklySpecial đúng ngày nhưng ngoài khung giờ | Cam |

---

## 6. Hiển thị trên Menu (khách hàng)

> [!IMPORTANT]
> Chỉ `Scope = Dish` mới hiển thị badge trên card món. `Scope = Order` không hiển thị ở đây.

```
┌────────────────────────┐
│  [Ảnh món]             │
│                 [-30%] │  ← PromotionLabel từ backend ("-30%" hoặc "-15k")
│  Bún bò Huế            │
│  ~~80,000đ~~  56,000đ  │  ← Gạch giá gốc, hiện giá sau giảm (DiscountedPrice)
│  ⏰ Còn 1h 45ph        │  ← ExpiredAt countdown (HappyHour / WeeklySpecial)
└────────────────────────┘
```

`ExpiredAt` backend trả về thời điểm hết hạn thực tế của ngày hôm đó:
- `HappyHour` → là `DailyEndTime` hôm nay
- `WeeklySpecial` → là `DailyEndTime` hôm nay (nếu có) hoặc cuối ngày
- `Standard / Clearance` → là `EndDate`

---

## 7. Hiển thị tại Checkout (thanh toán)

### Scope = Order — áp dụng khi này

```
┌────────────────────────────────────────┐
│  Tóm tắt đơn hàng                     │
│  ─────────────────────────────────────│
│  Bún bò Huế × 2              160,000đ │
│  Cơm sườn × 1                 75,000đ │
│  ─────────────────────────────────────│
│  Tạm tính                    235,000đ │
│  🎉 Giảm "Thứ 2 vui vẻ"      -47,000đ │  ← Scope=Order hiển thị ở đây
│  ─────────────────────────────────────│
│  TỔNG THANH TOÁN             188,000đ │
└────────────────────────────────────────┘
```

> [!NOTE]
> Backend hiện tại (`OrderService`) chưa tích hợp `Scope = Order` vào flow thanh toán — đây là phần **cần implement sau**. UI nên để sẵn slot hiển thị dòng "Giảm theo đơn" trong màn checkout.

---

## 8. Priority — Cách backend chọn promotion thắng

Khi 1 món có nhiều promotion cùng áp dụng, backend chọn theo thứ tự:
1. **Priority cao hơn** thắng
2. Nếu bằng priority → **Discount value lớn hơn** thắng (tính trên giá món)

```
Clearance (100) > HappyHour (80) > WeeklySpecial (50) > Standard (10)
```

**UI nên:** Hiển thị cột Priority trong danh sách và cho phép chỉnh sửa thủ công (field `Priority` trong form). Nếu không nhập → backend tự gán theo type.

---

## 9. Tóm tắt rules validation frontend

| Type | StartDate | EndDate | DailyStart | DailyEnd | DaysOfWeek |
|------|:---------:|:-------:|:----------:|:--------:|:----------:|
| Standard | ✅ bắt buộc | ✅ bắt buộc | ❌ ẩn | ❌ ẩn | ❌ ẩn |
| HappyHour | ⬜ tùy chọn | ⬜ tùy chọn | ✅ bắt buộc | ✅ bắt buộc | ❌ ẩn |
| Clearance | ✅ bắt buộc | ✅ bắt buộc | ❌ ẩn | ❌ ẩn | ❌ ẩn |
| WeeklySpecial | ✅ bắt buộc | ✅ bắt buộc | ⬜ tùy chọn | ⬜ tùy chọn | ✅ bắt buộc |

- `MaxDiscountValue` → chỉ hiện và validate khi `DiscountType = Percentage`
- `DishIds` → chỉ hiện khi `Scope = Dish`
- `RestaurantIds` → chỉ hiện khi `IsGlobal = false`
- `StartDate < EndDate` → validate ở frontend trước khi submit
- `DailyStartTime < DailyEndTime` → validate khi cả 2 đều có giá trị

---

## 10. Enum Reference — Giá trị gửi lên API & label hiển thị UI

> [!IMPORTANT]
> API nhận và trả về **số nguyên** cho tất cả enum. Frontend phải tự map sang label tiếng Việt.

### `PromotionType`

| Giá trị gửi lên | Tên enum | Label hiển thị UI |
|:-:|---|---|
| `0` | `Standard` | 🗓 Khuyến mãi thường |
| `1` | `HappyHour` | ⏰ Giờ vàng |
| `2` | `Clearance` | 🔥 Xả hàng |
| `3` | `WeeklySpecial` | 📆 Ngày trong tuần |

---

### `DiscountType`

| Giá trị gửi lên | Tên enum | Label hiển thị UI |
|:-:|---|---|
| `0` | `Percentage` | Phần trăm (%) |
| `1` | `FixedAmount` | Số tiền cố định (đ) |

---

### `PromotionScope`

| Giá trị gửi lên | Tên enum | Label hiển thị UI | Khi nào áp dụng |
|:-:|---|---|---|
| `0` | `Dish` | Theo từng món | Hiển thị trực tiếp trên menu |
| `1` | `Order` | Theo đơn hàng | Chỉ áp dụng tại màn thanh toán |

---

### `DaysOfWeek` (Flags enum — chọn nhiều)

`DaysOfWeek` là **bitmask**, mỗi ngày là 1 bit độc lập. Giá trị gửi lên là **tổng cộng** các bit của các ngày được chọn.

| Bit value | Tên enum | Label UI |
|:-:|---|---|
| `0` | `None` | (không chọn ngày nào) |
| `1` | `Sunday` | Chủ nhật |
| `2` | `Monday` | Thứ Hai |
| `4` | `Tuesday` | Thứ Ba |
| `8` | `Wednesday` | Thứ Tư |
| `16` | `Thursday` | Thứ Năm |
| `32` | `Friday` | Thứ Sáu |
| `64` | `Saturday` | Thứ Bảy |

**Preset shortcuts:**

| Giá trị | Ý nghĩa |
|:-:|---|
| `62` | Ngày thường (Thứ Hai → Thứ Sáu) |
| `65` | Cuối tuần (Thứ Bảy + Chủ nhật) |
| `127` | Tất cả các ngày |

**Ví dụ tính toán:**
- Thứ Hai + Thứ Tư + Thứ Sáu = `2 + 8 + 32 = 42`
- Thứ Bảy + Chủ nhật = `64 + 1 = 65`

**Cách đọc lại từ response:**
```js
// Kiểm tra ngày X có được chọn không:
const isSelected = (daysOfWeek & bitValue) !== 0;

// VD: Kiểm tra Thứ Hai (bit=2)
const isMondaySelected = (42 & 2) !== 0; // true
```

**UI component:** Dùng **toggle button group** — mỗi button là 1 ngày, click toggle ON/OFF, tính tổng bit trước khi submit.
