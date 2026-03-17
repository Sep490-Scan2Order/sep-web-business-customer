import StatCard from "./StatCard";
import { Store, ShoppingCart, Wallet, Users } from "lucide-react";

export default function StatCards() {
  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <StatCard
          title="Total Restaurants"
          value="1,245"
          trend="+15% this month"
          icon={<Store size={20} />}
        />
      </div>

      <div className="flex-1">
        <StatCard
          title="Platform Orders"
          value="45,890"
          trend="+10% this month"
          icon={<ShoppingCart size={20} />}
        />
      </div>

      <div className="flex-1">
        <StatCard
          title="Platform Revenue"
          value="$25,400"
          trend="+18% this month"
          icon={<Wallet size={20} />}
        />
      </div>

      <div className="flex-1">
        <StatCard
          title="Active Accounts"
          value="890"
          trend="+6% this month"
          icon={<Users size={20} />}
        />
      </div>
    </div>
  );
}
