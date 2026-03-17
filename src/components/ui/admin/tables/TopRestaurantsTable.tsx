export default function TopRestaurantsTable() {
  const restaurants = [
    {
      name: "Sushi Tokyo",
      plan: "Premium",
      orders: 1240,
    },
    {
      name: "Pizza House",
      plan: "Basic",
      orders: 980,
    },
    {
      name: "Burger King",
      plan: "Premium",
      orders: 870,
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm">
      <h3 className="font-semibold mb-4">Top Performing Restaurants</h3>

      <table className="w-full text-sm">
        <thead className="text-gray-500">
          <tr>
            <th className="text-left">Restaurant</th>
            <th>Plan</th>
            <th>Orders</th>
          </tr>
        </thead>

        <tbody>
          {restaurants.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="py-3">{r.name}</td>

              <td>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded">
                  {r.plan}
                </span>
              </td>

              <td className="text-center">{r.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
