import { StaffDto } from "@/src/types/type";
import { Edit2, Search, UtensilsCrossed } from "lucide-react";
import React, { useState } from "react";

interface StaffListProps {
  staffs: StaffDto[];
  onEditClick: (staff: StaffDto) => void;
}

function normalizeIsActive(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  if (typeof value === "number") return value === 1;
  return false;
}

export default function StaffList({ staffs, onEditClick }: StaffListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredStaffs = staffs.filter(
    (staff) =>
      staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Group staff by restaurant
  const groupedStaffs = filteredStaffs.reduce(
    (acc, staff) => {
      const restaurant = staff.restaurantName || "Nhà hàng chưa xác định";
      if (!acc[restaurant]) {
        acc[restaurant] = [];
      }
      acc[restaurant].push(staff);
      return acc;
    },
    {} as Record<string, StaffDto[]>,
  );

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Quản lý nhân viên
          </div>
          <div className="text-lg font-semibold text-slate-900">Nhân viên</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pl-9 text-sm text-slate-600 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
        </div>
      </div>

      {/* Staff Grid */}
      {filteredStaffs.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedStaffs).map(
            ([restaurantName, restaurantStaffs]) => (
              <div key={restaurantName}>
                {/* Staff Grid for this category */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {restaurantStaffs.map((staff) => {
                    const isStaffActive = normalizeIsActive(
                      (staff as StaffDto & { isActive: unknown }).isActive,
                    );

                    return (
                      <div
                        key={staff.id}
                        onClick={() => onEditClick(staff)}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:bg-slate-50 cursor-pointer"
                      >
                        {/* Staff Info */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-900 mb-1">
                                {staff.name}
                              </h3>
                              {staff.role && (
                                <p className="text-xs text-slate-500 line-clamp-2">
                                  {staff.role}
                                </p>
                              )}
                              <div className="mt-2">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                    isStaffActive
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                  {isStaffActive
                                    ? "Hoạt động"
                                    : "Không hoạt động"}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(staff);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          )}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12">
          <div className="rounded-full bg-slate-100 p-4">
            <UtensilsCrossed className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-slate-900">
            {searchTerm ? "Không tìm thấy nhân viên" : "Chưa có nhân viên nào"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : "Nhấn nút 'Thêm nhân viên' để bắt đầu"}
          </p>
        </div>
      )}
    </div>
  );
}
