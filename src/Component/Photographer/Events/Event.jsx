// export default Event;
import React, { useContext, useEffect, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import IosShareIcon from "@mui/icons-material/IosShare";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import PrintIcon from "@mui/icons-material/Print";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import XIcon from "@mui/icons-material/X";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BoltIcon from "@mui/icons-material/Bolt";
import QRCode from "react-qr-code";
import { Alert, Box, CircularProgress, Modal, Snackbar, TablePagination } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import demo from "../../image/demo.jpg";
import { PhotographerEventContext } from "../Context/PhotographerEventContext";
import ConfirmModal from "../../Common/ConfirmModal";

const baseURL = import.meta.env.VITE_BASE_URL;
const baseurlFront = import.meta.env.VITE_FRONT_BASE_URL;

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "ongoing", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 400, md: 500 },
  boxShadow: 24,
};

function Event() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const id = useLocation().pathname.split("/")[3];
  const [permission, setPermission] = useState(false);
  const { setPhotoCount, categoryname } = useContext(PhotographerEventContext);
  const [activeStatusTab, setActiveStatusTab] = useState("all");

  // Share modal
  const [shareModal, setShareModal] = useState({ open: false, eventCode: null });
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copySnackbar, setCopySnackbar] = useState(false);
  const cardRef = useRef(null);

  // More dropdown
  const [openDropdown, setOpenDropdown] = useState(null);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    fetchEvents();
  }, [page, rowsPerPage]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/events/category/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
        params: { page: page + 1, limit: rowsPerPage },
      });
      setEvent(response.data.events || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "";
      if (
        errorMessage === "Your trial period has ended. Please upgrade to continue." ||
        errorMessage === "Your trial period of 14 days has ended. Please upgrade to continue."
      ) {
        setPermission(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGuar = async () => {
    try {
      const response = await axios.get(`${baseURL}/v1/subscription/guard/event`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.canCreate) {
        navigate("create_event");
      } else {
        toast.error("Limit reached. Please upgrade your plan.");
      }
    } catch (error) {
      console.error("Error fetching:", error.response?.data?.message);
      const statusCode = error?.response?.status;
      if (statusCode === 403) toast.error("Upgrade your plan to create more events.");
    }
  };

  const getEventSlot = (ev) => {
    const slots = (ev?.timeSlots || []).filter((s) => s.date);
    if (!slots.length) return null;
    const sorted = [...slots].sort((a, b) => new Date(a.date) - new Date(b.date));
    const today = new Date();
    return sorted.find((s) => new Date(s.date) >= today) || sorted[sorted.length - 1];
  };

  const getComputedStatus = (ev) => {
    const raw = ev?.computedStatus || ev?.status || "";
    if (raw) return raw.toLowerCase();
    const slots = (ev?.timeSlots || []).filter((s) => s.date);
    if (!slots.length) return "upcoming";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = slots.map((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });
    if (Math.max(...dates) < today.getTime()) return "completed";
    if (Math.min(...dates) <= today.getTime()) return "ongoing";
    return "upcoming";
  };

  const statusCounts = {
    all: event.length,
    upcoming: event.filter((ev) => getComputedStatus(ev) === "upcoming").length,
    ongoing: event.filter((ev) => getComputedStatus(ev) === "ongoing").length,
    completed: event.filter((ev) => getComputedStatus(ev) === "completed").length,
  };

  const filteredEvents =
    activeStatusTab === "all"
      ? event
      : event.filter((ev) => getComputedStatus(ev) === activeStatusTab);

  // Share handlers
  const handleOpenShare = (ev, e) => {
    e.stopPropagation();
    setShowShareOptions(false);
    setShareModal({ open: true, eventCode: ev.eventCode });
  };

  const handleCloseShare = () => {
    setShareModal({ open: false, eventCode: null });
    setShowShareOptions(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        `${baseurlFront}/guest/register?eventcode=${shareModal.eventCode}`
      );
      setCopySnackbar(true);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `${baseurlFront}/guest/register?eventcode=${shareModal.eventCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this event album: ${url}`)}`, "_blank");
  };

  const handleFacebookShare = () => {
    const url = `${baseurlFront}/guest/register?eventcode=${shareModal.eventCode}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  };

  const handleTwitterShare = () => {
    const url = `${baseurlFront}/guest/register?eventcode=${shareModal.eventCode}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event album: ${url}`)}`,
      "_blank"
    );
  };

  const printCard = () => {
    if (!cardRef.current) return;
    const w = window.open("", "_blank");
    w.document.write(
      `<html><head><title>Print QR Card</title><style>body{font-family:sans-serif;text-align:center;margin:auto;}</style></head><body>${cardRef.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script></body></html>`
    );
    w.document.close();
  };

  const handleDeleteEvent = (eventId, e) => {
    e.stopPropagation();
    setOpenDropdown(null);
    setDeleteModal({ open: true, id: eventId });
  };

  const confirmDelete = () => {
    const eventId = deleteModal.id;
    setDeleteModal({ open: false, id: null });
    axios
      .delete(`${baseURL}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
      })
      .then(() => {
        toast.success("Event deleted successfully", { autoClose: 1200 });
        fetchEvents();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || err?.message, { autoClose: 2000 });
      });
  };

  const getStatusDotClass = (status) => {
    if (status === "ongoing") return "bg-green-500";
    if (status === "upcoming") return "bg-orange-400";
    if (status === "cancelled") return "bg-red-500";
    return "bg-slate-300";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <CircularProgress className="text-blue-600" />
        <p className="mt-4 text-slate-600 dark:text-slate-300">Loading events...</p>
      </div>
    );
  }

  if (permission) {
    return (
      <div className="bg-slate-100 p-5 rounded text-center mt-5">
        <ErrorOutlineIcon sx={{ fontSize: "50px" }} className="text-red-600" />
        <h1 className="text-slate-700 font-normal text-2xl">
          You do not have access to this page
        </h1>
        <p className="text-slate-700 font-normal text-sm">
          We're sorry, your plan does not have permission or upgrade to access this page
        </p>
        <button
          className="bg-blue rounded px-5 py-2 mt-4 text-white font-normal hover:bg-blueHover"
          onClick={() => navigate("/photographer/upgrade_plan")}
        >
          <BoltIcon /> Upgrade Plan
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5 text-start">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={() => navigate("/photographer/events_category")}
            className="hover:text-cyan-600 transition-colors flex items-center gap-1"
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Event Categories
          </button>
          <ChevronRightIcon sx={{ fontSize: 16 }} className="text-slate-300" />
          <span className="text-slate-800 dark:text-white font-medium capitalize">
            {categoryname || "Events"}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
              {categoryname || "Events"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {pagination?.total || event.length}{" "}
              {(pagination?.total || event.length) === 1 ? "event" : "events"} in this category
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-full sm:w-56">
              <div className="flex bg-white py-2 px-3 rounded-md dark:bg-slate-800 items-center border border-slate-200 dark:border-slate-700">
                <SearchIcon
                  className="text-slate-400 dark:text-gray-400 mr-2 cursor-pointer"
                  onClick={() => navigate(`/photographer/search/${searchTerm}`)}
                />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && navigate(`/photographer/search/${searchTerm}`)
                  }
                  className="border-none text-sm outline-none bg-transparent w-full dark:text-white placeholder-gray-400"
                />
              </div>
            </div>
            <button
              className="bg-blue hover:bg-sky-700 text-white text-sm rounded-md font-medium px-4 py-2 transition-colors whitespace-nowrap flex items-center"
              onClick={fetchGuar}
            >
              <AddIcon sx={{ fontSize: "18px", marginRight: "4px" }} />
              Create Event
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-0 border-b border-slate-200 dark:border-slate-700">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveStatusTab(tab.key);
                setPage(0);
              }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeStatusTab === tab.key
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab.label} ({statusCounts[tab.key] ?? 0})
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col justify-center items-center w-full py-16">
            <ErrorOutlineIcon sx={{ fontSize: 50 }} className="text-slate-400 mb-4" />
            <p className="text-xl text-slate-600 dark:text-white mb-4">No events to show</p>
            <button
              className="bg-blue hover:bg-blue-700 text-white text-sm rounded-md font-medium px-4 py-2 transition-colors"
              onClick={fetchGuar}
            >
              Create Event
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredEvents.map((data, index) => {
                const status = getComputedStatus(data);
                const slot = getEventSlot(data);
                return (
                  <div
                    key={data._id || index}
                    className="group relative rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700"
                    onClick={() => {
                      setPhotoCount(data?.photoCount || 0);
                      navigate(`/photographer/event/${data._id}`);
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden rounded-t-xl h-[140px]">
                      <img
                        src={data?.firstPhotoSignedUrl || demo}
                        alt={data.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Photo count badge */}
                      <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {data?.photoCount || 0}
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="p-2.5">
                      <h2 className="text-slate-800 dark:text-white font-semibold text-sm capitalize line-clamp-1 mb-1">
                        {data.name}
                      </h2>

                      {slot?.date && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                          <CalendarTodayOutlinedIcon sx={{ fontSize: 11 }} />
                          <span>{format(new Date(slot.date), "MMM dd, yyyy")}</span>
                          {slot.startTime && (
                            <>
                              <span>•</span>
                              <span>{slot.startTime}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Footer: status dot + action icons */}
                      <div className="flex items-center justify-between mt-1">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDotClass(status)}`}
                          title={status}
                        />
                        <div
                          className="flex items-center gap-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* View */}
                          <button
                            onClick={() => {
                              setPhotoCount(data?.photoCount || 0);
                              navigate(`/photographer/event/${data._id}`);
                            }}
                            className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="View Event"
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
                          </button>

                          {/* Share */}
                          <button
                            onClick={(e) => handleOpenShare(data, e)}
                            className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Share Event"
                          >
                            <IosShareIcon sx={{ fontSize: 14 }} />
                          </button>

                          {/* More */}
                          <div
                            className="relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(openDropdown === data._id ? null : data._id);
                              }}
                              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                              title="More options"
                            >
                              <MoreVertIcon sx={{ fontSize: 14 }} />
                            </button>
                            {openDropdown === data._id && (
                              <div className="absolute right-0 bottom-full mb-1 z-50 min-w-[140px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden">
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdown(null);
                                    navigate(`/photographer/event/${data._id}/edit_event`);
                                  }}
                                >
                                  <EditOutlinedIcon sx={{ fontSize: 14 }} />
                                  Edit Event
                                </button>
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={(e) => handleDeleteEvent(data._id, e)}
                                >
                                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                  Delete Event
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Create Event placeholder card */}
              <div
                className="flex flex-col items-center justify-center rounded-xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-cyan-400 dark:hover:border-cyan-500 cursor-pointer transition-colors min-h-[200px]"
                onClick={fetchGuar}
              >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-400 dark:border-slate-500 flex items-center justify-center mb-3 text-slate-400 dark:text-slate-500 hover:border-cyan-400 hover:text-cyan-500 transition-colors">
                  <AddIcon sx={{ fontSize: 24 }} />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Create Event
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1 px-4">
                  Add a new event to this category
                </p>
              </div>
            </div>

            {/* Pagination — only when server paging is active and viewing all */}
            {pagination?.totalPages > 1 && activeStatusTab === "all" && (
              <div className="mt-2">
                <TablePagination
                  component="div"
                  count={pagination.total || event.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[12, 20, 50]}
                  showLastButton
                  className="bg-white dark:bg-slate-800 dark:text-white border-t border-slate-200 dark:border-slate-700"
                  sx={{
                    "& .MuiTablePagination-actions svg": { color: "inherit" },
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Modal — identical to Overview tab "Manage QR / Link" */}
      <Modal open={shareModal.open} onClose={handleCloseShare}>
        <Box sx={modalStyle}>
          <div className="bg-white rounded dark:bg-slate-800 p-4">
            <div className="flex justify-end">
              <CloseIcon
                className="text-slate-700 cursor-pointer dark:text-white"
                onClick={handleCloseShare}
              />
            </div>
            <div className="flex justify-center items-center mb-5">
              <h2 className="font-normal text-2xl text-slate-700 dark:text-white">FOTOALPHA</h2>
            </div>

            {shareModal.eventCode ? (
              <div style={{ height: "auto", margin: "0 auto", maxWidth: 180, width: "100%" }}>
                <QRCode
                  size={250}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={`${baseurlFront}/guest/register?eventcode=${shareModal.eventCode}`}
                  viewBox="0 0 256 256"
                />
              </div>
            ) : (
              <p className="text-center text-slate-500 py-6 text-sm">
                Event code not available for sharing.
              </p>
            )}

            <p className="text-slate-700 font-normal text-center mt-2 dark:text-white">
              Scan to view the album
            </p>

            <div className="flex justify-center mt-3 gap-3">
              <button
                className="border border-slate-300 rounded-md font-normal text-slate-700 px-4 py-2 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={printCard}
              >
                <PrintIcon /> Print
              </button>
              <button
                className="border border-slate-300 rounded-md font-normal text-slate-700 px-4 py-2 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setShowShareOptions((s) => !s)}
              >
                <ShareIcon /> Share
              </button>
            </div>

            {showShareOptions && (
              <>
                <div className="flex justify-center mt-3">
                  <p className="text-slate-700 font-normal dark:text-white">
                    Event Code: {shareModal.eventCode}
                  </p>
                </div>
                <div className="flex justify-center gap-4 mt-3">
                  <WhatsAppIcon
                    className="cursor-pointer text-green-500"
                    onClick={handleWhatsAppShare}
                  />
                  <FacebookIcon className="cursor-pointer text-blue" onClick={handleFacebookShare} />
                  <XIcon className="cursor-pointer dark:text-white" onClick={handleTwitterShare} />
                  <ContentCopyIcon
                    className="cursor-pointer dark:text-white"
                    onClick={copyToClipboard}
                  />
                </div>
              </>
            )}

            <div className="flex flex-col md:flex-row justify-center items-center mt-3">
              <p className="text-slate-700 dark:text-white">79733 06537</p>
              <p className="text-slate-700 md:ml-10 dark:text-white">www.fotoalpha.com</p>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Hidden element for printing */}
      <div ref={cardRef} className="hidden">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h2 style={{ fontSize: "20px" }}>www.fotoalpha.com</h2>
        </div>
        {shareModal.eventCode && (
          <QRCode
            size={100}
            style={{ width: "50%", height: "auto" }}
            value={`${baseurlFront}/guest/register?eventcode=${shareModal.eventCode}`}
            viewBox="0 0 256 256"
          />
        )}
        <p>Scan to view the album</p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <p>79733 06537</p>
          <p style={{ marginLeft: "20px" }}>www.fotoalpha.com</p>
        </div>
      </div>

      {/* Copy success snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={copySnackbar}
        autoHideDuration={2000}
        onClose={() => setCopySnackbar(false)}
      >
        <Alert onClose={() => setCopySnackbar(false)} severity="success" sx={{ width: "100%" }}>
          Copied!
        </Alert>
      </Snackbar>

      {/* Delete confirmation */}
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

export default Event;
