import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { showConfirmDialog } from "../../../services/confirmDialog";
import jsQR from "jsqr";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import InfoIcon from "@mui/icons-material/Info";
import BoltIcon from "@mui/icons-material/Bolt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { CircularProgress, Modal, Box } from "@mui/material";

const baseURL = import.meta.env.VITE_BASE_URL;

function Billing() {
  const [billingData, setBillingData] = useState();
  const [currentQRCodeUrl, setCurrentQRCodeUrl] = useState("");
  const modalFileInputRef = useRef(null);
  const [clients, setClients] = useState([]);
  const [unprice, setUnprice] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [sendingClientId, setSendingClientId] = useState(null);
  const [errorqr, setErrorqr] = useState();
  const [uploadqr, setUploadqr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  const [paymentPage, setPaymentPage] = useState(0);
  const [eventPage, setEventPage] = useState(0);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/events/billables`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
      });
      setBillingData(response.data.data.summary);
      setClients(response.data.data.unpaidEvents || []);
      setUnprice(response.data.data.unpricedEvents || []);
      setRecentActivity(
        response.data.data.recentActivity ||
          response.data.data.activities ||
          []
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsAppMessage = async (client) => {
    setSendingClientId(client.eventId);
    const result = await showConfirmDialog({
      title: "Send WhatsApp Reminder?",
      description: `Send a payment reminder to ${client.hostName} at ${client.hostMobile || "their registered number"}?`,
      confirmText: "Yes, send it",
      cancelText: "Cancel",
    });
    if (!result.isConfirmed) { setSendingClientId(null); return; }
    try {
      await axios.post(
        `${baseURL}/photographer/send-payment-reminder`,
        {
          phone: client?.hostMobile || "",
          clientName: client?.hostName || "",
          remainingAmount: client?.remainingAmount || "",
          eventName: client?.eventName || "",
          paymentLink: "",
          qrUrl: client?.qrCodeUrl || "",
          photographerName: client?.photographerName || "",
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("WhatsApp message sent successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send WhatsApp message");
    } finally {
      setSendingClientId(null);
    }
  };

  const validateQRCode = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (!code) resolve("Please upload a valid QR code image");
        else resolve(null);
      };
    });

  const handleUploadNewQRCode = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const error = await validateQRCode(file);
    setErrorqr(error);
    if (error) {
      setCurrentQRCodeUrl("");
      formik.setFieldValue("qrCode", "");
      toast.error(error);
      return;
    }
    setCurrentQRCodeUrl(URL.createObjectURL(file));
    formik.setFieldValue("qrCode", file);
  };

  const handleDeleteQRCode = async () => {
    const result = await showConfirmDialog({
      title: "Delete QR Code?",
      description: "Are you sure you want to delete your current QR code? This cannot be undone.",
      confirmText: "Yes, delete it",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${baseURL}/photographer/delete-qr`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("QR code deleted successfully");
      setShowQRModal(false);
      fetchBillingData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete QR code");
    }
  };

  const formik = useFormik({
    initialValues: { qrCode: "" },
    onSubmit: async (values) => {
      if (!values.qrCode) { toast.error("Please select a QR code image to upload"); return; }
      setUploadqr(true);
      try {
        const formData = new FormData();
        formData.append("qrCode", values.qrCode);
        await axios.put(`${baseURL}/photographer/upload-qr`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("QR code updated successfully");
        formik.resetForm();
        setCurrentQRCodeUrl("");
        setShowQRModal(false);
        fetchBillingData();
      } catch {
        toast.error("Failed to upload QR code");
      } finally {
        setUploadqr(false);
      }
    },
  });

  const handleDownloadQR = async () => {
    const url = billingData?.qrCodeUrl;
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "payment-qr.png";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error("Failed to download QR code");
    }
  };

  const handleShareQR = async () => {
    const url = billingData?.qrCodeUrl;
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Payment QR Code", text: "Scan to pay via UPI", url });
      } catch (err) {
        if (err.name !== "AbortError") toast.error("Share failed");
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("QR link copied to clipboard");
    }
  };

  const paginatedPayments = clients.slice(paymentPage * itemsPerPage, (paymentPage + 1) * itemsPerPage);
  const paginatedEvents = unprice.slice(eventPage * itemsPerPage, (eventPage + 1) * itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <CircularProgress sx={{ color: "#0b8599" }} />
      </div>
    );
  }

  const receivedPercent = billingData?.totalAmount
    ? Math.min((billingData.totalReceived / billingData.totalAmount) * 100, 100)
    : 0;

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20";
      case "overdue": return "bg-red-50 text-red-500 dark:bg-red-900/20";
      default: return "bg-amber-50 text-amber-600 dark:bg-amber-900/20";
    }
  };

  return (
    <div className="pb-10 space-y-6 text-start">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Accounts
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Track payments, manage invoices, and get paid faster.
          </p>
        </div>
        <svg className="w-5 h-5 text-indigo-300 mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l1.09 6.26L19 6l-4.26 4.91L21 12l-6.26 1.09L18 19l-4.91-4.26L12 21l-1.09-6.26L5 18l4.26-4.91L3 12l6.26-1.09L6 5l4.91 4.26L12 2z" />
        </svg>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Total Invoiced
            </span>
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <AccountBalanceWalletIcon className="text-blue-500" sx={{ fontSize: 18 }} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{billingData?.totalAmount?.toLocaleString("en-IN") || 0}
          </p>
          <div className="flex items-center gap-1 mt-3 text-[10px] font-semibold text-blue-500">
            <BoltIcon sx={{ fontSize: 12 }} /> Updated just now
          </div>
        </div>

        {/* Received */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Received
            </span>
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
              <PaymentsIcon className="text-emerald-500" sx={{ fontSize: 18 }} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{billingData?.totalReceived?.toLocaleString("en-IN") || 0}
          </p>
          <div className="mt-3">
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${receivedPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {receivedPercent.toFixed(0)}% of total invoiced
            </p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
              Pending
            </span>
            <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
              <PendingActionsIcon className="text-red-500" sx={{ fontSize: 18 }} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">
            ₹{billingData?.remainingTotal?.toLocaleString("en-IN") || 0}
          </p>
          <div className="flex items-center gap-1 mt-3 text-[10px] font-semibold text-red-500">
            <InfoIcon sx={{ fontSize: 12 }} /> {clients.length} accounts due
          </div>
        </div>

        {/* QR Collection Hub */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            QR Collection Hub
          </p>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
              {billingData?.qrCodeUrl ? (
                <img
                  src={billingData.qrCodeUrl}
                  alt="QR"
                  className="w-14 h-14 object-contain rounded-lg"
                />
              ) : (
                <QrCodeScannerIcon className="text-slate-300" sx={{ fontSize: 30 }} />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-blue dark:text-blue-400">QR PAYMENTS</p>
              <button
                onClick={() => setShowQRModal(true)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                View QR <ArrowForwardIosIcon sx={{ fontSize: 10 }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments + Unpriced Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Payments */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Pending Payments
              </h3>
              <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue px-2 py-0.5 rounded-full">
                {clients.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {clients.length > itemsPerPage && (
                <>
                  <button
                    onClick={() => setPaymentPage((p) => Math.max(0, p - 1))}
                    disabled={paymentPage === 0}
                    className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
                  >
                    <ArrowBackIosNewIcon sx={{ fontSize: 10 }} />
                  </button>
                  <button
                    onClick={() => setPaymentPage((p) => Math.min(Math.ceil(clients.length / itemsPerPage) - 1, p + 1))}
                    disabled={(paymentPage + 1) * itemsPerPage >= clients.length}
                    className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
                  >
                    <ArrowForwardIosIcon sx={{ fontSize: 10 }} />
                  </button>
                </>
              )}
              <button className="text-sm font-semibold text-blue hover:opacity-75 transition-opacity">
                View all
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {paginatedPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-slate-600">
                <PaymentsIcon sx={{ fontSize: 40 }} />
                <p className="text-xs font-semibold mt-2 uppercase tracking-widest">
                  No pending payments
                </p>
              </div>
            ) : (
              paginatedPayments.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <button
                    onClick={() => navigate(`/photographer/event/${client.eventId}`)}
                    className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-sm flex-shrink-0"
                  >
                    {client?.hostName?.charAt(0)?.toUpperCase() || "C"}
                  </button>

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/photographer/event/${client.eventId}`)}
                  >
                    <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                      {client.hostName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {client.invoiceNumber
                        ? `Invoice #${client.invoiceNumber}`
                        : client.eventName || "General Event"}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0 mr-2">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">
                      ₹{client.remainingAmount?.toLocaleString("en-IN")}
                    </p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded uppercase">
                      {client.status === "overdue" ? "OVERDUE" : "DUE"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleSendWhatsAppMessage(client)}
                      disabled={sendingClientId === client.eventId}
                      title="Send WhatsApp reminder"
                      className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all disabled:opacity-50"
                    >
                      {sendingClientId === client.eventId ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <WhatsAppIcon sx={{ fontSize: 16 }} />
                      )}
                    </button>
                    <a
                      href={`mailto:${client.hostEmail || ""}`}
                      title="Send email reminder"
                      className="w-8 h-8 rounded-full bg-blue-50 text-blue flex items-center justify-center hover:bg-blue hover:text-white transition-all"
                    >
                      <EmailIcon sx={{ fontSize: 16 }} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unpriced Events */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Unpriced Events
              </h3>
              <InfoIcon className="text-slate-300" sx={{ fontSize: 16 }} />
            </div>
            <div className="flex items-center gap-2">
              {unprice.length > itemsPerPage && (
                <>
                  <button
                    onClick={() => setEventPage((p) => Math.max(0, p - 1))}
                    disabled={eventPage === 0}
                    className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
                  >
                    <ArrowBackIosNewIcon sx={{ fontSize: 10 }} />
                  </button>
                  <button
                    onClick={() => setEventPage((p) => Math.min(Math.ceil(unprice.length / itemsPerPage) - 1, p + 1))}
                    disabled={(eventPage + 1) * itemsPerPage >= unprice.length}
                    className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
                  >
                    <ArrowForwardIosIcon sx={{ fontSize: 10 }} />
                  </button>
                </>
              )}
              <button className="text-sm font-semibold text-blue hover:opacity-75 transition-opacity">
                View all
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {paginatedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-slate-600">
                <CalendarTodayIcon sx={{ fontSize: 40 }} />
                <p className="text-xs font-semibold mt-2 uppercase tracking-widest">
                  All events priced
                </p>
              </div>
            ) : (
              paginatedEvents.map((event) => (
                <div
                  key={event.eventId}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <CalendarTodayIcon className="text-blue-400" sx={{ fontSize: 18 }} />
                  </div>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/photographer/event/${event.eventId}`, { state: { activeTab: "payment" } })}
                  >
                    <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                      {event.eventName || "Unnamed Event"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight truncate">
                      Event ID: {event.eventId}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/photographer/event/${event.eventId}`, { state: { activeTab: "payment" } })}
                    className="flex-shrink-0 bg-blue text-white rounded-xl px-4 py-2 text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95"
                  >
                    Create Invoice
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Recent Activity
            </h3>
            <button className="text-sm font-semibold text-blue hover:opacity-75 transition-opacity">
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {recentActivity.map((activity, i) => {
                  const isPayment = activity.type?.toLowerCase().includes("payment");
                  const dateObj = activity.date || activity.createdAt ? new Date(activity.date || activity.createdAt) : null;
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPayment ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" : "bg-purple-50 dark:bg-purple-900/20 text-purple-500"}`}>
                          {isPayment
                            ? <PaymentsIcon sx={{ fontSize: 18 }} />
                            : <ReceiptLongIcon sx={{ fontSize: 18 }} />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {activity.title || (isPayment ? "Payment Received" : "Invoice Created")}
                        </p>
                        <p className="text-xs text-slate-400">
                          {activity.description || activity.invoiceNumber || ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                          ₹{activity.amount?.toLocaleString("en-IN") || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${statusStyle(activity.status)}`}>
                          {activity.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {dateObj ? (
                          <>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                            <p className="text-xs text-slate-400">
                              {dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-400">—</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Management Modal */}
      <Modal
        open={showQRModal}
        onClose={() => setShowQRModal(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box className="m-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl outline-none max-w-2xl w-full mx-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue to-indigo-400" />

          <button
            onClick={() => setShowQRModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors z-10"
          >
            <CloseIcon />
          </button>

          {/* Horizontal layout: QR image left, controls right */}
          <div className="flex">
            {/* Left: QR preview panel */}
            <div className="flex-shrink-0 w-64 bg-slate-50 dark:bg-slate-900/40 flex flex-col items-center justify-center p-6 rounded-l-3xl border-r border-slate-100 dark:border-slate-700 min-h-[280px]">
              {billingData?.qrCodeUrl || currentQRCodeUrl ? (
                <>
                  <img
                    src={currentQRCodeUrl || billingData?.qrCodeUrl}
                    alt="QR Code"
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                  {currentQRCodeUrl && (
                    <div className="mt-3 text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1 animate-pulse">
                      <BoltIcon sx={{ fontSize: 11 }} /> Preview
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center opacity-30 text-center">
                  <QrCodeScannerIcon sx={{ fontSize: 56 }} className="text-slate-400 mb-2" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest leading-snug">
                    No QR code<br />uploaded yet
                  </p>
                </div>
              )}
            </div>

            {/* Right: header + buttons */}
            <div className="flex-1 p-6 pt-7 flex flex-col justify-between">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <QrCodeScannerIcon className="text-blue" sx={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">
                      QR Collection Hub
                    </h3>
                    <p className="text-xs text-slate-400">Manage your payment QR gateway</p>
                  </div>
                </div>

                {errorqr && (
                  <p className="text-[11px] font-bold text-red-500 mb-3 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                    {errorqr}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5">
                <input
                  type="file"
                  className="hidden"
                  ref={modalFileInputRef}
                  onChange={handleUploadNewQRCode}
                  accept="image/*"
                />

                {billingData?.qrCodeUrl || currentQRCodeUrl ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => modalFileInputRef.current.click()}
                      className="py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                    >
                      <EditIcon sx={{ fontSize: 14 }} /> Change
                    </button>
                    <button
                      onClick={handleDeleteQRCode}
                      className="py-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} /> Delete
                    </button>
                    <button
                      onClick={handleDownloadQR}
                      disabled={!billingData?.qrCodeUrl}
                      className="py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all disabled:opacity-40"
                    >
                      <DownloadIcon sx={{ fontSize: 14 }} /> Download
                    </button>
                    <button
                      onClick={handleShareQR}
                      disabled={!billingData?.qrCodeUrl}
                      className="py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all disabled:opacity-40"
                    >
                      <ShareIcon sx={{ fontSize: 14 }} /> Share
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => modalFileInputRef.current.click()}
                    className="w-full py-3 bg-slate-50 dark:bg-slate-700 text-blue border-2 border-dashed border-blue/30 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-slate-600 transition-all"
                  >
                    <CloudUploadIcon sx={{ fontSize: 18 }} /> Upload QR Image
                  </button>
                )}

                {formik.values.qrCode && !uploadqr && (
                  <button
                    onClick={formik.handleSubmit}
                    className="w-full py-3 bg-blue text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95"
                  >
                    <PaymentsIcon sx={{ fontSize: 18 }} /> Save QR Code
                  </button>
                )}

                {uploadqr && (
                  <div className="w-full py-3 bg-blue/50 text-white rounded-xl flex items-center justify-center gap-2">
                    <CircularProgress size={15} color="inherit" />
                    <span className="text-sm font-bold">Uploading…</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default Billing;
