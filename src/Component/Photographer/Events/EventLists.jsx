import { CircularProgress, Modal, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import PrintIcon from "@mui/icons-material/Print";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import React, { useContext, useEffect, useRef, useState } from "react";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BoltIcon from "@mui/icons-material/Bolt";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import demo from "../../image/demo.jpg";
import QRCode from "react-qr-code";
import { PhotographerEventContext } from "../Context/PhotographerEventContext";
import ConfirmModal from "../../Common/ConfirmModal";
import { format } from "date-fns";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_BASE_URL;
const baseurlFront = import.meta.env.VITE_FRONT_BASE_URL;

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "Upcoming", label: "Upcoming" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const STATUS_STYLE = {
  ongoing: { pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400", border: "border-l-emerald-500" },
  upcoming: { pill: "bg-amber-100  text-amber-700  dark:bg-amber-500/20  dark:text-amber-400", border: "border-l-blue-500" },
  completed: { pill: "bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300", border: "border-l-slate-300" },
  cancelled: { pill: "bg-red-100    text-red-600    dark:bg-red-500/20    dark:text-red-400", border: "border-l-red-400" },
};

function getStatusStyle(s = "") {
  return STATUS_STYLE[s.toLowerCase()] || STATUS_STYLE.completed;
}

// ── Share QR Modal ─────────────────────────────────────────────────────────
function ShareModal({ event, onClose }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${baseurlFront}/guest/register?eventcode=${event?.eventCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied!", { autoClose: 1500 });
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this event album: ${shareUrl}`)}`, "_blank");
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event album: ${shareUrl}`)}`, "_blank");
  };

  const printCard = () => {
    if (!cardRef.current) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>Print QR Card</title>
      <style>body { font-family: sans-serif; text-align: center; margin: auto; }</style>
      </head><body>${cardRef.current.innerHTML}
      <script>window.onload = function () { window.print(); window.onafterprint = function () { window.close(); }; };<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal open onClose={onClose}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "92%", sm: 560 },
        outline: "none",
      }}>
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row">

          {/* ── Left: QR Panel ── */}
          <div className="bg-gradient-to-br from-[#0b8599] to-[#075f70] sm:w-52 flex-shrink-0 flex flex-col items-center justify-center px-6 py-8 gap-4">
            {/* Brand */}
            <p className="text-white/80 text-[10px] font-bold tracking-[0.2em] uppercase">FotoAlpha</p>

            {/* QR code on white card */}
            {event?.eventCode ? (
              <>
                <div className="bg-white rounded-2xl p-3 shadow-xl">
                  <QRCode
                    value={shareUrl}
                    size={148}
                    fgColor="#0b8599"
                    bgColor="#ffffff"
                    viewBox="0 0 256 256"
                  />
                </div>
                <p className="text-white/70 text-[10px] text-center leading-relaxed">
                  Scan to view<br />the event album
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center bg-white/10 rounded-2xl p-4 text-center gap-2">
                <p className="text-white/70 text-xs font-semibold">QR Unavailable</p>
                <p className="text-white/50 text-[10px]">Event code not set</p>
              </div>
            )}

            {/* Event code chip */}
            {event?.eventCode && (
              <div className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
                <p className="text-[8px] text-white/60 uppercase tracking-widest font-bold">Event Code</p>
                <p className="text-white font-bold text-sm tracking-widest mt-0.5">{event.eventCode}</p>
              </div>
            )}

            {/* Footer */}
            <p className="text-white/40 text-[9px] mt-auto">www.fotoalpha.com</p>
          </div>

          {/* ── Right: Actions Panel ── */}
          <div className="flex-1 flex flex-col p-5 gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-bold text-slate-800 dark:text-white text-base leading-tight truncate">
                  {event?.eventName || "Share Event"}
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Share this event with guests</p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition flex-shrink-0 mt-0.5"
              >
                <CloseIcon sx={{ fontSize: 14 }} className="text-slate-500 dark:text-slate-300" />
              </button>
            </div>

            {/* URL strip */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2">
              <p className="flex-1 text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">{shareUrl}</p>
              <button
                onClick={copyToClipboard}
                title="Copy link"
                className={`flex-shrink-0 transition ${copied ? "text-emerald-500" : "text-[#0b8599] hover:text-[#086a7a]"}`}
              >
                <ContentCopyIcon sx={{ fontSize: 15 }} />
              </button>
            </div>

            {/* Social share buttons */}
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Share via</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] text-xs font-semibold transition-all"
                >
                  <WhatsAppIcon sx={{ fontSize: 16 }} />
                  WhatsApp
                </button>
                <button
                  onClick={handleFacebookShare}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] text-xs font-semibold transition-all"
                >
                  <FacebookIcon sx={{ fontSize: 16 }} />
                  Facebook
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
                >
                  <XIcon sx={{ fontSize: 14 }} />
                  Twitter / X
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${copied
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                >
                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Print button */}
            <button
              onClick={printCard}
              className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <PrintIcon sx={{ fontSize: 15 }} />
              Print QR Card
            </button>
          </div>
        </div>

        {/* Hidden print card */}
        <div ref={cardRef} className="hidden">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h2 style={{ fontSize: "20px" }}>www.fotoalpha.com</h2>
          </div>
          <QRCode size={100} style={{ width: "50%", height: "auto" }} value={shareUrl} viewBox="0 0 256 256" />
          <p>Scan to view the album</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <p>79733 06537</p>
            <p style={{ marginLeft: "20px" }}>www.fotoalpha.com</p>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

