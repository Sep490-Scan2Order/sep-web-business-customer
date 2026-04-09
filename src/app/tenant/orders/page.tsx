"use client";

import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, Calendar, FileText, Search, Store, Eye, Receipt 
} from "lucide-react";
import { API } from "@/src/constants/api";
import { useAuth } from "@/src/hooks/useAuth";
import apiClient from "@/src/services/apiClient";
import { toast } from "react-toastify";
import { 
  Restaurant, 
  TenantOrderResponseDto,
  PagedTenantOrderResponseDto 
} from "@/src/types/type";

const ORDER_STATUS_MAP: Record<number, { text: string; bg: string; textCol: string }> = {
  0: { text: "Chờ thanh toán", bg: "bg-yellow-50", textCol: "text-yellow-700" },
  1: { text: "Đang chờ bếp", bg: "bg-blue-50", textCol: "text-blue-700" },
  2: { text: "Đang chế biến", bg: "bg-indigo-50", textCol: "text-indigo-700" },
  3: { text: "Hoàn thành", bg: "bg-green-50", textCol: "text-green-700" },
  4: { text: "Đã giao", bg: "bg-emerald-50", textCol: "text-emerald-700" },
  5: { text: "Đã hủy", bg: "bg-red-50", textCol: "text-red-700" },
};

const PAYMENT_TYPE_MAP: Record<number, string> = {
  0: "Tại bàn",
  1: "Mang đi",
  2: "Giao hàng",
};

