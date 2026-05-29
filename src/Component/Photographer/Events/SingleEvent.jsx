import React, { useContext, useEffect, useRef, useState } from "react";
import Photos from "./Photos";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Oveview from "./Overview";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Settings from "./Settings";
import Guestassignedteam from "./Guest&assignedteam";
import axios from "axios";
import { PhotographerEventContext } from "../Context/PhotographerEventContext";
import { PortfolioEventContext } from "../Context/PortfolioEventContext";
import Analysis from "./Analysis";
import PaymentManagement from "./PaymentManagement";
import InvitationCard from "./InvitationCard";
import PhotosRequest from "./PhotosRequest";

const baseURL = import.meta.env.VITE_BASE_URL;

const primaryTabs = [
  { id: "photos", label: "Photos" },
  { id: "overview", label: "Overview" },
];

const moreTabs = [
  { id: "photosRequest", label: "Photo Request" },
  { id: "settings", label: "Settings" },
  { id: "guest&assigndteam", label: "Guest & Assigned Team" },
  { id: "payment", label: "Payment Overview" },
  { id: "analysis", label: "Analysis" },
  { id: "InvitationCard", label: "InvitationCard" },
];

const allTabs = [...primaryTabs, ...moreTabs];

function SingleEvent() {
  const [activeTab, setActiveTab] = useState("photos");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const navigate = useNavigate();
  const { eventid } = useParams();
  const { setPhotographerEvent } = useContext(PhotographerEventContext);
  const { setPortfolioEvent } = useContext(PortfolioEventContext);
  const [event, setEvent] = useState({});
  const location = useLocation();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const requestedTab = location.state?.activeTab;
    const tabExists = allTabs.some((tab) => tab.id === requestedTab);
    if (tabExists) {
      setActiveTab(requestedTab);
    }
  }, [location.state]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeMoreTab = moreTabs.find((t) => t.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Oveview />;
      case "photos":
        return <Photos />;
      case "photosRequest":
        return <PhotosRequest />;
      case "settings":
        return <Settings />;
      case "guest&assigndteam":
        return <Guestassignedteam initialView={location.state?.guestAssignedTeamView} />;
      case "payment":
        return <PaymentManagement fetchEvents={fetchEvents} />;
      case "analysis":
        return <Analysis />;
      case "InvitationCard":
        return <InvitationCard />;
      default:
        return null;
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${baseURL}/events/${eventid}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
      });
      setPhotographerEvent(response.data.event);
      setPortfolioEvent(response.data.event);
      setEvent(response.data.event);
      window.electronAPI?.setStore("singleEvent", response.data.event);
    } catch (error) {
      const cachedSummary = await window.electronAPI?.getStore("singleEvent");
      if (cachedSummary) {
        setEvent(cachedSummary);
        setPhotographerEvent(cachedSummary);
        setPortfolioEvent(cachedSummary);
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <section>
        <div className="flex justify-between">
          <div className="flex items-center">
            <ArrowBackIcon
              sx={{ fontSize: "30px" }}
              className="bg-slate-300 p-1 rounded text-white cursor-pointer"
              onClick={handleBack}
            />
            <h1 className="text-start text-2xl test-slate-700 font-bold dark:text-white text-black ml-3 capitalize">
              {event?.name}
            </h1>
          </div>
        </div>
        <div className="mt-4 mb-1">
          <ul className="flex text-sm font-medium text-center border-b border-slate-200 dark:border-slate-700">
            {primaryTabs.map((tab) => (
              <li key={tab.id} className="me-2">
                <button
                  className={`inline-block px-4 py-3 border-b-2 rounded-t-lg font-bold text-sm transition-colors ${
                    activeTab === tab.id
                      ? "text-blue border-blue"
                      : "text-black dark:text-slate-200 hover:text-slate-600 hover:border-slate-300 dark:hover:text-slate-300 border-transparent"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
            <li className="me-2 relative" ref={moreRef}>
              <button
                className={`inline-flex items-center gap-1 px-4 py-3 border-b-2 rounded-t-lg font-bold text-sm transition-colors ${
                  activeMoreTab
                    ? "text-blue border-blue"
                    : "text-black dark:text-slate-200 hover:text-slate-600 hover:border-slate-300 dark:hover:text-slate-300 border-transparent"
                }`}
                onClick={() => setIsMoreOpen((prev) => !prev)}
              >
                {activeMoreTab ? activeMoreTab.label : "More"}
                <KeyboardArrowDownIcon
                  sx={{ fontSize: "18px" }}
                  className={`transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isMoreOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 min-w-[180px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden">
                  {moreTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue font-medium"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMoreOpen(false);
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </div>
        <div className="p-4">{renderContent()}</div>
      </section>
    </>
  );
}

export default SingleEvent;