// ── Skeleton card ───────────────────────────────────────────────────────────
function CardSkeleton({ grid }) {
  if (grid) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-slate-700" />
        <div className="p-3 flex flex-col gap-2">
          <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-2.5 w-24 bg-slate-100 dark:bg-slate-700/60 rounded-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-3 flex gap-3 animate-pulse">
      <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2 py-1">
        <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-2.5 w-64 bg-slate-100 dark:bg-slate-700/60 rounded-full" />
        <div className="h-2.5 w-32 bg-slate-100 dark:bg-slate-700/60 rounded-full" />
      </div>
    </div>
  );
}

// ── Action buttons (shared between list & grid) ─────────────────────────────
function ActionButtons({ event, onEdit, onDelete, onShare, compact = false }) {
  const navigate = useNavigate();
  const size = compact ? 14 : 15;
  const cls = compact ? "w-7 h-7" : "w-7 h-7";
  return (
    <div
      className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => navigate(`/photographer/event/${event.eventid}`)}
        title="View"
        className={`${cls} flex items-center justify-center rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all`}
      >
        <VisibilityOutlinedIcon sx={{ fontSize: size }} />
      </button>
      <button
        onClick={() => onEdit(event.eventid)}
        title="Edit"
        className={`${cls} flex items-center justify-center rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all`}
      >
        <EditOutlinedIcon sx={{ fontSize: size }} />
      </button>
      <button
        onClick={() => onShare(event)}
        title="Share"
        className={`${cls} flex items-center justify-center rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all`}
      >
        <ShareOutlinedIcon sx={{ fontSize: size }} />
      </button>
      <button
        onClick={() => onDelete(event.eventid)}
        title="Delete"
        className={`${cls} flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all`}
      >
        <DeleteOutlineIcon sx={{ fontSize: size }} />
      </button>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
function EventLists() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState(false);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState(type || "");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [shareEvent, setShareEvent] = useState(null);
  const { setPhotographerEvent } = useContext(PhotographerEventContext);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => { fetchAllevent(); }, []);

  const handleSearchText = () => {
    setCurrentPage(1);
    fetchAllevent(fromDate, toDate, searchText.trim(), status);
  };

  const fetchAllevent = async (from = "", to = "", search = "", statusFilter = "") => {
    setLoading(true);
    const query = new URLSearchParams();
    if (from) query.append("startDate", from);
    if (to) query.append("endDate", to);
    if (search) query.append("search", search);
    if (statusFilter) query.append("status", statusFilter);
    try {
      const response = await axios.get(`${baseUrl}/events/all-events?${query.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const getCurrentOrNextSlot = (slots) => {
        if (!slots || slots.length === 0) return null;
        const timeOrder = { morning: 1, noon: 2, evening: 3 };
        const sortedSlots = [...slots].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateA !== dateB) return dateA - dateB;
          return (timeOrder[a.slotTime?.toLowerCase()] || 0) - (timeOrder[b.slotTime?.toLowerCase()] || 0);
        });
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const currentHour = now.getHours();
        for (const slot of sortedSlots) {
          const slotDate = new Date(slot.date);
          const slotDay = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate()).getTime();
          if (slotDay > today) return slot;
          if (slotDay === today) {
            const slotTime = slot.slotTime?.toLowerCase();
            let slotEndHour = 24;
            if (slotTime === "morning") slotEndHour = 12;
            else if (slotTime === "noon") slotEndHour = 17;
            else if (slotTime === "evening") slotEndHour = 24;
            if (currentHour < slotEndHour) return slot;
          }
        }
        return sortedSlots[sortedSlots.length - 1];
      };

      const mapped = response?.data?.events?.map((ev) => {
        const currentSlot = getCurrentOrNextSlot(ev?.timeSlots);
        return {
          firstPhoto: ev?.firstPhotoSignedUrl || ev?.eventCategoryId?.imageSignedUrl,
          eventName: ev?.name,
          category: ev?.eventCategoryId?.name,
          startDate: currentSlot?.date,
          eventSubCategory: currentSlot?.eventSubCategory?.name,
          eventid: ev?._id,
          eventCode: ev?.eventCode,
          status: ev?.status,
          computedStatus: ev?.computedStatus || ev?.status || "upcoming",
          description: ev?.description,
          slotsCount: ev?.timeSlots?.length || 0,
          slotTime: currentSlot?.slotTime,
        };
      }) || [];

      setEvents(mapped);
      setFromDate("");
      setToDate("");
      setSearchText("");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const errorMessage = error?.response?.data?.message || "";
      const statusCode = error?.response?.status;
      if (
        statusCode === 403 ||
        errorMessage === "Your trial period has ended. Please upgrade to continue." ||
        errorMessage === "Your trial period of 14 days has ended. Please upgrade to continue."
      ) {
        setPermission(true);
      }
    }
  };

  const handleDateSearch = () => {
    setCurrentPage(1);
    if (!fromDate && !toDate) { toast.warning("Please select a date range", { autoClose: 1500 }); return; }
    fetchAllevent(fromDate, toDate, "", status);
    setShowDateFilter(false);
  };

  const handleEdit = (eventId) => {
    axios.get(`${baseUrl}/events/${eventId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "ngrok-skip-browser-warning": "69420" },
    }).then((r) => setPhotographerEvent(r.data.event)).catch(console.log);
    navigate(`/photographer/event/${eventId}/edit_event`);
  };

  const handleClear = () => {
    setFromDate(""); setToDate(""); setSearchText(""); setStatus(""); setCurrentPage(1);
    setShowDateFilter(false);
    fetchAllevent();
  };

  const handleDeleteEvent = (id) => setDeleteModal({ open: true, id });

  const confirmDelete = () => {
    const id = deleteModal.id;
    setDeleteModal({ open: false, id: null });
    axios.delete(`${baseUrl}/events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "ngrok-skip-browser-warning": "69420" },
    }).then(() => {
      toast.success("Event deleted successfully", { autoClose: 1200 });
      fetchAllevent();
    }).catch((err) => {
      toast.error(err?.response?.data?.message || err?.message, { autoClose: 2000 });
    });
  };

  const handleDownloadCSV = () => {
    const csvContent = [
      ["Event Name", "Category", "Sub Event", "Date", "Status"],
      ...events.map((e) => [
        e.eventName, e.category, e.eventSubCategory,
        e.startDate ? format(new Date(e.startDate), "MMM dd yyyy") : "N/A",
        e.computedStatus,
      ]),
    ].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `events-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const data = events;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  if (permission) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <ErrorOutlineIcon sx={{ fontSize: 32 }} className="text-red-500" />
        </div>
        <h2 className="text-slate-800 dark:text-white font-bold text-xl mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-sm max-w-xs mb-6">Your current plan doesn't include access to events. Upgrade to continue.</p>
        <button
          onClick={() => navigate("/photographer/upgrade_plan")}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow hover:opacity-90 transition flex items-center gap-2"
        >
          <BoltIcon sx={{ fontSize: 18 }} /> Upgrade Plan
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* ── Page Header ── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0b8599] to-[#0a7085] flex items-center justify-center shadow-md flex-shrink-0">
              <EventOutlinedIcon sx={{ fontSize: 22, color: "#fff" }} />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">All Events</h1>
              <p className="text-slate-400 text-xs mt-0.5">
                {loading ? "Loading…" : `${events.length} ${events.length === 1 ? "event" : "events"} found`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode("list")}
                title="List view"
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-600 shadow text-[#0b8599]" : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <ViewListOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-600 shadow text-[#0b8599]" : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <GridViewOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
            </div>

            <button
              onClick={handleDownloadCSV}
              title="Download CSV"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 transition"
            >
              <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
            </button>
            <button
              onClick={() => navigate("/photographer/create_event")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0b8599] to-[#0a7085] text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              Create Event
            </button>
          </div>
        </div>

        {/* ── Filter Toolbar ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm px-4 py-3 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Status pill tabs */}
            <div className="flex flex-wrap gap-1.5 flex-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatus(tab.value);
                    setCurrentPage(1);
                    fetchAllevent(fromDate, toDate, searchText, tab.value);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${status === tab.value
                      ? "bg-[#0b8599] text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 focus-within:border-[#0b8599] focus-within:ring-2 focus-within:ring-[#0b8599]/20 transition-all">
                <SearchIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events…"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchText()}
                  className="w-36 outline-none text-xs bg-transparent text-slate-700 dark:text-white placeholder:text-slate-400"
                />
                {searchText && (
                  <button onClick={() => { setSearchText(""); fetchAllevent(fromDate, toDate, "", status); }}>
                    <ClearIcon sx={{ fontSize: 14 }} className="text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>

              {/* Date toggle */}
              <button
                onClick={() => setShowDateFilter((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${showDateFilter
                    ? "bg-[#0b8599] text-white border-[#0b8599]"
                    : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 hover:border-[#0b8599]"
                  }`}
              >
                <FilterListIcon sx={{ fontSize: 14 }} />
                Date
              </button>

              {(fromDate || toDate || status || searchText) && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                >
                  <ClearIcon sx={{ fontSize: 14 }} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Date range (collapsible) */}
          {showDateFilter && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-slate-200 dark:border-slate-600 outline-none rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-white dark:bg-slate-700 focus:border-[#0b8599] transition-colors"
              />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-slate-200 dark:border-slate-600 outline-none rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-white dark:bg-slate-700 focus:border-[#0b8599] transition-colors"
              />
              <button
                onClick={handleDateSearch}
                className="bg-[#0b8599] text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#086a7a] transition-colors shadow-sm"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* ── Events ── */}
        {loading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <CardSkeleton key={i} grid />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          )
        ) : data.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#e6f8fb] flex items-center justify-center mb-5">
              <EventOutlinedIcon sx={{ fontSize: 36, color: "#0b8599" }} />
            </div>
            <h3 className="text-slate-700 dark:text-white font-bold text-lg mb-2">
              {status ? `No ${status} Events` : "No Events Yet"}
            </h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              {status
                ? `There are no ${status.toLowerCase()} events matching your filters.`
                : "Create your first event to get started."}
            </p>
            <button
              onClick={() => navigate("/photographer/create_event")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0b8599] to-[#0a7085] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 transition"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              Create Event
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* ── Grid View ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentItems.map((event, index) => {
              const s = getStatusStyle(event.computedStatus);
              return (
                <div
                  key={event.eventid || index}
                  onClick={() => navigate(`/photographer/event/${event.eventid}`)}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden flex flex-col"
                >
                  {/* Cover */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={event.firstPhoto || demo}
                      alt={event.eventName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Status badge overlay */}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border backdrop-blur-sm ${s.pill}`}>
                      {event.computedStatus || "N/A"}
                    </span>
                    {/* Share button overlay */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setShareEvent(event); }}
                      title="Share"
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 dark:bg-slate-800/80 text-emerald-600 hover:bg-white hover:scale-110 transition-all shadow"
                    >
                      <ShareOutlinedIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>

                  {/* Card body */}
                  <div className="p-3 flex flex-col gap-1.5 flex-1">
                    {event.category && (
                      <span className="text-[9px] font-bold tracking-widest text-[#0b8599] uppercase">{event.category}</span>
                    )}
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white leading-snug line-clamp-2">
                      {event.eventName}
                    </h3>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium mt-auto pt-1">
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 10 }} />
                      <span>{event.startDate ? format(new Date(event.startDate), "MMM dd, yyyy") : "Date N/A"}</span>
                    </div>
                    {/* Phase + actions row */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-slate-700 mt-1" onClick={(e) => e.stopPropagation()}>
                      <span className="bg-[#e6f8fb] dark:bg-[#0b8599]/15 text-[#0b8599] px-2 py-0.5 rounded-full text-[8px] font-bold uppercase truncate max-w-[70px]">
                        {event.eventSubCategory || "Initial"}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => navigate(`/photographer/event/${event.eventid}`)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-blue-400 hover:bg-blue-50 transition-all"
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 13 }} />
                        </button>
                        <button
                          onClick={() => handleEdit(event.eventid)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-amber-400 hover:bg-amber-50 transition-all"
                        >
                          <EditOutlinedIcon sx={{ fontSize: 13 }} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.eventid)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-all"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── List View ── */
          <div className="flex flex-col gap-3">
            {currentItems.map((event, index) => {
              const s = getStatusStyle(event.computedStatus);
              return (
                <div
                  key={event.eventid || index}
                  onClick={() => navigate(`/photographer/event/${event.eventid}`)}
                  className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 border-l-4 ${s.border} shadow-sm hover:shadow-md transition-all cursor-pointer group`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0">
                    {/* Cover */}
                    <div className="w-full sm:w-24 h-32 sm:h-full sm:min-h-[88px] flex-shrink-0 overflow-hidden rounded-tl-2xl rounded-tr-2xl sm:rounded-tr-none sm:rounded-bl-2xl">
                      <img
                        src={event.firstPhoto || demo}
                        alt={event.eventName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {event.category && (
                            <span className="text-[9px] font-bold tracking-widest text-[#0b8599] uppercase">{event.category}</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wide border ${s.pill}`}>
                            {event.computedStatus || "N/A"}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug truncate">{event.eventName}</h3>
                        {event.description && (
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-md">{event.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-1">
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 11 }} />
                            <span>
                              {event.startDate ? format(new Date(event.startDate), "MMM dd, yyyy") : "Date N/A"}
                              {event.slotTime && (
                                <span className="ml-1 text-[#0b8599] font-bold capitalize">· {event.slotTime}</span>
                              )}
                            </span>
                          </div>
                          {event.slotsCount > 0 && (
                            <div className="flex items-center gap-1">
                              <AccessTimeOutlinedIcon sx={{ fontSize: 11 }} />
                              <span>{event.slotsCount} Session{event.slotsCount !== 1 ? "s" : ""}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Phase + Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase mb-0.5 hidden sm:block">Phase</span>
                          <span className="bg-[#e6f8fb] dark:bg-[#0b8599]/15 text-[#0b8599] dark:text-[#4dd6ea] px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide">
                            {event.eventSubCategory || "Initial"}
                          </span>
                        </div>
                        <ActionButtons
                          event={event}
                          onEdit={handleEdit}
                          onDelete={handleDeleteEvent}
                          onShare={setShareEvent}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 py-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition bg-white dark:bg-slate-800"
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${currentPage === i + 1
                    ? "bg-[#0b8599] text-white shadow-md border-transparent"
                    : "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition bg-white dark:bg-slate-800"
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        )}
      </div>

      {/* ── Share QR Modal ── */}
      {shareEvent && <ShareModal event={shareEvent} onClose={() => setShareEvent(null)} />}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={confirmDelete}
        title="Are you sure?"
        description="You are about to delete this event. All associated data and photos will also be permanently deleted. This action cannot be undone!"
        confirmText="Yes, Delete"
        cancelText="Go back"
      />
    </>
  );
}

export default EventLists;