export default function TenantOrdersPage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  
  const [orders, setOrders] = useState<TenantOrderResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [status, setStatus] = useState<number | "">("");
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const pageSize = 10;
  
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TenantOrderResponseDto | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!user?.id) return;

      try {
        const response = await apiClient.get(API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID);
        if (response.data.isSuccess && response.data.data) {
          setRestaurants(response.data.data);
        }
      } catch (error: any) {
        toast.error("Có lỗi xảy ra khi tải danh sách nhà hàng");
      }
    };
    fetchRestaurants();
  }, [user?.id]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!selectedRestaurant?.id) return;
      
      setLoading(true);
      try {
        const statusParam = status !== "" ? Number(status) : undefined;
        const response = await apiClient.get<any>(
          API.ORDER.GET_TENANT_ORDERS(
            selectedRestaurant.id, 
            currentPage, 
            pageSize, 
            keyword || undefined, 
            statusParam, 
            fromDate || undefined, 
            toDate || undefined
          )
        );

        if (response.data.isSuccess && response.data.data) {
          const pagedData = response.data.data as PagedTenantOrderResponseDto;
          setOrders(pagedData.items || []);
          setTotalItems(pagedData.totalCount || 0);
        } else {
          setOrders([]);
          setTotalItems(0);
        }
      } catch (error: any) {
        toast.error("Có lỗi xảy ra khi tải danh sách đơn hàng");
        setOrders([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };
    
    // Add debounce for search keyword
    const timeoutId = setTimeout(() => {
        if (selectedRestaurant) {
            fetchOrders();
        }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedRestaurant, currentPage, pageSize, keyword, status, fromDate, toDate]);

  const handleUpdateClick = (order: TenantOrderResponseDto) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusDisplay = (statusCode: number) => {
    const mapping = ORDER_STATUS_MAP[statusCode] || { text: "Không rõ", bg: "bg-slate-50", textCol: "text-slate-700" };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${mapping.bg} ${mapping.textCol}`}>
            {mapping.text}
        </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="p-6">
      {!selectedRestaurant ? (
        // Restaurant Selection View
        <div>
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Quản lý Đơn hàng
            </div>
            <div className="text-lg font-semibold text-slate-900">
              Chọn nhà hàng để xem đơn hàng
            </div>
          </div>

          {restaurants.length > 0 ? (
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
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16">
              <Store className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">
                Chưa có nhà hàng nào
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Hãy thêm nhà hàng để bắt đầu quản lý đơn hàng.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Orders View
        <div>
          {/* Back Button & Header */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedRestaurant(null);
                setOrders([]);
                setKeyword("");
                setStatus("");
                setFromDate("");
                setToDate("");
                setCurrentPage(1);
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
                  Quản lý Đơn Hàng
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 focus-within:border-slate-300">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-sm w-36 text-slate-700 outline-none"
                    placeholder="SĐT / Mã Đơn"
                  />
                </div>
                
                <select
                  value={status}
                  onChange={(e) => {
                     setStatus(e.target.value === "" ? "" : Number(e.target.value));
                     setCurrentPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus-within:border-slate-300 text-slate-600 cursor-pointer"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="0">Chờ thanh toán</option>
                    <option value="1">Đang chờ bếp</option>
                    <option value="2">Đang chế biến</option>
                    <option value="3">Hoàn thành</option>
                    <option value="4">Đã giao</option>
                    <option value="5">Đã hủy</option>
                </select>

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
                <thead className="border-b border-slate-200 bg-slate-50 tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">#Mã Đơn</th>
                    <th className="px-6 py-4 font-medium">SĐT Khách</th>
                    <th className="px-6 py-4 font-medium">Tổng Tiền</th>
                    <th className="px-6 py-4 font-medium">Giờ Lập</th>
                    <th className="px-6 py-4 font-medium">Loại / Thanh toán</th>
                    <th className="px-6 py-4 font-medium">Trạng Thái</th>
                    <th className="px-6 py-4 text-center font-medium">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
                          <p className="mt-4 text-sm font-medium text-slate-600">Đang tải dữ liệu...</p>
                        </div>
                      </td>
                    </tr>
                  ) : orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900 border border-slate-200 bg-slate-50 px-2 py-1 rounded-md">
                                {order.orderCode}
                            </span>
                            {order.isPreOrder && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                Đặt trước
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                            {order.numberPhone}
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-medium text-emerald-600">{formatCurrency(order.finalAmount)}</span>
                            {order.promotionDiscount > 0 && (
                                <span className="block text-xs line-through text-slate-400">
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-medium text-slate-700">{order.type}</div>
                          <div className="text-xs text-slate-400">{PAYMENT_TYPE_MAP[order.typeOrder] || "Không có"}</div>
                        </td>
                        <td className="px-6 py-4">
                            {getStatusDisplay(order.status)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleUpdateClick(order)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 cursor-pointer"
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
                            <Receipt className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="mt-2 text-sm font-medium text-slate-900">Không tìm thấy đơn hàng</p>
                          <p className="mt-1 text-xs text-slate-500">Chưa có dữ liệu với bộ lọc này.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
                <div className="text-sm text-slate-500">
                  Hiển thị <span className="font-medium text-slate-900">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> đến <span className="font-medium text-slate-900">{Math.min(currentPage * pageSize, totalItems)}</span> trong số <span className="font-medium text-slate-900">{totalItems}</span> đơn
                </div>
                
                <div className="flex gap-1 items-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  
                  {Array.from({ length: Math.ceil(totalItems / pageSize) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`h-8 min-w-[32px] rounded-lg px-2 text-sm font-medium transition-colors cursor-pointer ${
                        currentPage === index + 1
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => (prev * pageSize < totalItems ? prev + 1 : prev))}
                    disabled={currentPage * pageSize >= totalItems}
                    className="p-1 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Chi tiết Đơn hàng #{selectedOrder.orderCode}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Khách hàng</p>
                  <p className="font-medium text-slate-900">{selectedOrder.numberPhone}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Thời gian đặt</p>
                  <p className="font-medium text-slate-900">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Trạng thái</p>
                  <div>{getStatusDisplay(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Hình thức</p>
                  <p className="font-medium text-slate-900">{selectedOrder.type} - {PAYMENT_TYPE_MAP[selectedOrder.typeOrder] || "Không có"}</p>
                </div>
                {selectedOrder.isPreOrder && (
                    <div className="col-span-2">
                        <p className="text-slate-500 mb-1">Giờ đặt trước (Yêu cầu / Xác nhận)</p>
                        <p className="font-medium text-purple-700 bg-purple-50 inline-block px-2 py-1 rounded">
                      {selectedOrder.requestedPickupAt ? new Date(selectedOrder.requestedPickupAt).toLocaleString('vi-VN') : 'Không có'} 
                            {' --> '}
                            {selectedOrder.confirmedPickupAt ? new Date(selectedOrder.confirmedPickupAt).toLocaleString('vi-VN') : 'Chưa xác nhận'}
                        </p>
                    </div>
                )}
                {selectedOrder.note && (
                    <div className="col-span-2">
                        <p className="text-slate-500 mb-1">Ghi chú</p>
                        <p className="text-slate-700 italic bg-amber-50 p-2 rounded border border-amber-100 text-xs">
                          {selectedOrder.note}
                        </p>
                    </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                        <tr>
                            <th className="px-4 py-2 font-medium">Tên Món</th>
                            <th className="px-4 py-2 font-medium text-center">SL</th>
                            <th className="px-4 py-2 font-medium text-right">Đơn giá</th>
                            <th className="px-4 py-2 font-medium text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {selectedOrder.orderDetails?.map((item, index) => (
                            <tr key={index}>
                                <td className="px-4 py-3 font-medium text-slate-800">{item.dishName}</td>
                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                <td className="px-4 py-3 text-right">
                                    {item.promotionAmount > 0 ? (
                                        <div className="flex flex-col items-end">
                                            <span className="text-emerald-600">{formatCurrency(item.discountedPrice)}</span>
                                            <span className="text-[10px] line-through text-slate-400">{formatCurrency(item.originalPrice)}</span>
                                        </div>
                                    ) : (
                                        <span>{formatCurrency(item.discountedPrice)}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(item.subTotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                        <span>Tạm tính</span>
                        <span className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                    {selectedOrder.promotionDiscount > 0 && (
                        <div className="flex justify-between text-rose-500">
                            <span>Khuyến mãi</span>
                            <span className="font-medium">-{formatCurrency(selectedOrder.promotionDiscount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-base">
                        <span className="font-semibold text-slate-900">Tổng cộng</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(selectedOrder.finalAmount)}</span>
                    </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end">
                <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
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
