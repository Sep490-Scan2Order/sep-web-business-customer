import React, { useEffect, useRef, useState } from "react";
import { Restaurant } from "./RestaurantList";
import { StaffDto } from "@/src/types/type";
import { Edit2, Loader2, Plus, X } from "lucide-react";


interface StaffProps {
  restaurants: Restaurant[];
  onClose: () => void;
  onSubmit: (restaurantId: number, staffData: FormData) => void;
  onUpdate: (
    staffId: string,
    restaurantId: number,
    staffData: FormData,
  ) => void;
  isLoading?: boolean;
  staffData: StaffDto | null;
}

export default function StaffPopUp({
  restaurants,
  onClose,
  onSubmit,
  onUpdate,
  isLoading,
  staffData,
}: StaffProps) {
  const [name, setName] = useState(staffData?.name || "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantId, setRestaurantId] = useState<number>(
    Number(staffData?.restaurantId) || Number(restaurants[0]?.id) || 0,
  );

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("restaurantId", restaurantId.toString());

    if (staffData?.id) {
      onUpdate(staffData.id, restaurantId, formData);
    } else {
      onSubmit(restaurantId, formData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      name.trim() &&
      email.trim() &&
      phone.trim() &&
      password.trim() &&
      !isLoading
    ) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const isFormValid =
    name.trim() && email.trim() && phone.trim() && password.trim();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-8 rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {staffData ? "Cập nhật nhân viên" : "Tạo nhân viên mới"}
            </h2>
            <p className="text-sm text-slate-500">
              {staffData
                ? "Chỉnh sửa thông tin nhân viên"
                : "Thêm nhân viên mới vào hệ thống"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Nhà hàng <span className="text-red-500">*</span>
                </label>
                <select
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Staff Name */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Tên nhân viên <span className="text-red-500">*</span>
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Nhập tên nhân viên..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Nhập email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

            {/* Password */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Mật khẩu
                </label>
                <input
                  type="tel"
                  placeholder="Nhập số mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : staffData ? (
              <>
                <Edit2 className="h-4 w-4" />
                Cập nhật
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Tạo mới
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
