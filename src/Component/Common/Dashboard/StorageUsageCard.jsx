import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { formatFileSize } from "../../../services/dashboardService";

const SEGMENTS = [
  { key: "events", name: "Photos", color: "#f97316" },
  { key: "albums", name: "Albums", color: "#6366f1" },
];

const StorageUsageCard = ({ totalPhotoSize = 0, storageCapacityGB = 20, storageBreakdown }) => {
  const storageBytes = storageCapacityGB * 1024 * 1024 * 1024;
  const pct = Math.min((totalPhotoSize / storageBytes) * 100, 100);

  const chartData = SEGMENTS.map((seg) => ({
    ...seg,
    value: storageBreakdown?.[seg.key] ?? 0,
  })).filter((d) => d.value > 0);

  const hasData = chartData.length > 0;

  return (
    <div className="w-full bg-white rounded-xl p-3 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-slate-700 dark:text-white">Storage & Usage</h2>
        <Link to="/photographer/upgrade_plan" className="text-[10px] text-blue hover:underline">Upgrade</Link>
      </div>
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{formatFileSize(totalPhotoSize)}</p>
          <p className="text-[9px] text-slate-400">of {storageCapacityGB} GB Used</p>
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
        {SEGMENTS.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2 text-[10px]">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-slate-500 flex-1">{seg.name}</span>
            <span className="font-medium text-slate-700 dark:text-white">
              {formatFileSize(storageBreakdown?.[seg.key] ?? 0)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <div className="w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-700">
          <div className="bg-blue h-1.5 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[9px] text-slate-400 mt-0.5">{pct.toFixed(1)}% used</p>
      </div>
      <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-blue text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition">
        <CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />
      </button>
    </div>
  );
};

export default StorageUsageCard;
