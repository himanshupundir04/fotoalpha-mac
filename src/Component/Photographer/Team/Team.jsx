import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import CreateTeamMember from "./CreateTeamMember";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BoltIcon from "@mui/icons-material/Bolt";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import EditTeamMember from "./EditTeamMember";
import { toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

const baseurl = import.meta.env.VITE_BASE_URL;

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-orange-400 to-rose-500",
  "from-pink-500 to-fuchsia-600",
  "from-amber-400 to-orange-500",
];

const STATUS_CONFIG = {
  accepted: { label: "Accepted", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", cls: "bg-amber-50  text-amber-700  border-amber-200" },
  rejected: { label: "Rejected", cls: "bg-red-50    text-red-700    border-red-200" },
};

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

function Team() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState([]);
  const [search, setSearch] = useState("");
  const [opend, setOpen] = useState(false);
  const handleClosed = () => setOpen(false);
  const [openedit, setOpenedit] = useState(false);
  const handleClosededit = () => { setOpenedit(false); setEditid(""); };
  const [editid, setEditid] = useState("");
  const [permission, setPermission] = useState(false);

  const handleOpen = () => fetchGuar();

  useEffect(() => { fetchTeam(); }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseurl}/photographer/team`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTeam(response.data.users);
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

  const fetchGuar = async () => {
    try {
      const response = await axios.get(`${baseurl}/v1/subscription/guard/team-member`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.canAdd) {
        setOpen(true);
      } else {
        toast.error("Limit reached. Please upgrade your plan.");
      }
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
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          axios.delete(`${baseurl}/events/team/${id}/remove`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "ngrok-skip-browser-warning": "69420",
            },
          });
          toast.success("Team member deleted successfully");
          setTimeout(() => fetchTeam(), 800);
        } catch (err) {
          toast.error(err?.response?.data?.message || "Something went wrong");
        }
      }
    });
  };

  const handleEdit = (id) => {
    if (!id) { toast.error("Unable to load team member details"); return; }
    setEditid(id);
    setOpenedit(true);
  };

  const filtered = team.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.phone || "").toLowerCase().includes(q)
    );
  });

  const counts = {
    total: team.length,
    accepted: team.filter((m) => m.invitationStatus === "accepted").length,
    pending: team.filter((m) => m.invitationStatus === "pending").length,
    rejected: team.filter((m) => m.invitationStatus === "rejected").length,
  };

  if (permission) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <ErrorOutlineIcon sx={{ fontSize: 32 }} className="text-red-500" />
        </div>
        <h2 className="text-slate-800 dark:text-white font-bold text-xl mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-sm max-w-xs mb-6">
          Your current plan doesn't include team management. Upgrade to collaborate with your team.
        </p>
        <button
          onClick={() => navigate("/photographer/upgrade_plan")}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow hover:opacity-90 transition flex items-center gap-2"
        >
          <BoltIcon sx={{ fontSize: 18 }} /> Upgrade Plan
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <CircularProgress size={36} sx={{ color: "#0b8599" }} />
        <p className="mt-4 text-slate-500 text-sm dark:text-slate-400">Loading team members…</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5 text-start">
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0b8599] to-[#0a7085] flex items-center justify-center shadow-md flex-shrink-0">
              <GroupsOutlinedIcon sx={{ fontSize: 22, color: "#fff" }} />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">
                Team Members
              </h1>
              <p className="text-slate-400 text-xs mt-0.5 truncate">
                Manage and invite photographers to your team
              </p>
            </div>
          </div>
          <button
            onClick={handleOpen}
            className="flex items-center gap-2 bg-gradient-to-r from-[#0b8599] to-[#0a7085] text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
          >
            <AddIcon sx={{ fontSize: 18 }} />
            Add Member
          </button>
        </div>

        {/* Stats Strip */}
        {team.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: counts.total, cls: "text-slate-700 dark:text-white", bg: "bg-white dark:bg-slate-800" },
              { label: "Accepted", value: counts.accepted, cls: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "Pending", value: counts.pending, cls: "text-amber-600", bg: "bg-amber-50  dark:bg-amber-900/20" },
              { label: "Rejected", value: counts.rejected, cls: "text-red-500", bg: "bg-red-50    dark:bg-red-900/20" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm px-4 py-3 flex flex-col`}>
                <span className={`text-2xl font-bold ${s.cls}`}>{s.value}</span>
                <span className="text-xs text-slate-400 mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        {team.length > 0 && (
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" sx={{ fontSize: 18 }} />
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b8599]/25 focus:border-[#0b8599] shadow-sm"
            />
          </div>
        )}

        {/* Empty State */}
        {team.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#e6f8fb] flex items-center justify-center mb-5">
              <GroupsOutlinedIcon sx={{ fontSize: 36, color: "#0b8599" }} />
            </div>
            <h3 className="text-slate-700 dark:text-white font-bold text-lg mb-2">No Team Members Yet</h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              Add photographers or assistants to collaborate on events together.
            </p>
            <button
              onClick={handleOpen}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0b8599] to-[#0a7085] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 transition"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              Add Your First Member
            </button>
          </div>
        )}

        {/* No Search Results */}
        {team.length > 0 && filtered.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-12 text-center">
            <SearchIcon sx={{ fontSize: 36 }} className="text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No members match "<span className="font-semibold">{search}</span>"</p>
          </div>
        )}

        {/* Cards Grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((member, idx) => {
              const status = STATUS_CONFIG[member.invitationStatus] || {
                label: member.invitationStatus || "N/A",
                cls: "bg-slate-100 text-slate-600 border-slate-200",
              };
              const avatarGrad = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const initials = getInitials(member.name);

              return (
                <div
                  key={member._id || idx}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4"
                >
                  {/* Card Top */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-white font-bold text-base">{initials || "?"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                        {member.name || "—"}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <PhoneOutlinedIcon sx={{ fontSize: 12 }} className="text-slate-400" />
                        <span className="text-xs text-slate-400 truncate">{member.phone || "No phone"}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 dark:bg-slate-700" />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(member._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 dark:border-slate-600 transition-all"
                    >
                      <BorderColorIcon sx={{ fontSize: 14 }} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-red-50 hover:text-red-600 border border-slate-200 dark:border-slate-600 transition-all"
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateTeamMember open={opend} handleClose={handleClosed} fetchTeam={fetchTeam} />
      <EditTeamMember open={openedit} handleClose={handleClosededit} id={editid} fetchTeam={fetchTeam} />
    </>
  );
}

export default Team;
