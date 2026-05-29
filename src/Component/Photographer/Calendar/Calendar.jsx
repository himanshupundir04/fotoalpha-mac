import React, { useEffect, useRef, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BoltIcon from "@mui/icons-material/Bolt";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ShareIcon from "@mui/icons-material/Share";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";
import { enUS } from "date-fns/locale";
import { toast } from "react-toastify";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const baseURL = import.meta.env.VITE_BASE_URL;

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  upcoming:        { bg: "#22c55e", border: "#16a34a", label: "Upcoming",        dot: "#22c55e" },
  ongoing:         { bg: "#3b82f6", border: "#2563eb", label: "Ongoing",         dot: "#3b82f6" },
  completed:       { bg: "#0b8599", border: "#086a7a", label: "Completed",       dot: "#0b8599" },
  cancelled:       { bg: "#ef4444", border: "#dc2626", label: "Cancelled",       dot: "#ef4444" },
  payment_pending: { bg: "#f59e0b", border: "#d97706", label: "Payment Pending", dot: "#f59e0b" },
};

const STATUS_BADGE = {
  upcoming:  "bg-green-100 text-green-700",
  ongoing:   "bg-blue-100 text-blue-700",
  completed: "bg-teal-100 text-teal-700",
  cancelled: "bg-red-100 text-red-700",
};

function getDisplayStatus(event) {
  if (event.status === "cancelled") return "cancelled";
  if (event.totalAmount > 0 && (event.totalAmount || 0) > (event.amountReceived || 0)) {
    return "payment_pending";
  }
  const slotDate = event.date ? new Date(event.date) : null;
  if (!slotDate) return "upcoming";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(slotDate);
  d.setHours(0, 0, 0, 0);
  if (d < today) return "completed";
  if (d.getTime() === today.getTime()) return "ongoing";
  return "upcoming";
}

// ─── Custom calendar event tile ──────────────────────────────────────────────
const CustomEvent = ({ event }) => {
  const ds = getDisplayStatus(event);
  const cfg = STATUS_CONFIG[ds] || STATUS_CONFIG.upcoming;
  return (
    <div
      className="text-white p-1.5 rounded-lg shadow-sm transition-all h-full overflow-hidden flex flex-col justify-center gap-0.5 cursor-pointer"
      style={{ backgroundColor: cfg.bg, borderLeft: `3px solid ${cfg.border}` }}
    >
      {!event.allDay && (
        <div className="flex items-center gap-1 opacity-90">
          <AccessTimeIcon sx={{ fontSize: 10 }} />
          <span className="text-[10px] font-bold uppercase tracking-wide">
            {format(event.start, "h:mm a")}
          </span>
        </div>
      )}
      <div className="font-bold text-[12px] truncate leading-tight">{event.title}</div>
      {event.eventSubCategory && (
        <div className="text-[10px] opacity-80 truncate">{event.eventSubCategory}</div>
      )}
    </div>
  );
};

