"use client";
import { PromotionDaysOfWeek, PromotionDto, PromotionType } from "@/src/types/type";
import { Edit2, Eye, Plus, Search, UtensilsCrossed, Trash2 } from "lucide-react";
import  { useState } from "react";

interface PromotionListProps {
  promotions: PromotionDto[];
  onCreateClick: () => void;
  onViewDetailClick: (promotion: PromotionDto) => void;
  onEditClick: (promotion: PromotionDto) => void;
  onDeleteClick: (promotionId: number) => void;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const PROMOTION_TYPE_LABELS: Record<number, string> = {
  0: "Khuyến mãi thường",
  1: "Giờ vàng",
  2: "Xả hàng",
  3: "Ngày đặc biệt tuần",
};

const PROMOTION_SCOPE_LABELS: Record<number, string> = {
  0: "Theo món",
  1: "Theo hóa đơn",
};

const DAY_OPTIONS: Array<{ label: string; value: PromotionDaysOfWeek }> = [
  { label: "Chủ nhật", value: PromotionDaysOfWeek.Sunday },
  { label: "Thứ 2", value: PromotionDaysOfWeek.Monday },
  { label: "Thứ 3", value: PromotionDaysOfWeek.Tuesday },
  { label: "Thứ 4", value: PromotionDaysOfWeek.Wednesday },
  { label: "Thứ 5", value: PromotionDaysOfWeek.Thursday },
  { label: "Thứ 6", value: PromotionDaysOfWeek.Friday },
  { label: "Thứ 7", value: PromotionDaysOfWeek.Saturday },
];

export default function PromotionList({
  promotions,
  onCreateClick,
  onViewDetailClick,
  onEditClick,
  onDeleteClick,
  currentPage,
  pageSize,
  totalPages,
  totalCount,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  isLoading = false,
}: PromotionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingDeletePromotion, setPendingDeletePromotion] = useState<PromotionDto | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (value: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("vi-VN");
  };

  const getDiscountTypeLabel = (discountType: number) => {
    if (discountType === 0) return "Theo %";
    if (discountType === 1) return "Theo tiền";
    return `Loại ${discountType}`;
  };

  const getDiscountValueLabel = (promotion: PromotionDto) => {
    if (promotion.discountType === 0) {
      return `${promotion.discountValue}%`;
    }
    return formatCurrency(promotion.discountValue);
  };

  const getScopeLabel = (promotion: PromotionDto) => {
    return PROMOTION_SCOPE_LABELS[promotion.scope] ?? `Scope ${promotion.scope}`;
  };

  const getPromotionTypeLabel = (promotionType: number) => {
    return PROMOTION_TYPE_LABELS[promotionType] ?? `Loại ${promotionType}`;
  };

  const getAppliedDayLabels = (promotion: PromotionDto) => {
    if (promotion.type !== PromotionType.WeeklySpecial || promotion.daysOfWeek <= 0) {
      return [];
    }

    return DAY_OPTIONS.filter((day) => (promotion.daysOfWeek & day.value) !== 0).map((day) => day.label);
  };

  const getStatus = (promotion: PromotionDto) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (!Number.isNaN(startDate.getTime()) && now < startDate) {
      return {
        label: "Sắp diễn ra",
        className: "bg-amber-100 text-amber-800",
      };
    }

    if (!Number.isNaN(endDate.getTime()) && now > endDate) {
      return {
        label: "Đã kết thúc",
        className: "bg-slate-100 text-slate-700",
      };
    }

