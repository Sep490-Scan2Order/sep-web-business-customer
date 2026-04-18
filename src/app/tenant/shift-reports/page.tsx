"use client";
import React, { useEffect, useState } from "react";
import { API } from "@/src/constants/api";
import { useAuth } from "@/src/hooks/useAuth";
import apiClient from "@/src/services/apiClient";
import { Restaurant, ShiftReportDto } from "@/src/types/type";
import {
  Calendar,
  Search,
  Store,
  ArrowLeft,
  Eye,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import TablePagination from "@/src/components/ui/common/TablePagination";

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function ShiftReportsPage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isRestaurantLoading, setIsRestaurantLoading] = useState<boolean>(true);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const [reports, setReports] = useState<ShiftReportDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const pageSize = 10;

  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ShiftReportDto | null>(
    null,
  );

  // Fetch restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!user?.id) {
        setIsRestaurantLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(
          API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID,
        );
        if (response.data.isSuccess && response.data.data) {
          setRestaurants(response.data.data);
        }
      } catch (error: any) {
        toast.error("Có lỗi xảy ra khi tải danh sách nhà hàng");
      } finally {
        setIsRestaurantLoading(false);
      }
    };
    fetchRestaurants();
  }, [user?.id]);

  // Fetch reports when restaurant or dates change
  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedRestaurant?.id) return;

      setLoading(true);
      try {
        const response = await apiClient.get(
          API.SHIFT.GET_REPORTS(
            selectedRestaurant.id,
            currentPage,
            pageSize,
            fromDate || undefined,
            toDate || undefined,
          ),
        );

        if (response.data.isSuccess && response.data.data) {
          setReports(response.data.data.items || []);
          setTotalItems(response.data.data.totalCount || 0);
        } else {
          setReports([]);
          setTotalItems(0);
        }
      } catch (error: any) {
        toast.error("Có lỗi xảy ra khi tải dữ liệu ca làm việc");
        setReports([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    if (selectedRestaurant) {
      fetchReports();
    }
  }, [selectedRestaurant, currentPage, pageSize, fromDate, toDate]);

  const handleUpdateClick = (report: ShiftReportDto) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      {!selectedRestaurant ? (
        // Restaurant Selection View
        <div>
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Quản lý Báo Cáo
            </div>
            <div className="text-lg font-semibold text-slate-900">
              Chọn nhà hàng để xem báo cáo ca
            </div>
          </div>

          {isRestaurantLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`shift-restaurant-skeleton-${index}`}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="aspect-video animate-pulse bg-slate-200" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {restaurants.map((rest) => (
                <div
                  key={rest.id}
                  onClick={() => {
                    setSelectedRestaurant(rest);
                    setCurrentPage(1);
                  }}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md"
                >
                  {rest.image ? (
                    <div className="aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={rest.image}
                        alt={rest.restaurantName}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-slate-100">
                      <Store className="h-12 w-12 text-slate-300" />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {rest.restaurantName}
                    </h3>
                    {rest.address && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {rest.address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12">
              <div className="rounded-full bg-slate-100 p-4">
                <Store className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-slate-900">
                Chưa có nhà hàng nào
              </h3>
            </div>
          )}
        </div>
      ) : (
        // Shift Reports View (when restaurant is selected)
        <div>
          {/* Back Button & Header */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedRestaurant(null);
                setReports([]);
              }}
              className="mb-4 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại chọn nhà hàng
            </button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {selectedRestaurant.restaurantName}
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  Báo cáo ca làm việc
                </div>
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 focus-within:border-slate-300">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-sm text-slate-700 outline-none"
                    placeholder="Từ ngày"
                  />
                </div>
                <span className="text-slate-400">-</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 focus-within:border-slate-300">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-sm text-slate-700 outline-none"
                    placeholder="Đến ngày"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-4">Mã ca</th>
                    <th className="whitespace-nowrap px-6 py-4">
                      Ngày giờ báo cáo
                    </th>
                    <th className="whitespace-nowrap px-6 py-4">Nhân viên</th>
                    <th className="whitespace-nowrap px-6 py-4">Dự kiến</th>
                    <th className="whitespace-nowrap px-6 py-4">
                      Thực tế (Tiền mặt)
                    </th>
                    <th className="whitespace-nowrap px-6 py-4">Chênh lệch</th>
                    <th className="whitespace-nowrap px-6 py-4 text-center">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, rowIndex) => (
                      <tr key={`shift-loading-row-${rowIndex}`}>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="mx-auto h-8 w-8 animate-pulse rounded bg-slate-200" />
                        </td>
                      </tr>
                    ))
                  ) : reports.length > 0 ? (
                    reports.map((report) => (
                      <tr
                        key={report.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          #{report.shiftId}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            {formatDate(report.reportDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {report.cashierName || "Không có"}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {formatCurrency(report.expectedTotalAmount)}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {formatCurrency(report.actualCashAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                              report.difference === 0
                                ? "bg-slate-100 text-slate-700"
                                : report.difference > 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {report.difference > 0 ? "+" : ""}
                            {formatCurrency(report.difference)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleUpdateClick(report)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="rounded-full bg-slate-100 p-3">
                            <FileText className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="mt-2 text-sm font-medium text-slate-900">
                            Không có dữ liệu
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Chưa có báo cáo ca nào trong khoảng thời gian này.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                itemUnit="báo cáo"
              />
            )}
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Chi tiết Báo Cáo Ca #{selectedReport.shiftId}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">Ngày báo cáo</span>
                <span className="text-sm font-medium text-slate-900">
                  {formatDate(selectedReport.reportDate)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">
                  Người lập báo cáo
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {selectedReport.cashierName || "Không có"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">
                  Tổng tiền đơn mặt
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {formatCurrency(selectedReport.totalCashOrder)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">
                  Tổng tiền chuyển khoản
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {formatCurrency(selectedReport.totalTransferOrder)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">
                  Tổng tiền hoàn trả
                </span>
                <span className="text-sm font-medium text-rose-600">
                  -{formatCurrency(selectedReport.totalRefundAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100 bg-slate-50 p-3 rounded-lg">
                <span className="text-sm font-semibold text-slate-700">
                  Tổng dự kiến thu
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(selectedReport.expectedTotalAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">
                  Tiền mặt dự kiến phải có
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {formatCurrency(selectedReport.expectedCashAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">
                  Tiền mặt thực tế thu được
                </span>
                <span className="text-sm font-medium text-emerald-600">
                  {formatCurrency(selectedReport.actualCashAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">
                  Chênh lệch (Thiếu/Thừa)
                </span>
                <span
                  className={`text-sm font-bold ${
                    selectedReport.difference === 0
                      ? "text-slate-700"
                      : selectedReport.difference > 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                  }`}
                >
                  {selectedReport.difference > 0 ? "+" : ""}
                  {formatCurrency(selectedReport.difference)}
                </span>
              </div>

              {selectedReport.note && (
                <div className="mt-4 rounded-xl bg-orange-50 p-4">
                  <span className="block text-xs font-medium text-orange-800 mb-1">
                    Ghi chú của nhân viên:
                  </span>
                  <p className="text-sm text-orange-900">
                    {selectedReport.note}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-4">
              <button
                onClick={() => setShowModal(false)}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
