import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  fetchCurrentSubscription,
  getSubscriptionStatus,
} from "../../../services/subscriptionService";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("token");

const ROWS_PER_PAGE = 8;

function Billing({ paydata }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [id, setId] = useState();
  const [autoloading, setAutoloading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const statusInfo = subscription ? getSubscriptionStatus(subscription) : null;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const result = await fetchCurrentSubscription(token);
    if (result instanceof Error || result?.response) {
      setSubscription(null);
      setSubscriptionError(result?.response?.data?.message || "Unable to fetch subscription");
      return;
    }
    const subscriptionData = result?.data?.data;
    setId(subscriptionData?.id);
    setSubscription(subscriptionData);
    setSubscriptionError("");
  };

  const Data = (paydata || []).map((item) => ({
    amount: item?.amount,
    referenceid: item?.transaction_reference,
    createdAt: item?.subscription_id?.created_at || item?.subscription_id?.createdAt,
    payment_method: item?.payment_method,
    endDate:
      item?.subscription_id?.billing_cycle_anchor ||
      item?.subscription_id?.current_period_end ||
      item?.subscription_id?.end_date,
    status: item?.subscription_id?.status,
    payment: item?.status,
  }));

  const filtered = Data.filter((row) => {
    const q = search.toLowerCase();
    return (
      !q ||
      String(row.amount).includes(q) ||
      (row.referenceid || "").toLowerCase().includes(q) ||
      (row.payment_method || "").toLowerCase().includes(q) ||
      (row.status || "").toLowerCase().includes(q) ||
      (row.payment || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  const handleDownloadCSV = () => {
    const headers = ["Amount", "Date", "Method", "Reference ID", "Sub Status", "Payment", "End Date"];
    const rows = Data.map((r) => [
      `₹${r.amount}`,
      r.createdAt ? format(new Date(r.createdAt), "d MMM yyyy") : "—",
      (r.payment_method || "").toUpperCase(),
      r.referenceid || "—",
      r.status || "—",
      r.payment || "—",
      r.endDate ? format(new Date(r.endDate), "d MMM yyyy") : "—",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "billing-history.csv";
    a.click();
  };

  const handleCancel = async () => {
    setAutoloading(true);
    try {
      await axios.post(
        `${baseURL}/mysubscriptions/${id}/cancel`,
        { cancelAtPeriodEnd: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Subscription cancelled successfully");
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong while canceling");
    } finally {
      setAutoloading(false);
      setLoading(false);
    }
  };

  const hasSubscription = !!subscription;
  const isTrial = subscription?.status === "trial";
  const isCanceledOrPending = ["canceled", "pending"].includes(subscription?.status);
  const isActive = subscription?.status === "active";

  const totalPrice = (
    Number(subscription?.metadata?.plan_price || 0) +
    Number(subscription?.metadata?.gst_amount || 0)
  ).toFixed(2);

  const statusBadge = (val, type = "sub") => {
    if (!val) return null;
    const v = val.toLowerCase();
    const map = {
      active:    "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
      completed: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
      canceled:  "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400",
      pending:   "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      trial:     "bg-blue-50 text-blue dark:bg-blue-900/20 dark:text-blue-400",
      failed:    "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400",
    };
    const cls = map[v] || "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cls}`}>
        {val}
      </span>
    );
  };

  return (
    <section className="space-y-5 text-start">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Billing & Subscription</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your subscription plan and payment history.
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Plan</p>
        </div>

        <div className="px-6 py-5">
          {/* No subscription */}
          {!hasSubscription && subscriptionError && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  No Active Subscription
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{subscriptionError}</p>
              </div>
              <button
                onClick={() => navigate("/photographer/upgrade_plan")}
                className="flex-shrink-0 bg-blue text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                Upgrade Plan
              </button>
            </div>
          )}

          {/* Trial / Canceled / Pending */}
          {(isTrial || isCanceledOrPending) && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                {statusBadge(subscription?.status)}
                {statusInfo?.statusMessage && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    {statusInfo.statusMessage}
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate("/photographer/upgrade_plan")}
                className="flex-shrink-0 bg-blue text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                Upgrade Plan
              </button>
            </div>
          )}

          {/* Active */}
          {isActive && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  {statusBadge("active")}
                  <p className="text-base font-bold text-slate-800 dark:text-white">
                    {subscription?.plan?.name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-5 text-xs text-slate-500 dark:text-slate-400">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Monthly Price</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">₹{totalPrice}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Next Due</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {subscription?.billing_cycle_anchor
                        ? format(new Date(subscription.billing_cycle_anchor), "d MMM yyyy")
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Plan Price</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      ₹{subscription?.metadata?.plan_price || 0}
                      <span className="text-[10px] text-slate-400 ml-1">
                        + ₹{subscription?.metadata?.gst_amount || 0} GST
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/photographer/upgrade_plan")}
                  className="text-xs font-semibold text-blue border border-blue px-4 py-2 rounded-xl hover:bg-blue hover:text-white transition-all"
                >
                  Change Plan
                </button>
                <button
                  onClick={handleCancel}
                  disabled={autoloading}
                  className="text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                >
                  {autoloading ? (
                    <span className="flex items-center gap-1.5">
                      <CircularProgress size={10} color="inherit" /> Canceling…
                    </span>
                  ) : "Cancel Auto-Renewal"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-50 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Billing History</p>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" sx={{ fontSize: 14 }} />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue/30 w-44"
              />
            </div>
            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              title="Download CSV"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <DownloadIcon sx={{ fontSize: 14 }} /> CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <CircularProgress size={28} sx={{ color: "#0b8599" }} />
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-slate-600">
            <DownloadIcon sx={{ fontSize: 36 }} />
            <p className="text-xs font-semibold mt-2 uppercase tracking-widest">No billing records</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-slate-700">
                    {["Amount", "Date", "Method", "Reference ID", "Sub Status", "Payment", "End Date"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {paginated.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-white whitespace-nowrap">
                        ₹{row.amount}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {row.createdAt ? format(new Date(row.createdAt), "d MMM yyyy") : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 uppercase whitespace-nowrap">
                        {row.payment_method || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="group inline-flex items-center gap-1.5">
                          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px] block">
                            {row.referenceid || "—"}
                          </span>
                          {row.referenceid && (
                            <button
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(row.referenceid);
                                  toast.success("Reference ID copied", { autoClose: 1000 });
                                } catch {
                                  toast.error("Failed to copy");
                                }
                              }}
                              title="Copy Reference ID"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue"
                            >
                              <ContentCopyIcon sx={{ fontSize: 12 }} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">{statusBadge(row.status)}</td>
                      <td className="px-5 py-3.5">{statusBadge(row.payment, "pay")}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {row.endDate ? format(new Date(row.endDate), "d MMM yyyy") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50 dark:border-slate-700">
                <p className="text-[10px] text-slate-400">
                  Showing {page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        page === i
                          ? "bg-blue text-white border-blue"
                          : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Billing;