// ─── Custom toolbar ───────────────────────────────────────────────────────────
const CustomToolbar = (toolbar) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 px-2 mt-2">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-slate-800 dark:text-white">
          {format(toolbar.date, "MMMM yyyy")}
        </span>
        <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 rounded-full p-1 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => toolbar.onNavigate("PREV")}
            className="p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300"
          >
            <ChevronLeftIcon fontSize="small" />
          </button>
          <button
            onClick={() => toolbar.onNavigate("TODAY")}
            className="px-4 py-1 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-[#0b8599] transition-colors uppercase tracking-widest"
          >
            Today
          </button>
          <button
            onClick={() => toolbar.onNavigate("NEXT")}
            className="p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300"
          >
            <ChevronRightIcon fontSize="small" />
          </button>
        </div>
      </div>
      <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
        {["month", "week", "day"].map((v) => (
          <button
            key={v}
            onClick={() => toolbar.onView(v)}
            className={`px-5 py-2 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all ${
              toolbar.view === v
                ? "bg-white dark:bg-slate-700 text-[#0b8599] shadow-sm scale-105"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Stats card ───────────────────────────────────────────────────────────────
const StatsCard = ({ icon, value, label, sub, accent }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-700 shadow-sm flex-1 min-w-[140px]">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: accent + "20", color: accent }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-2xl font-bold text-slate-800 dark:text-white leading-tight truncate">
        {value}
      </div>
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{label}</div>
      {sub && <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{sub}</div>}
    </div>
  </div>
);

// ─── Payment status badge ─────────────────────────────────────────────────────
function paymentBadge(total, received) {
  if (!total || total === 0) return { label: "N/A", cls: "bg-slate-100 text-slate-500" };
  if (received >= total) return { label: "Paid", cls: "bg-green-100 text-green-700" };
  if (received > 0) return { label: "Partial Paid", cls: "bg-amber-100 text-amber-700" };
  return { label: "Unpaid", cls: "bg-red-100 text-red-700" };
}

// ─── Event Drawer ─────────────────────────────────────────────────────────────
const EventDrawer = ({ open, onClose, eventId, navigate }) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!open || !eventId) return;
    setLoading(true);
    setDetails(null);
    axios
      .get(`${baseURL}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
      })
      .then((r) => setDetails(r.data.event))
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
  }, [open, eventId]);

  const firstSlot = details?.timeSlots?.[0] || null;
  const payBadge = details ? paymentBadge(details.totalAmount, details.amountReceived) : null;
  const computedStatus = details?.computedStatus || details?.status || "upcoming";
  const badgeCls = STATUS_BADGE[computedStatus] || STATUS_BADGE.upcoming;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px]  bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out overflow-hidden`}
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b8599] to-[#086a7a] px-5 py-4 text-white shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {loading ? (
                <div className="h-6 w-40 bg-white/20 rounded animate-pulse mb-2" />
              ) : (
                <h2 className="text-lg font-bold truncate">
                  {details?.name || "Event Details"}
                </h2>
              )}
              {!loading && details && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeCls}`}>
                  {computedStatus}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 ">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <CircularProgress size={28} sx={{ color: "#0b8599" }} />
              <p className="text-slate-500 text-sm">Loading event details…</p>
            </div>
          ) : !details ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
              <ErrorOutlineIcon />
              <p className="text-sm">Could not load event details</p>
            </div>
          ) : (
            <>
              {/* Event type & code */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {details.timeSlots?.[0]?.eventSubCategory?.name || "Event"}
                </span>
                {details.eventCode && (
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md">
                    ID: EV-{details.eventCode}
                  </span>
                )}
              </div>

              {/* Date & Time */}
              {firstSlot && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-start gap-3">
                    <CalendarMonthIcon sx={{ fontSize: 16 }} className="text-[#0b8599] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {format(new Date(firstSlot.date), "dd MMMM yyyy, EEEE")}
                      </div>
                      {firstSlot.startTime && firstSlot.endTime && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {firstSlot.startTime} – {firstSlot.endTime}
                        </div>
                      )}
                    </div>
                  </div>

                  {firstSlot.venue && (
                    <div className="flex items-start gap-3">
                      <LocationOnIcon sx={{ fontSize: 16 }} className="text-[#0b8599] mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {firstSlot.venue}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Host info */}
              {(details.hostName || details.hostMobile) && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Host
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-2">
                    {details.hostName && (
                      <div className="flex items-center gap-3">
                        <PersonIcon sx={{ fontSize: 16 }} className="text-[#0b8599] shrink-0" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {details.hostName}
                        </span>
                      </div>
                    )}
                    {details.hostMobile && (
                      <div className="flex items-center gap-3">
                        <PhoneIcon sx={{ fontSize: 16 }} className="text-[#0b8599] shrink-0" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {details.countryCode || "+91"} {details.hostMobile}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment status */}
              {details.totalAmount > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Payment Status
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CurrencyRupeeIcon sx={{ fontSize: 16 }} className="text-[#0b8599]" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          ₹{(details.amountReceived || 0).toLocaleString()} / ₹{details.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${payBadge.cls}`}>
                        {payBadge.label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-[#0b8599] h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((details.amountReceived || 0) / details.totalAmount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Time slots summary */}
              {details.timeSlots && details.timeSlots.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    All Slots ({details.timeSlots.length})
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {details.timeSlots.map((slot, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 flex items-center gap-2"
                      >
                        <AccessTimeIcon sx={{ fontSize: 14 }} className="text-[#0b8599] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {format(new Date(slot.date), "dd MMM yyyy")}
                            {slot.startTime && ` · ${slot.startTime}`}
                          </div>
                          {slot.eventSubCategory?.name && (
                            <div className="text-[10px] text-slate-400 truncate">
                              {slot.eventSubCategory.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Quick Actions
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      icon: <VisibilityIcon sx={{ fontSize: 18 }} />,
                      label: "View Event",
                      onClick: () => navigate(`/photographer/event/${details._id}`),
                    },
                    {
                      icon: <CloudUploadIcon sx={{ fontSize: 18 }} />,
                      label: "Upload Photos",
                      onClick: () => navigate(`/photographer/event/${details._id}/upload`),
                    },
                    {
                      icon: <ShareIcon sx={{ fontSize: 18 }} />,
                      label: "Share Gallery",
                      onClick: () => navigate(`/photographer/event/${details._id}`),
                    },
                    {
                      icon: <EditIcon sx={{ fontSize: 18 }} />,
                      label: "Edit Event",
                      onClick: () => navigate(`/photographer/event/${details._id}/edit`),
                    },
                    {
                      icon: <CancelIcon sx={{ fontSize: 18 }} />,
                      label: "Cancel Event",
                      danger: true,
                      onClick: () => onClose(),
                    },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={action.onClick}
                      className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border transition-all text-center ${
                        action.danger
                          ? "border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      {action.icon}
                      <span className="text-[10px] font-medium leading-tight">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Event Notes
                  </p>
                  <button className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#0b8599] hover:border-[#0b8599] transition-colors text-sm font-bold">
                    +
                  </button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-xs text-slate-400 dark:text-slate-500 italic">
                  {details.description || "No notes added"}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function PublicCalendar() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [permission, setPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const fetchEvents = async (startDate, endDate) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/calender?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      const fetchedEvents = response.data.map((event) => {
        const { date: slotDate, startTime, endTime, venue } = event.timeSlots;
        const dateOnly = slotDate.split("T")[0];
        const hasTimes = startTime && endTime;
        return {
          title: event.name,
          venue,
          date: dateOnly,
          start: hasTimes ? new Date(`${dateOnly}T${startTime}`) : new Date(dateOnly),
          end: hasTimes ? new Date(`${dateOnly}T${endTime}`) : new Date(dateOnly),
          allDay: !hasTimes,
          id: event._id,
          status: event.status,
          totalAmount: event.totalAmount || 0,
          amountReceived: event.amountReceived || 0,
          hostName: event.hostName,
          hostMobile: event.hostMobile,
          countryCode: event.countryCode,
          eventCode: event.eventCode,
          eventSubCategory: event.eventSubCategory,
        };
      });

      setEvents(fetchedEvents);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "";
      const statusCode = error?.response?.status;
      if (
        statusCode === 403 ||
        errorMessage === "Your trial period has ended. Please upgrade to continue." ||
        errorMessage === "Your trial period of 14 days has ended. Please upgrade to continue."
      ) {
        setPermission(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (range) => {
    let startDate, endDate;
    if (Array.isArray(range)) {
      startDate = range[0];
      endDate = range[range.length - 1];
    } else {
      startDate = range.start;
      endDate = range.end;
    }
    fetchEvents(format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd"));
  };

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    fetchEvents(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"));
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const now = new Date();
  const weekLater = new Date(now);
  weekLater.setDate(weekLater.getDate() + 7);

  const eventsThisMonth = events.length;

  const upcomingThisWeek = events.filter((e) => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    const s = new Date(now); s.setHours(0, 0, 0, 0);
    const en = new Date(weekLater); en.setHours(23, 59, 59, 999);
    return d >= s && d <= en && getDisplayStatus(e) === "upcoming";
  }).length;

  const pendingPaymentEvents = events.filter(
    (e) => e.totalAmount > 0 && e.totalAmount > e.amountReceived
  );
  const pendingAmount = pendingPaymentEvents.reduce(
    (sum, e) => sum + (e.totalAmount - e.amountReceived),
    0
  );

  // ── Filters ────────────────────────────────────────────────────────────────
  const displayedEvents = statusFilter
    ? events.filter((e) => getDisplayStatus(e) === statusFilter)
    : events;

  const handleSelectEvent = (event) => {
    setSelectedEventId(event.id);
    setDrawerOpen(true);
  };

  return (
    <>
      <style>{`
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: none !important; }
        .rbc-month-row { border-top: 1px dashed #e2e8f0 !important; }
        .rbc-day-bg { border-left: 1px dashed #e2e8f0 !important; }
        .rbc-header {
          border-bottom: 1px solid #e2e8f0 !important;
          border-left: none !important;
          padding: 16px 0 !important;
          font-weight: 700 !important;
          color: #64748b !important;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.1em;
        }
        .rbc-today { background-color: transparent !important; position: relative; }
        .rbc-today::after {
          content: '';
          position: absolute;
          top: 4px; left: 4px; right: 4px; bottom: 4px;
          background-color: #f0fdf4;
          border-radius: 12px;
          z-index: -1;
          border: 1px solid #bbf7d0;
        }
        .rbc-date-cell { padding: 10px !important; font-weight: 700; color: #475569; font-size: 13px; }
        .rbc-off-range-bg { background-color: transparent !important; opacity: 0.4; }
        .rbc-event { background: none !important; padding: 2px !important; border: none !important; }
        .rbc-time-header.rbc-overflowing { border-right: none !important; }
        .rbc-time-content { border-top: 1px solid #e2e8f0 !important; }
        .rbc-timeslot-group { border-bottom: 1px dashed #e2e8f0 !important; }
        .rbc-day-slot .rbc-time-slot { border-top: none !important; }
      `}</style>

      {permission ? (
        <div className="bg-slate-100 p-5 rounded text-center mt-5">
          <ErrorOutlineIcon sx={{ fontSize: "50px" }} className="text-red-600" />
          <h1 className="text-slate-700 font-normal text-2xl">
            You do not have access to this page
          </h1>
          <p className="text-slate-700 font-normal text-sm">
            Your plan does not have permission to access this page
          </p>
          <button
            className="bg-blue rounded px-5 py-2 mt-4 text-white font-normal hover:bg-blueHover"
            onClick={() => navigate("/photographer/upgrade_plan")}
          >
            <BoltIcon /> Upgrade Plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* ── Stats Cards ─────────────────────────────────────────────────── */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            <StatsCard
              icon={<CalendarMonthIcon />}
              value={eventsThisMonth}
              label="Events This Month"
              accent="#0b8599"
            />
            <StatsCard
              icon={<AccessTimeIcon />}
              value={upcomingThisWeek}
              label="Upcoming This Week"
              accent="#3b82f6"
            />
            <StatsCard
              icon={<CurrencyRupeeIcon />}
              value={pendingPaymentEvents.length > 0 ? `₹${pendingAmount.toLocaleString()}` : "—"}
              label="Payment Pending"
              sub={pendingPaymentEvents.length > 0 ? `${pendingPaymentEvents.length} invoice${pendingPaymentEvents.length > 1 ? "s" : ""}` : "All clear"}
              accent="#f59e0b"
            />
            <StatsCard
              icon={<EventNoteIcon />}
              value={events.filter((e) => getDisplayStatus(e) === "completed").length}
              label="Completed"
              accent="#22c55e"
            />
            <StatsCard
              icon={<CancelIcon />}
              value={events.filter((e) => e.status === "cancelled").length}
              label="Cancelled"
              accent="#ef4444"
            />
          </div>

          {/* ── Filter Bar ──────────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold shrink-0">
              <FilterListIcon sx={{ fontSize: 18 }} />
              Filters
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0b8599]/30 cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="payment_pending">Payment Pending</option>
            </select>

            {statusFilter && (
              <button
                onClick={() => setStatusFilter("")}
                className="text-xs text-[#0b8599] font-semibold hover:underline"
              >
                Clear
              </button>
            )}

            <div className="ml-auto text-xs text-slate-400 dark:text-slate-500">
              {displayedEvents.length} event{displayedEvents.length !== 1 ? "s" : ""} shown
            </div>
          </div>

          {/* ── Calendar ────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
              <CircularProgress sx={{ color: "#0b8599" }} />
              <p className="mt-4 text-slate-500 dark:text-slate-300 text-sm">Loading events…</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl p-4">
              <Calendar
                selectable
                allDayAccessor="allDay"
                localizer={localizer}
                events={displayedEvents}
                view={view}
                defaultView={Views.MONTH}
                onView={setView}
                date={date}
                onNavigate={setDate}
                views={["month", "week", "day"]}
                step={30}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "calc(100vh - 340px)", minHeight: 500 }}
                components={{ event: CustomEvent, toolbar: CustomToolbar }}
                onSelectEvent={handleSelectEvent}
                onRangeChange={handleRangeChange}
              />

              {/* Legend */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-opacity ${
                      statusFilter && statusFilter !== key ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cfg.dot }}
                    />
                    <span className="text-slate-600 dark:text-slate-300">{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Drawer ──────────────────────────────────────────────────────────── */}
      <EventDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        eventId={selectedEventId}
        navigate={navigate}
      />
    </>
  );
}
