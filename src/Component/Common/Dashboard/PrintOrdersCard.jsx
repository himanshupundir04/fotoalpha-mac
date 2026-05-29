import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { fetchPrintOrderStats } from "../../../services/dashboardService";

const SLICES = [
  { key: "in_production", name: "In Production", color: "#6366f1" },
  { key: "shipped",       name: "Shipped",        color: "#22c55e" },
  { key: "delivered",     name: "Delivered",      color: "#a78bfa" },
];

const PrintOrdersCard = () => {
  const [stats, setStats] = useState({ in_production: 0, shipped: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrintOrderStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const data = SLICES.map((s) => ({ ...s, value: stats[s.key] || 0 }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="w-full bg-white rounded-xl p-3 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-slate-700 dark:text-white">Print Orders</h2>
        <Link to="/photographer/print_orders" className="text-[10px] text-blue hover:underline">View all orders →</Link>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-20 text-xs text-slate-400">Loading...</div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{total}</p>
              <p className="text-[9px] text-slate-400">Active Orders</p>
            </div>
            <div className="w-16 h-16 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={total > 0 ? data : [{ value: 1, color: "#e2e8f0" }]} cx="50%" cy="50%" innerRadius={18} outerRadius={28} dataKey="value" strokeWidth={0}>
                    {(total > 0 ? data : [{ color: "#e2e8f0" }]).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1 mt-2">
            {data.map((d) => (
              <div key={d.key} className="flex items-center gap-2 text-[10px]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-500 flex-1">{d.name}</span>
                <span className="font-medium text-slate-700 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PrintOrdersCard;
