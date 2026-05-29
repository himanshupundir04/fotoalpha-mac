import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fetchUploadActivity } from "../../../services/dashboardService";

const UploadActivityChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploadActivity(7)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full bg-white rounded-xl p-3 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
      <h2 className="text-xs font-semibold text-slate-700 dark:text-white mb-2">Upload Activity (7 Days)</h2>
      {loading ? (
        <div className="flex items-center justify-center h-40 text-xs text-slate-400">Loading...</div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} barGap={3} barCategoryGap="18%">
            <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Bar dataKey="uploaded" name="Photos Uploaded" fill="#6366f1" radius={[3, 3, 0, 0]} />
            <Bar dataKey="processed" name="Photos Processed" fill="#a78bfa" radius={[3, 3, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default UploadActivityChart;
