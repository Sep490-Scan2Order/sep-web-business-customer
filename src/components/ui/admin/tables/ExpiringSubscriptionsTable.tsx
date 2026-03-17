export default function ExpiringSubscriptionsTable() {
  const subs = [
    {
      restaurant: "Thai Food Hub",
      plan: "Basic",
      expire: "3 days",
    },
    {
      restaurant: "BBQ Garden",
      plan: "Premium",
      expire: "5 days",
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm">
      <h3 className="font-semibold mb-4">Expiring Subscriptions</h3>

      <table className="w-full text-sm">
        <thead className="text-gray-500">
          <tr>
            <th className="text-left">Restaurant</th>
            <th>Plan</th>
            <th>Expire In</th>
          </tr>
        </thead>

        <tbody>
          {subs.map((s, i) => (
            <tr key={i} className="border-t">
              <td className="py-3">{s.restaurant}</td>

              <td>{s.plan}</td>

              <td className="text-red-500">{s.expire}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
