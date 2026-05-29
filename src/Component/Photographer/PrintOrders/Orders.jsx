import { CircularProgress } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BASE_URL;

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const STATUS_META = {
  pending:       { label: "Pending",        bg: "from-yellow-400 to-orange-400" },
  accepted:      { label: "Accepted",       bg: "from-blue-400 to-blue-500" },
  in_production: { label: "In Production",  bg: "from-indigo-400 to-purple-500" },
  shipped:       { label: "Shipped",        bg: "from-green-400 to-emerald-400" },
  delivered:     { label: "Delivered",      bg: "from-emerald-500 to-teal-500" },
  rejected:      { label: "Rejected",       bg: "from-red-400 to-pink-400" },
  cancelled:     { label: "Cancelled",      bg: "from-gray-400 to-gray-500" },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-gradient-to-r ${meta.bg} text-white shadow-lg`}>
      {meta.label}
    </span>
  );
}

function Order() {
  const [orderLoading, setOrderLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentOrderPhotos, setCurrentOrderPhotos] = useState([]);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setOrderLoading(true);
    try {
      const res = await axios.get(`${baseURL}/photographer/print-requests`, { headers: authHeader() });
      const filtered = (res.data.data || []).filter((item) => item.photos && item.photos.length >= 1);
      setOrders(filtered);
      const initialAmounts = {};
      filtered.forEach((o) => { initialAmounts[o._id] = o.amount ?? 0; });
      setAmounts(initialAmounts);
    } finally {
      setOrderLoading(false);
    }
  };

  const setLoading = (id, val) => setActionLoading((prev) => ({ ...prev, [id]: val }));

  const handleReject = async (orderId) => {
    setLoading(orderId, true);
    try {
      await axios.patch(`${baseURL}/photographer/print-requests/${orderId}/reject`, {}, { headers: authHeader() });
      toast.success("Order rejected");
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject");
    } finally {
      setLoading(orderId, false);
    }
  };

  const handleAccept = async (orderId) => {
    setLoading(orderId, true);
    try {
      await axios.patch(`${baseURL}/photographer/print-requests/${orderId}/accept`, {}, { headers: authHeader() });
      toast.success("Order accepted");
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to accept");
    } finally {
      setLoading(orderId, false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setLoading(orderId, true);
    try {
      await axios.patch(
        `${baseURL}/photographer/print-requests/${orderId}/status`,
        { status: newStatus, amount: amounts[orderId] ?? 0 },
        { headers: authHeader() }
      );
      toast.success(`Marked as ${STATUS_META[newStatus]?.label}`);
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(orderId, false);
    }
  };

  const handleAmountSave = async (orderId) => {
    setLoading(orderId + "_amt", true);
    try {
      await axios.patch(
        `${baseURL}/photographer/print-requests/${orderId}/amount`,
        { amount: amounts[orderId] ?? 0 },
        { headers: authHeader() }
      );
      toast.success("Amount saved");
    } catch (err) {
      toast.error("Failed to save amount");
    } finally {
      setLoading(orderId + "_amt", false);
    }
  };

  const NEXT_STATUS = { accepted: "in_production", in_production: "shipped", shipped: "delivered" };

  const renderActions = (order) => {
    const busy = actionLoading[order._id];
    if (order.status === "pending") {
      return (
        <div className="flex space-x-3">
          <button onClick={() => handleReject(order._id)} disabled={busy}
            className="flex-1 bg-red-600 text-sm text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50">
            Reject
          </button>
          <button onClick={() => handleAccept(order._id)} disabled={busy}
            className="flex-1 bg-blue text-sm text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50">
            Accept
          </button>
        </div>
      );
    }

    const nextStatus = NEXT_STATUS[order.status];
    const showProgression = !!nextStatus;

    return (
      <div className="space-y-3">
        {/* Amount field */}
        {["accepted", "in_production", "shipped", "delivered"].includes(order.status) && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">Amount (₹)</label>
            <input
              type="number"
              min="0"
              value={amounts[order._id] ?? 0}
              onChange={(e) => setAmounts((prev) => ({ ...prev, [order._id]: parseFloat(e.target.value) || 0 }))}
              className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={() => handleAmountSave(order._id)}
              disabled={actionLoading[order._id + "_amt"]}
              className="px-3 py-1 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600 disabled:opacity-50">
              Save
            </button>
          </div>
        )}

        {/* Status progression */}
        {showProgression && (
          <button
            onClick={() => handleStatusUpdate(order._id, nextStatus)}
            disabled={busy}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-sm text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50">
            {busy ? "Updating…" : `Mark as ${STATUS_META[nextStatus]?.label}`}
          </button>
        )}

        {order.status === "delivered" && (
          <p className="text-center text-xs text-emerald-600 font-semibold py-1">Order delivered ✓</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 text-start dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-bold">Print Orders</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your photography print requests</p>
        </div>

        {orderLoading ? (
          <div className="flex justify-center items-center h-96">
            <CircularProgress size={60} className="text-blue" />
          </div>
        ) : orders.length === 0 ? (
          <div className="space-y-6">
            {/* Hero empty state */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center text-center">
              {/* Illustration */}
              <div className="relative mb-8">
                <div className="w-36 h-36 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center shadow-inner">
                  <svg className="w-20 h-20 text-blue-300 dark:text-blue-500" viewBox="0 0 80 80" fill="none">
                    <rect x="10" y="18" width="46" height="38" rx="4" fill="currentColor" opacity="0.15" />
                    <rect x="14" y="22" width="46" height="38" rx="4" fill="currentColor" opacity="0.25" />
                    <rect x="18" y="26" width="46" height="38" rx="4" fill="currentColor" opacity="0.4" />
                    <rect x="22" y="14" width="36" height="26" rx="3" fill="white" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M28 32 l6-6 4 4 4-5 6 7H28z" fill="currentColor" opacity="0.5" />
                    <circle cx="32" cy="24" r="2.5" fill="currentColor" opacity="0.6" />
                    <rect x="22" y="44" width="36" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
                    <rect x="22" y="50" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
                  </svg>
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </span>
                <span className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" /></svg>
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">No Print Orders Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-base max-w-md leading-relaxed">
                You don't have any print orders at the moment.<br />
                When your clients place print requests from their gallery, they will appear here.
              </p>
            </div>

            {/* How it works info card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5 flex gap-4 items-start">
              <div className="flex-shrink-0 w-9 h-9 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">How print orders are created?</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  Clients can request prints directly from their event gallery using the "Print Photos" option.
                  Once they place an order, it will appear here for you to review and process.
                </p>
              </div>
            </div>

            {/* Workflow steps */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">Print Order Workflow</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  {
                    icon: (
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ),
                    bg: "bg-blue-50 dark:bg-blue-900/30",
                    title: "Client selects photos",
                    desc: "Client chooses photos from their gallery",
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    ),
                    bg: "bg-orange-50 dark:bg-orange-900/30",
                    title: "Places print request",
                    desc: "Client selects sizes, quantities & submits",
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    ),
                    bg: "bg-purple-50 dark:bg-purple-900/30",
                    title: "You receive order",
                    desc: "Order appears here for your review",
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    ),
                    bg: "bg-emerald-50 dark:bg-emerald-900/30",
                    title: "Process & deliver",
                    desc: "Print, package and deliver to client",
                  },
                ].map((step, i, arr) => (
                  <div key={i} className="flex flex-col items-center text-center relative">
                    <div className={`w-12 h-12 ${step.bg} rounded-2xl flex items-center justify-center mb-3`}>
                      {step.icon}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{step.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                    {i < arr.length - 1 && (
                      <svg className="hidden md:block absolute top-6 -right-3 w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 text-start">
            {orders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate">{order?.event?.name}</h2>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Amount display */}
                  {order.amount > 0 && (
                    <div className="mb-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      ₹{order.amount.toLocaleString("en-IN")}
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Requested Photos ({order?.photos?.length})
                    </p>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {order.photos.slice(0, 5).map((photo, index) => (
                        <div key={photo?._id} className="flex-shrink-0">
                          <img
                            src={photo?.thumbnailSignedUrl || photo?.imageSignedUrl}
                            alt={photo?.filename}
                            onClick={() => { setCurrentOrderPhotos(order.photos); setCurrentPhotoIndex(index); setSelectedPhoto(photo); }}
                            className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-colors duration-200 cursor-pointer"
                          />
                        </div>
                      ))}
                      {order.photos.length > 5 && (
                        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          +{order.photos.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6 space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">Requested by:</span>
                      <span className="ml-1 text-gray-800 dark:text-white">{order?.requestedBy?.name}</span>
                    </div>
                  </div>

                  {renderActions(order)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={() => setSelectedPhoto(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-50" onClick={() => setSelectedPhoto(null)}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {currentOrderPhotos.length > 1 && (
            <button className="absolute left-4 text-white p-2 z-50 bg-black bg-opacity-50 rounded-full"
              onClick={(e) => { e.stopPropagation(); const i = currentPhotoIndex === 0 ? currentOrderPhotos.length - 1 : currentPhotoIndex - 1; setCurrentPhotoIndex(i); setSelectedPhoto(currentOrderPhotos[i]); }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          {currentOrderPhotos.length > 1 && (
            <button className="absolute right-4 text-white p-2 z-50 bg-black bg-opacity-50 rounded-full"
              onClick={(e) => { e.stopPropagation(); const i = currentPhotoIndex === currentOrderPhotos.length - 1 ? 0 : currentPhotoIndex + 1; setCurrentPhotoIndex(i); setSelectedPhoto(currentOrderPhotos[i]); }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
          <img src={selectedPhoto?.imageSignedUrl || selectedPhoto?.thumbnailSignedUrl} alt={selectedPhoto?.filename} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {currentPhotoIndex + 1} / {currentOrderPhotos.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;
