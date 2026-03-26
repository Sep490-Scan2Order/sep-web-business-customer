import { TenantDashboardRevenue } from "@/src/types/type";
import { formatVnd } from "./dashboardUtils";

type DashboardRestaurantsTableProps = {
  restaurants: TenantDashboardRevenue["restaurants"];
};

export default function DashboardRestaurantsTable({
  restaurants,
}: DashboardRestaurantsTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Doanh thu theo nhà hàng</h3>
      <p className="mt-1 text-xs text-slate-500">Sắp xếp theo net revenue giảm dần.</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-3">Nhà hàng</th>
              <th className="px-2 py-3">Trạng thái</th>
              <th className="px-2 py-3">Gói</th>
              <th className="px-2 py-3 text-right">Đơn hàng</th>
              <th className="px-2 py-3 text-right">Gross</th>
              <th className="px-2 py-3 text-right">Discount</th>
              <th className="px-2 py-3 text-right">Net</th>
              <th className="px-2 py-3 text-right">AOV</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-2 py-8 text-center text-slate-500">
                  Chưa có nhà hàng hoặc chưa có đơn hàng trong bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              restaurants.map((restaurant) => (
                <tr key={restaurant.restaurantId} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      {restaurant.image ? (
                        // Keep native img here because image source can be dynamic and externally hosted.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={restaurant.image}
                          alt={restaurant.restaurantName}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {restaurant.restaurantName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{restaurant.restaurantName}</p>
                        <p className="max-w-[320px] truncate text-xs text-slate-500">
                          {restaurant.address || "Chưa có địa chỉ"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        restaurant.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {restaurant.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-slate-700">{restaurant.currentPlan || "No Active Plan"}</td>
                  <td className="px-2 py-3 text-right font-medium text-slate-700">
                    {restaurant.totalOrders.toLocaleString("vi-VN")}
                  </td>
                  <td className="px-2 py-3 text-right font-medium text-slate-700">
                    {formatVnd(restaurant.grossRevenue)}
                  </td>
                  <td className="px-2 py-3 text-right font-medium text-amber-700">
                    {formatVnd(restaurant.totalDiscount)}
                  </td>
                  <td className="px-2 py-3 text-right font-semibold text-emerald-700">
                    {formatVnd(restaurant.netRevenue)}
                  </td>
                  <td className="px-2 py-3 text-right text-slate-700">
                    {formatVnd(restaurant.averageOrderValue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
