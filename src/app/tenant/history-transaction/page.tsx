"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  CircleDollarSign,
  Filter,
  ReceiptText,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  CommissionDetail,
  SubscriptionDetail,
  TransactionData,
} from "@/src/types/type";
import { getPaymentTransactionHistory } from "@/src/services/tenantService";

const STATUS_OPTIONS: Array<"Success" | "Pending" | "Canceled"> = [
  "Success",
  "Pending",
  "Canceled",
];

const TYPE_OPTIONS: Array<"Subscription" | "CommissionFee"> = [
  "Subscription",
  "CommissionFee",
];

const statusLabelMap: Record<TransactionData["status"], string> = {
  Success: "Thành công",
  Pending: "Đang chờ",
  Canceled: "Đã hủy",
};

const typeLabelMap: Record<TransactionData["paymentTransactionType"], string> =
  {
    Subscription: "Mua gói",
    CommissionFee: "Thanh toán hoa hồng",
  };

const statusColorMap: Record<TransactionData["status"], string> = {
  Success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Canceled: "bg-rose-50 text-rose-700 border-rose-200",
};

const formatCurrency = (value: number) =>
  `${value.toLocaleString("vi-VN")} VND`;

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("vi-VN");
};

const getSubscriptionDescription = (details: SubscriptionDetail[] | null) => {
  if (!details || details.length === 0) return "Không có chi tiết gói";
  if (details.length === 1) return details[0].descriptionMessage;

  return `${details.length} nhà hàng: ${details
    .map((item) => item.restaurantName)
    .join(", ")}`;
};

const getCommissionDescription = (details: CommissionDetail | null) => {
  if (!details) return "Không có chi tiết hoa hồng";

  const periodStart = new Date(details.periodStart).toLocaleDateString("vi-VN");
  const periodEnd = new Date(details.periodEnd).toLocaleDateString("vi-VN");
  const commissionRate = `${(details.commissionRate * 100).toFixed(2)}%`;

  return `Kỳ ${periodStart} - ${periodEnd} • Tỷ lệ ${commissionRate}`;
};

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "" | TransactionData["paymentTransactionType"]
  >("");
  const [statusFilter, setStatusFilter] = useState<
    "" | TransactionData["status"]
  >("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await getPaymentTransactionHistory();
        setTransactions(response);
      } catch (error) {
        const message =
          (error as { message?: string }).message ||
          "Không thể tải lịch sử giao dịch";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    return transactions.filter((item) => {
      const paymentDate = new Date(item.paymentDate);
      if (Number.isNaN(paymentDate.getTime())) return false;

      if (from && paymentDate < from) return false;
      if (to && paymentDate > to) return false;

      if (typeFilter && item.paymentTransactionType !== typeFilter)
        return false;
      if (statusFilter && item.status !== statusFilter) return false;

      return true;
    });
  }, [transactions, fromDate, toDate, typeFilter, statusFilter]);

  const totalAmount = useMemo(
    () =>
      filteredTransactions
        .filter((item) => item.status === "Success")
        .reduce((sum, item) => sum + item.totalAmount, 0),
    [filteredTransactions],
  );

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setTypeFilter("");
    setStatusFilter("");
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              QUản lý lịch sử giao dịch
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Lịch sử giao dịch
            </h1>
            <p className="max-w-4xl text-sm leading-6 text-slate-600">
              Theo dõi toàn bộ giao dịch mua gói và thanh toán hoa hồng của
              tenant. Bạn có thể lọc theo khoảng ngày, loại giao dịch và trạng
              thái.
            </p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Tổng giao dịch
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {isLoading ? (
                  <span className="inline-block h-8 w-14 animate-pulse rounded bg-slate-200" />
                ) : (
                  filteredTransactions.length
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Tổng tiền thành công
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-700">
                {isLoading ? (
                  <span className="inline-block h-8 w-40 animate-pulse rounded bg-slate-200" />
                ) : (
                  formatCurrency(totalAmount)
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Thành công
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {isLoading ? (
                  <span className="inline-block h-8 w-14 animate-pulse rounded bg-slate-200" />
                ) : (
                  filteredTransactions.filter(
                    (item) => item.status === "Success",
                  ).length
                )}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-slate-700">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-semibold">Bộ lọc giao dịch</span>
            </div>

            <div className="grid gap-3 lg:grid-cols-4">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <CalendarRange className="h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <CalendarRange className="h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <ReceiptText className="h-4 w-4 text-slate-400" />
                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(
                      e.target.value as
                        | ""
                        | TransactionData["paymentTransactionType"],
                    )
                  }
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="">Tất cả loại giao dịch</option>
                  {TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {typeLabelMap[type]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <CircleDollarSign className="h-4 w-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "" | TransactionData["status"],
                    )
                  }
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="">Tất cả trạng thái</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {statusLabelMap[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                <RotateCcw className="h-4 w-4" />
                Xóa bộ lọc
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-245 text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Mã giao dịch</th>
                    <th className="px-4 py-3">Ngày thanh toán</th>
                    <th className="px-4 py-3">Loại giao dịch</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Tổng tiền</th>
                    <th className="px-4 py-3">Chi tiết</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, rowIndex) => (
                      <tr key={`transaction-skeleton-row-${rowIndex}`}>
                        <td className="px-4 py-3">
                          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
                        </td>
                      </tr>
                    ))
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        Không có giao dịch phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((item) => {
                      const details =
                        item.paymentTransactionType === "Subscription"
                          ? getSubscriptionDescription(item.subscriptionDetails)
                          : getCommissionDescription(item.commissionDetails);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            #{item.transactionCode}
                          </td>
                          <td className="px-4 py-3">
                            {formatDateTime(item.paymentDate)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {typeLabelMap[item.paymentTransactionType]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColorMap[item.status]}`}
                            >
                              {statusLabelMap[item.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-emerald-700">
                            {formatCurrency(item.totalAmount)}
                          </td>
                          <td className="max-w-95 px-4 py-3">
                            <p
                              className="line-clamp-2 text-slate-600"
                              title={details}
                            >
                              {details}
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
