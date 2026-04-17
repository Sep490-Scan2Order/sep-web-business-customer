"use client";

import { useEffect, useMemo, useState } from "react";
import { Database } from "lucide-react";
import { toast } from "react-toastify";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getCommissionRevenueTrends,
  getSubscriptionRevenueByPlan,
  getSubscriptionRevenueTrends,
} from "@/src/services/adminService";
import { RevenueResponse, SubscriptionRevenueByPlan } from "@/src/types/type";

type RevenueFilterType = "all" | "commission" | "subscription" | "byPlan";

const MONTH_OPTIONS = [1, 2, 3, 6, 9, 12] as const;
const PIE_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#9333ea", "#dc2626"];

const formatVnd = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

function RevenueEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-4 flex h-80 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
      <div className="mb-3 rounded-full bg-white p-3 shadow-sm">
        <Database className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-base font-semibold text-slate-700">{title}</p>
      <p className="mt-1 max-w-md px-6 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default function RevenuePage() {
  const [months, setMonths] = useState<(typeof MONTH_OPTIONS)[number]>(12);
  const [filterType, setFilterType] = useState<RevenueFilterType>("all");

  const [loading, setLoading] = useState(true);
  const [subscriptionRevenue, setSubscriptionRevenue] = useState<
    RevenueResponse["data"]
  >([]);
  const [commissionRevenue, setCommissionRevenue] = useState<
    RevenueResponse["data"]
  >([]);
  const [revenueByPlan, setRevenueByPlan] = useState<
    SubscriptionRevenueByPlan["data"]
  >([]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const [subscriptionData, commissionData, planData] = await Promise.all([
          getSubscriptionRevenueTrends(months),
          getCommissionRevenueTrends(months),
          getSubscriptionRevenueByPlan(months),
        ]);

        setSubscriptionRevenue(subscriptionData);
        setCommissionRevenue(commissionData);
        setRevenueByPlan(planData);
      } catch (error) {
        const message =
          (error as { message?: string }).message ||
          "Không thể tải dữ liệu doanh thu";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [months]);

  const totalSubscriptionRevenue = useMemo(
    () => subscriptionRevenue.reduce((sum, item) => sum + item.revenue, 0),
    [subscriptionRevenue],
  );

  const totalCommissionRevenue = useMemo(
    () => commissionRevenue.reduce((sum, item) => sum + item.revenue, 0),
    [commissionRevenue],
  );

  const totalPlanRevenue = useMemo(
    () => revenueByPlan.reduce((sum, item) => sum + item.revenue, 0),
    [revenueByPlan],
  );

  const shouldShowSubscription =
    filterType === "all" || filterType === "subscription";
  const shouldShowCommission =
    filterType === "all" || filterType === "commission";
  const shouldShowByPlan = filterType === "all" || filterType === "byPlan";

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý doanh thu</h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi doanh thu hoa hồng, doanh thu gói dịch vụ và doanh thu theo
          từng gói theo tháng.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Khoảng thời gian
            </label>
            <select
              value={months}
              onChange={(e) =>
                setMonths(
                  Number(e.target.value) as (typeof MONTH_OPTIONS)[number],
                )
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
            >
              {MONTH_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value} tháng
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Bộ lọc hiển thị
            </label>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as RevenueFilterType)
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
            >
              <option value="all">Tất cả</option>
              <option value="commission">Doanh thu hoa hồng</option>
              <option value="subscription">Doanh thu gói</option>
              <option value="byPlan">Doanh thu từng gói</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Hoa hồng
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {formatVnd(totalCommissionRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Gói dịch vụ
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {formatVnd(totalSubscriptionRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Tổng theo từng gói
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {formatVnd(totalPlanRevenue)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Đang tải dữ liệu doanh thu...
        </div>
      ) : null}

      {!loading && shouldShowSubscription ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Doanh thu theo gói dịch vụ
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Dữ liệu doanh thu đăng ký/gia hạn gói trong {months} tháng gần nhất.
          </p>
          {subscriptionRevenue.length === 0 ? (
            <RevenueEmptyState
              title="Chưa có dữ liệu doanh thu gói"
              description="Không có bản ghi doanh thu gói dịch vụ trong khoảng thời gian đã chọn."
            />
          ) : (
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={subscriptionRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) => value.toLocaleString("vi-VN")}
                  />
                  <Tooltip formatter={(value) => formatVnd(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu gói"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : null}

      {!loading && shouldShowCommission ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Doanh thu hoa hồng
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Dữ liệu thanh toán phí hoa hồng trong {months} tháng gần nhất.
          </p>
          {commissionRevenue.length === 0 ? (
            <RevenueEmptyState
              title="Chưa có dữ liệu doanh thu hoa hồng"
              description="Không có bản ghi doanh thu hoa hồng trong khoảng thời gian đã chọn."
            />
          ) : (
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={commissionRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) => value.toLocaleString("vi-VN")}
                  />
                  <Tooltip formatter={(value) => formatVnd(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu hoa hồng"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : null}

      {!loading && shouldShowByPlan ? (
        revenueByPlan.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Doanh thu từng gói
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Cơ cấu doanh thu theo từng gói trong {months} tháng.
            </p>
            <RevenueEmptyState
              title="Chưa có dữ liệu doanh thu theo gói"
              description="Không có bản ghi doanh thu cho từng gói dịch vụ trong khoảng thời gian đã chọn."
            />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Doanh thu từng gói
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Cơ cấu doanh thu theo từng gói trong {months} tháng.
              </p>

              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByPlan}
                      dataKey="revenue"
                      nameKey="planName"
                      outerRadius={110}
                      label={({ name, percent }) =>
                        `${name}: ${((percent || 0) * 100).toFixed(1)}%`
                      }
                    >
                      {revenueByPlan.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.planId}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatVnd(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Chi tiết theo gói
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Bảng doanh thu và tỷ trọng theo từng gói dịch vụ.
              </p>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Tên gói</th>
                      <th className="px-4 py-3">Doanh thu</th>
                      <th className="px-4 py-3">Tỷ trọng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {revenueByPlan.map((item) => (
                      <tr key={item.planId}>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {item.planName}
                        </td>
                        <td className="px-4 py-3">{formatVnd(item.revenue)}</td>
                        <td className="px-4 py-3">
                          {item.percentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
