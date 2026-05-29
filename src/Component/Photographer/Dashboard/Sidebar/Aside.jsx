import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import GroupsIcon from "@mui/icons-material/Groups";
import logo from "../../../image/Newlogo.png";
import logoclose from "../../../image/bg-removed.png";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import FeedbackIcon from "@mui/icons-material/Feedback";
import PrintIcon from "@mui/icons-material/Print";
import SyncIcon from "@mui/icons-material/Sync";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const LINK_BASE = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 no-underline";
const LINK_ACTIVE = "bg-blue text-white";
const LINK_IDLE = "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
const SUB_LINK_ACTIVE = "text-blue font-semibold";
const SUB_LINK_IDLE = "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white";

function SectionLabel({ label }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 select-none text-left">
      {label}
    </p>
  );
}

function Aside({ setIsOpen, isOpen }) {
  const location = useLocation();
  const [showUpgrade, setUpgrade] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);

  const expanded = !isOpen;

  const isActive = (path) => location.pathname.startsWith(`/photographer/${path}`);
  const isEventSection =
    (location.pathname.includes("/photographer/event") &&
      !location.pathname.includes("/photographer/events_list")) ||
    location.pathname.includes("/photographer/create_event");

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const currentUser = users.find((u) => u.isCurrent);
  const trial = currentUser?.isTrial;
  const endDate = currentUser?.currentSubscriptionId?.end_date;

  useEffect(() => {
    if (!endDate) { setUpgrade(true); return; }
    const trialEnd = new Date(endDate);
    setUpgrade(!(trial === false && trialEnd > new Date()));
  }, [trial, endDate]);

  const closeOnMobile = () => { if (window.innerWidth < 1024) setIsOpen(false); };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 relative">
      {/* Logo */}
      <div className="flex items-center justify-center py-3 px-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        {expanded ? (
          <img src={logo} alt="FotoAlpha" className="w-[120px]" />
        ) : (
          <img src={logoclose} alt="FotoAlpha" className="w-9 h-9 object-contain" />
        )}
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-2">

        {/* Upload Photos — featured */}
        <div className="px-3 mb-1">
          <Link
            to="upload_photos"
            className={`${LINK_BASE} ${isActive("upload_photos") ? LINK_ACTIVE : LINK_IDLE} ${expanded ? "w-full" : "justify-center"}`}
            onClick={closeOnMobile}
          >
            <AddToPhotosIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Upload Photos</span>}
          </Link>
        </div>

        {/* MAIN */}
        {expanded && <SectionLabel label="Main" />}
        <div className="px-3 space-y-0.5">
          <Link to="dashboard" className={`${LINK_BASE} ${isActive("dashboard") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <HomeIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Dashboard</span>}
          </Link>

          <Link to="public_portfolio" className={`${LINK_BASE} ${isActive("public_portfolio") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <AccountCircleIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Portfolio</span>}
          </Link>

          {/* Events accordion */}
          <button
            className={`w-full ${LINK_BASE} ${isEventSection ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`}
            onClick={() => setIsEventOpen(!isEventOpen)}
          >
            <EventIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && (
              <>
                <span className="flex-1 text-left">Events</span>
                {isEventOpen ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
              </>
            )}
          </button>

          {isEventOpen && expanded && (
            <div className="ml-3 pl-3 border-l-2 border-slate-200 dark:border-slate-700 space-y-0.5 my-1">
              <Link to="events_category" className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors no-underline ${isActive("events_category") ? SUB_LINK_ACTIVE : SUB_LINK_IDLE}`} onClick={() => { closeOnMobile(); setIsEventOpen(false); }}>
                <EventAvailableIcon sx={{ fontSize: 17, flexShrink: 0 }} />
                <span>Events</span>
              </Link>
              <Link to="create_event" className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors no-underline ${isActive("create_event") ? SUB_LINK_ACTIVE : SUB_LINK_IDLE}`} onClick={() => { closeOnMobile(); setIsEventOpen(false); }}>
                <EditCalendarIcon sx={{ fontSize: 17, flexShrink: 0 }} />
                <span>Add Event</span>
              </Link>
            </div>
          )}

          <Link to="events_list" className={`${LINK_BASE} ${isActive("events_list") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <EventNoteIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Events List</span>}
          </Link>

          <Link to="print_orders" className={`${LINK_BASE} ${isActive("print_orders") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <PrintIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Print Orders</span>}
          </Link>

        </div>

        {/* TOOLS & SUPPORT */}
        {expanded && <SectionLabel label="Tools & Support" />}
        <div className="px-3 space-y-0.5">
          <Link to="team" className={`${LINK_BASE} ${isActive("team") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <GroupsIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Team</span>}
          </Link>
          <Link to="calendar" className={`${LINK_BASE} ${isActive("calendar") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <CalendarMonthIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Event Calendar</span>}
          </Link>
          <Link to="feedback" className={`${LINK_BASE} ${isActive("feedback") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <FeedbackIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Feedback</span>}
          </Link>
          <Link to="sync_watchers" className={`${LINK_BASE} ${isActive("sync_watchers") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <SyncIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Sync Watchers</span>}
          </Link>
        </div>

        {/* ACCOUNT */}
        {expanded && <SectionLabel label="Account" />}
        <div className="px-3 space-y-0.5">
          <Link to="billing" className={`${LINK_BASE} ${isActive("billing") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <AccountBalanceWalletIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Accounts</span>}
          </Link>
          <Link to="coins" className={`${LINK_BASE} ${isActive("coins") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <LocalFireDepartmentIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Coins</span>}
          </Link>
          <Link to="referrals" className={`${LINK_BASE} ${isActive("referrals") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <GroupAddIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Referrals</span>}
          </Link>
          <Link to="settings" className={`${LINK_BASE} ${isActive("settings") ? LINK_ACTIVE : LINK_IDLE} ${!expanded && "justify-center"}`} onClick={closeOnMobile}>
            <SettingsIcon sx={{ fontSize: 20, flexShrink: 0 }} />
            {expanded && <span>Settings</span>}
          </Link>
        </div>

        {/* OTHER */}
        {expanded && (
          <>
            <SectionLabel label="Other" />
            <div className="px-3 space-y-0.5">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed select-none">
                <AddPhotoAlternateIcon sx={{ fontSize: 20, flexShrink: 0 }} />
                <span>Export Photo</span>
                <span className="ml-auto text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">Soon</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed select-none">
                <PhotoLibraryIcon sx={{ fontSize: 20, flexShrink: 0 }} />
                <span>AI Album</span>
                <span className="ml-auto text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">Soon</span>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden lg:flex items-center gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium flex-shrink-0"
      >
        {expanded ? (
          <>
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
            <span>Collapse</span>
          </>
        ) : (
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        )}
      </button>
    </div>
  );
}

export default Aside;
