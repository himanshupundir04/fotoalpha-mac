import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import QRCode from "react-qr-code";
import { Alert, Avatar, Divider, Snackbar } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Box, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import XIcon from "@mui/icons-material/X";
import { PhotographerEventContext } from "../Context/PhotographerEventContext";
import PeopleIcon from "@mui/icons-material/People";
import axios from "axios";
import { showConfirmDialog } from "../../../services/confirmDialog";
import { toast } from "react-toastify";

const baseurl = import.meta.env.VITE_BASE_URL;
const baseurlFront = import.meta.env.VITE_FRONT_BASE_URL;
function Oveview() {
  const { Photographerevent, setPhotographerEvent } = useContext(PhotographerEventContext);
  const { eventid: slotid } = useParams();
  const qrCodeRef = useRef(null);
  const cardRef = useRef(null);
  const [open, setOpen] = useState(false);
  const slot = Photographerevent?.timeSlots;
  const [openqr, setOpenqr] = useState(false);
  const handleCloseqr = () => setOpenqr(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [cancellingEvent, setCancellingEvent] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState("success");

  const getMinutesFromStartTime = (timeValue) => {
    if (!timeValue) return Number.MAX_SAFE_INTEGER;

    const normalized = String(timeValue)
      .trim()
      .toLowerCase()
      .replace(/\./g, "");
    const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
    if (!match) return Number.MAX_SAFE_INTEGER;

    let hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    const meridiem = match[3];

    if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes > 59) {
      return Number.MAX_SAFE_INTEGER;
    }

    if (meridiem) {
      if (hours === 12) hours = 0;
      if (meridiem === "pm") hours += 12;
    }

    if (hours < 0 || hours > 23) return Number.MAX_SAFE_INTEGER;
    return hours * 60 + minutes;
  };

  const getSlotSortTimestamp = (slotItem) => {
    if (!slotItem?.date) return Number.MAX_SAFE_INTEGER;

    const parsedDate = new Date(slotItem.date);
    if (Number.isNaN(parsedDate.getTime())) return Number.MAX_SAFE_INTEGER;

    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const minutesFromStart = getMinutesFromStartTime(slotItem.startTime);
    const minuteOffset =
      minutesFromStart === Number.MAX_SAFE_INTEGER ? 1439 : minutesFromStart;

    return startOfDay.getTime() + minuteOffset * 60 * 1000;
  };

  const sortedSlots = useMemo(() => {
    if (!Array.isArray(slot)) return [];

    return [...slot].sort((a, b) => {
      const timeA = getSlotSortTimestamp(a);
      const timeB = getSlotSortTimestamp(b);

      if (timeA !== timeB) return timeA - timeB;

      const nameA = a?.eventSubCategory?.name || "";
      const nameB = b?.eventSubCategory?.name || "";
      return nameA.localeCompare(nameB);
    });
  }, [slot]);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    axios
      .get(`${baseurl}/photographer/event/team-assigned?eventId=${slotid}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        // console.log(response.data.team);
        setTeam(response.data.team);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const shareUrl = `${baseurlFront}/guest/register?eventcode=${Photographerevent?.eventCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied!", { autoClose: 1500 });
    } catch (error) {
      console.error("Unable to copy to clipboard:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
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

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this event album: ${shareUrl}`)}`, "_blank");
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event album: ${shareUrl}`)}`, "_blank");
  };

  const computedStatus = Photographerevent?.computedStatus || Photographerevent?.status || "upcoming";

  const deriveComputedStatus = (timeSlots, dbStatus) => {
    if (dbStatus === "cancelled") return "cancelled";
    const slots = (timeSlots || []).filter(s => s.date);
    if (slots.length === 0) return "upcoming";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();
    const ts = slots.map(s => { const d = new Date(s.date); d.setHours(0, 0, 0, 0); return d.getTime(); });
    const min = Math.min(...ts);
    const max = Math.max(...ts);
    if (max < todayTs) return "completed";
    if (min <= todayTs) return "ongoing";
    return "upcoming";
  };

  const handleCancelToggle = async () => {
    const isCancelled = computedStatus === "cancelled";
    const newStatus = isCancelled ? "upcoming" : "cancelled";

    const confirmed = await showConfirmDialog({
      title: isCancelled ? "Reactivate this event?" : "Cancel this event?",
      description: isCancelled
        ? "The event will become active again and guests will be able to access it."
        : "Guests will immediately lose access. You can reactivate this event at any time.",
      confirmText: isCancelled ? "Reactivate" : "Cancel Event",
      variant: isCancelled ? "success" : "danger",
    });

    if (!confirmed.isConfirmed) return;

    setCancellingEvent(true);
    try {
      await axios.patch(
        `${baseurl}/events/${slotid}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      );
      const newComputed = deriveComputedStatus(Photographerevent?.timeSlots, newStatus);
      setPhotographerEvent(prev => ({ ...prev, status: newStatus, computedStatus: newComputed }));
      setStatusMessage(newStatus === "cancelled" ? "Event cancelled." : "Event reactivated.");
      setStatusSeverity("success");
    } catch (error) {
      setStatusMessage(error.response?.data?.message || "Failed to update status.");
      setStatusSeverity("error");
    } finally {
      setCancellingEvent(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "upcoming":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200";
      case "ongoing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <>
      <section className="text-start">
        <div className="flex flex-col md:flex-row justify-between md:gap-3">
          <div className=" h-max md:mb-0 mb-3 md:w-3/5 w-full">
            <div className="bg-white w-full p-4 rounded dark:bg-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-start text-xl font-normal dark:text-white text-slate-700">
                  Event Information
                </h2>
                <div className="flex gap-2 items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(computedStatus)}`}
                  >
                    {computedStatus}
                  </span>
                  <button
                    onClick={handleCancelToggle}
                    disabled={cancellingEvent}
                    className={`py-1 px-3 text-xs rounded-lg font-medium border transition
                      ${computedStatus === "cancelled"
                        ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        : "border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      }`}
                  >
                    {computedStatus === "cancelled" ? "Reactivate" : "Cancel Event"}
                  </button>
                  <button
                    className="bg-transparent flex gap-1 items-center text-slate-700 py-1 px-2 text-sm rounded-lg font-normal border-slate-300 border dark:border-slate-600 dark:text-white "
                    onClick={() => navigate("edit_event")}
                  >
                    <BorderColorOutlinedIcon />
                    <span className="hidden md:block"> Edit Event</span>
                  </button>
                </div>
              </div>
              {sortedSlots.length > 0 &&
                sortedSlots.map((slotItem, index) => (
                  <React.Fragment
                    key={
                      slotItem?._id ||
                      `${slotItem?.date || "no-date"}-${slotItem?.startTime || "no-time"}-${index}`
                    }
                  >
                    <div className="flex flex-col mt-2 mb-2">
                      <div className="flex ">
                        <DateRangeIcon className="text-slate-700 dark:text-white" />
                        <p className="text-slate-700 font-normal ml-1 dark:text-white">
                          {slotItem?.eventSubCategory?.name}
                        </p>
                      </div>
                      <p className="text-lg font-normal text-slate-700 dark:text-white mt-2">
                        {slotItem.date
                          ? format(new Date(slotItem.date), "MMM dd, yyyy")
                          : "Date not available"}
                      </p>
                      {slotItem.startTime && slotItem.endTime && (
                        <div className="flex mt-1">
                          <AccessTimeIcon className="text-slate-700" />
                          <p className="text-slate-700 font-normal ml-1">
                            {slotItem.startTime} - {slotItem.endTime}
                          </p>
                        </div>
                      )}
                      {slotItem.venue && (
                        <div className="flex mt-2">
                          <LocationOnIcon className="text-slate-700 dark:text-white" />
                          <p className="text-slate-700 font-normal ml-1 dark:text-white">
                            {slotItem.venue}
                          </p>
                        </div>
                      )}
                      {slotItem?.description && (
                        <div className="flex mt-2">
                          <ErrorOutlineIcon className="text-slate-700 dark:text-white" />
                          <p className="text-slate-700 font-normal ml-1 dark:text-white">
                            {slotItem.description}
                          </p>
                        </div>
                      )}
                    </div>
                    <Divider />
                  </React.Fragment>
                ))}
              {Photographerevent?.description && (
                <div className="flex flex-col mt-5">
                  <p className="text-slate-700 font-medium ml-1 dark:text-white">
                    Description
                  </p>
                  <p
                    className={`text-slate-700 ml-1 dark:text-white ${
                      expanded ? "" : "line-clamp-3"
                    }`}
                  >
                    {Photographerevent?.description}
                  </p>
                  {Photographerevent?.description?.length > 100 && ( // only show toggle if text is long
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="text-blue font-medium mt-1 text-sm self-start"
                    >
                      {expanded ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="bg-white flex flex-col rounded p-4 md:mb-0 mb-3 mt-3 dark:bg-slate-800 w-full relative">
              <div className="flex gap-2 items-center mb-5">
                <PeopleIcon className="text-blue" />
                <p className="text-slate-700 font-normal text-xl dark:text-white">
                  Assigned Team
                </p>
              </div>
              {team &&
                team.map((item, index) => (
                  <div className="flex mb-3 gap-2" key={index}>
                    <Avatar
                      alt={item.user?.name}
                      src="/static/images/avatar/1.jpg"
                    />
                    <div className="flex flex-col">
                      <p className="text-slate-700 font-normal dark:text-white">
                        {item.user?.name}
                      </p>
                      <span className="text-slate-500 ">
                        {item.user?.role?.name}
                      </span>
                    </div>
                  </div>
                ))}
              <div className="flex justify-end">
                <button
                  className="btn bg-blue text-white p-2 text-sm rounded mt-3 hover:bg-blueHover w-max font-normal"
                  onClick={() => navigate("team_management")}
                >
                  Manage Event Team
                </button>
              </div>
            </div>
          </div>
          <div className="rounded md:mb-0 mb-3 h-max md:w-2/5 w-full">
            <div className="bg-white p-4 rounded dark:bg-slate-800">
              <div className="text-start text-xl font-normal dark:text-white text-slate-700">
                <h3>Client Information</h3>
              </div>
              {Photographerevent?.hostName && (
                <div className="flex mt-2">
                  <h2 className="text-slate-700 font-normal dark:text-white">
                    Client Name:{" "}
                  </h2>
                  <p className="text-slate-700 ml-1 dark:text-white">
                    {Photographerevent?.hostName}
                  </p>
                </div>
              )}
              {Photographerevent?.hostEmail && (
                <div className="flex">
                  <h2 className="text-slate-700 font-normal dark:text-white">
                    Client Email:{" "}
                  </h2>
                  <p className="text-slate-700 ml-1 dark:text-white">
                    {Photographerevent?.hostEmail}
                  </p>
                </div>
              )}
              {Photographerevent?.hostMobile && (
                <div className="flex">
                  <h2 className="text-slate-700 font-normal dark:text-white">
                    Client Mobile No:{" "}
                  </h2>
                  <p className="text-slate-700 ml-1 dark:text-white">
                    +91 {Photographerevent?.hostMobile}
                  </p>
                </div>
              )}
            </div>
            <div className="bg-white p-4 mt-3 rounded dark:bg-slate-800">
              <h2 className="text-slate-700 text-xl font-normal dark:text-white mb-3">
                Event Sharing
              </h2>
              {Photographerevent?.eventCode ? (
                <div
                  style={{
                    height: "auto",
                    margin: "0 auto",
                    maxWidth: 200,
                    width: "100%",
                  }}
                >
                  <QRCode
                    size={250}
                    style={{
                      height: "auto",
                      maxWidth: "100%",
                      width: "100%",
                    }}
                    value={`${baseurlFront}/guest/register?eventcode=${Photographerevent.eventCode}`}
                    viewBox={`0 0 256 256`}
                    ref={qrCodeRef}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-slate-400 text-sm">
                  <p>QR code unavailable</p>
                  <p className="text-xs mt-1">Event code not set</p>
                </div>
              )}
              <div className="flex justify-center mt-5">
                <button
                  className="btn border border-blue rounded p-2 text-sm text-blue font-normal hover:bg-blueHover hover:text-white font-normal"
                  onClick={() => setOpenqr(true)}
                >
                  Manage QR / Link
                </button>
              </div>
            </div>
            <Modal open={openqr} onClose={handleCloseqr}>
              <Box sx={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "92%", sm: 560 },
                maxHeight: "90vh",
                outline: "none",
              }}>
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row max-h-[90vh]">

                  {/* ── Left: QR Panel ── */}
                  <div className="bg-gradient-to-br from-[#0b8599] to-[#075f70] sm:w-52 flex-shrink-0 flex flex-col items-center justify-center px-6 py-8 gap-4">
                    <p className="text-white/80 text-[10px] font-bold tracking-[0.2em] uppercase">FotoAlpha</p>

                    <div className="bg-white rounded-2xl p-3 shadow-xl">
                      <QRCode
                        value={shareUrl}
                        size={148}
                        fgColor="#0b8599"
                        bgColor="#ffffff"
                        viewBox="0 0 256 256"
                        ref={qrCodeRef}
                      />
                    </div>

                    <p className="text-white/70 text-[10px] text-center leading-relaxed">
                      Scan to view<br />the event album
                    </p>

                    {Photographerevent?.eventCode && (
                      <div className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
                        <p className="text-[8px] text-white/60 uppercase tracking-widest font-bold">Event Code</p>
                        <p className="text-white font-bold text-sm tracking-widest mt-0.5">{Photographerevent.eventCode}</p>
                      </div>
                    )}

                    <p className="text-white/40 text-[9px] mt-auto">www.fotoalpha.com</p>
                  </div>

                  {/* ── Right: Actions Panel ── */}
                  <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="font-bold text-slate-800 dark:text-white text-base leading-tight truncate">
                          {Photographerevent?.name || "Share Event"}
                        </h2>
                        <p className="text-slate-400 text-xs mt-0.5">Share this event with guests</p>
                      </div>
                      <button
                        onClick={handleCloseqr}
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

                    {/* Social share */}
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
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                            copied
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          <ContentCopyIcon sx={{ fontSize: 14 }} />
                          {copied ? "Copied!" : "Copy Link"}
                        </button>
                      </div>
                    </div>

                    {/* Print */}
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
          </div>
          {/* Cancel action feedback */}
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open={!!statusMessage}
            autoHideDuration={4000}
            onClose={() => setStatusMessage("")}
          >
            <Alert
              onClose={() => setStatusMessage("")}
              severity={statusSeverity}
              sx={{ width: "100%" }}
            >
              {statusMessage}
            </Alert>
          </Snackbar>
        </div>
      </section>
    </>
  );
}

export default Oveview;