    return {
      label: "Đang áp dụng",
      className: "bg-emerald-100 text-emerald-800",
    };
  };

  const filteredPromotions = promotions.filter((promotion) => {
    const keyword = searchTerm.toLowerCase();
    return (
      promotion.name.toLowerCase().includes(keyword) ||
      getPromotionTypeLabel(promotion.type).toLowerCase().includes(keyword) ||
      getScopeLabel(promotion).toLowerCase().includes(keyword) ||
      getDiscountTypeLabel(promotion.discountType).toLowerCase().includes(keyword)
    );
  });

  const openDeleteConfirm = (promotion: PromotionDto) => {
    if (promotion.id === undefined || promotion.id === null) {
      return;
    }
    setPendingDeletePromotion(promotion);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeletePromotion?.id) return;
    onDeleteClick(pendingDeletePromotion.id);
    setPendingDeletePromotion(null);
  };

  const closeDeleteConfirm = () => {
    setPendingDeletePromotion(null);
  };

  const getVisiblePages = (activePage: number, pageCount: number) => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    const pages: Array<number | string> = [1];
    const start = Math.max(2, activePage - 1);
    const end = Math.min(pageCount - 1, activePage + 1);

    if (start > 2) {
      pages.push("start-ellipsis");
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (end < pageCount - 1) {
      pages.push("end-ellipsis");
    }

    pages.push(pageCount);
    return pages;
  };

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Promotion Management</div>
          <div className="text-lg font-semibold text-slate-900">Khuyến mãi</div>
        </div>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm khuyến mãi
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pl-9 text-sm text-slate-600 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
        </div>
      </div>

      {/* Promotions Table */}
      {filteredPromotions.length > 0 ? (
        <div className="mx-auto max-w-8xl mt-2 overflow-x-auto">
          <table className="w-full table-auto border-collapse text-left">
            <thead>
              <tr>
                <th className="border-b-2 border-gray-200 px-2 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">ID</th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">Tên khuyến mãi</th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">Loại</th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">Giảm giá</th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">Đơn tối thiểu</th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">Thời gian áp dụng</th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">Phạm vi</th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">Trạng thái</th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromotions.map((promotion, index) => {
                const status = getStatus(promotion);

                return (
                  <tr
                    key={`${promotion.name}-${promotion.startDate}-${index}`}
                    onClick={() => onViewDetailClick(promotion)}
                    className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-2 py-2 text-sm text-gray-600 whitespace-nowrap">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                      <div className="font-medium text-slate-800 whitespace-nowrap">{promotion.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span>Ưu tiên: {promotion.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                        {getPromotionTypeLabel(promotion.type)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{getDiscountValueLabel(promotion)}</div>
                      <div className="text-xs text-slate-500">{getDiscountTypeLabel(promotion.discountType)}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                      {formatCurrency(promotion.minOrderValue)}
                      {promotion.maxDiscountValue > 0 && (
                        <div className="text-xs text-slate-500">
                          Tối đa: {formatCurrency(promotion.maxDiscountValue)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                      <div>
                        {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                      </div>
                      {promotion.type === 1 && (
                        <div className="text-xs text-slate-500">
                          Giờ vàng: {promotion.dailyStartTime} - {promotion.dailyEndTime}
                        </div>
                      )}
                      {promotion.type === 3 && promotion.daysOfWeek > 0 && (
                        <div className="text-xs text-slate-500">
                          Ngày áp dụng: {getAppliedDayLabels(promotion).join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {getScopeLabel(promotion)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${promotion.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {promotion.isActive ? "Đang hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetailClick(promotion);
                          }}
                          className="cursor-pointer inline-flex w-16 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Xem
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditClick(promotion);
                          }}
                          className="cursor-pointer inline-flex w-16 items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Sửa
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(promotion);
                          }}
                          disabled={promotion.id === undefined || promotion.id === null}
                          className="cursor-pointer inline-flex w-16 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12">
          <div className="rounded-full bg-slate-100 p-4">
            <UtensilsCrossed className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-slate-900">
            {searchTerm ? "Không tìm thấy khuyến mãi" : "Chưa có khuyến mãi nào"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : "Nhấn nút 'Thêm khuyến mãi' để bắt đầu"}
          </p>
        </div>
      )}

      {totalPages > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <div className="text-xs text-slate-500">
            Trang {currentPage}/{totalPages} • Tổng {totalCount} khuyến mãi
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPreviousPage || isLoading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>

            {visiblePages.map((page, index) =>
              typeof page === "number" ? (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                  className={`min-w-8 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    currentPage === page
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={`${page}-${index}`} className="px-1 text-xs text-slate-400">
                  ...
                </span>
              ),
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage || isLoading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {pendingDeletePromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">Xác nhận xóa khuyến mãi</h3>
              <p className="mt-1 text-sm text-slate-500">Hành động này không thể hoàn tác.</p>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-slate-700">
                Bạn có chắc chắn muốn xóa khuyến mãi <span className="font-semibold">{pendingDeletePromotion.name}</span>?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                onClick={closeDeleteConfirm}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl border border-red-200 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
