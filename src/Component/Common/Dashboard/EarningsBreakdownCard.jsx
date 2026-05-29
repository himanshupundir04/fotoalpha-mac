import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../../services/dashboardService";

const SEGMENTS = [
  { key: "photoSales", name: "Photos Sales", color: "#6366f1" },
  { key: "printOrders", name: "Print Orders", color: "#a78bfa" },
  { key: "albums", name: "Albums", color: "#22c55e" },
];

const EarningsBreakdownCard = ({ totalEarnings, printOrdersAmount = 0 }) => {
  const chartData = [
    { name: "Photos Sales", value: totalEarnings || 0, color: "#6366f1" },
    { name: "Print Orders", value: printOrdersAmount, color: "#a78bfa" },
  ].filter((d) => d.value > 0);

  const hasData = chartData.length > 0;

  return (
    <div className="w-full bg-white rounded-xl p-3 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-slate-700 dark:text-white">Earnings Breakdown</h2>
        <span className="text-[9px] text-slate-400">This Month</span>
      </div>
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalEarnings)}</p>
          <p className="text-[9px] text-slate-400">Total Earnings</p>
        </div>
        <div className="w-16 h-16 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={hasData ? chartData : [{ name: "empty", value: 1, color: "#e2e8f0" }]}
                cx="50%"
                cy="50%"
                innerRadius={18}
                outerRadius={28}
                dataKey="value"
                strokeWidth={0}
              >
                {(hasData ? chartData : [{ color: "#e2e8f0" }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="space-y-1 mt-2">
        {SEGMENTS.map((seg) => {
          if (seg.key === "albums") {
            return (
              <div key={seg.key} className="flex items-center gap-2 text-[10px]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-slate-500 flex-1">{seg.name}</span>
                <span className="text-[9px] font-medium text-slate-400 italic">Coming Soon</span>
              </div>
            );
          }
          const value = seg.key === "photoSales" ? (totalEarnings || 0) : printOrdersAmount;
          return (
            <div key={seg.key} className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-slate-500 flex-1">{seg.name}</span>
              <span className="font-medium text-slate-700 dark:text-white">{formatCurrency(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EarningsBreakdownCard;
