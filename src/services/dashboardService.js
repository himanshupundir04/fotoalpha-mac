import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "ngrok-skip-browser-warning": "69420",
});

export const fetchDashboardSummary = async () => {
  const response = await axios.get(
    `${baseURL}/dashboard/photographer/dashboard-summary`,
    { headers: authHeaders() }
  );
  return response.data;
};

export const fetchBillables = async () => {
  const response = await axios.get(`${baseURL}/events/billables`, {
    headers: authHeaders(),
  });
  return (
    response.data?.data || {
      summary: {},
      unpaidEvents: [],
      unpricedEvents: [],
    }
  );
};

export const fetchTeamInvitations = async () => {
  const response = await axios.get(
    `${baseURL}/photographer/team?invitationStatus=pending`,
    { headers: authHeaders() }
  );
  return {
    users: response.data.users || [],
    invitationSummary: response.data.invitationSummary || {
      pending: 0,
      accepted: 0,
      rejected: 0,
      total: 0,
    },
  };
};

export const fetchPrintOrderStats = async () => {
  const response = await axios.get(
    `${baseURL}/photographer/print-requests/stats`,
    { headers: authHeaders() }
  );
  return response.data?.data || { in_production: 0, shipped: 0, delivered: 0, totalAmount: 0 };
};

export const fetchEarningsActivity = async () => {
  const response = await axios.get(
    `${baseURL}/dashboard/photographer/earnings-activity`,
    { headers: authHeaders() }
  );
  return response.data?.data || [];
};

export const fetchUploadActivity = async (days = 7) => {
  const response = await axios.get(
    `${baseURL}/uploads/activity?days=${days}`,
    { headers: authHeaders() }
  );
  return response.data?.data || [];
};

export const checkHasEvents = async () => {
  const response = await axios.get(`${baseURL}/events/all-events`, {
    headers: authHeaders(),
  });
  return (response.data.events?.length || 0) > 0;
};

export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export const formatCurrency = (amount) =>
  `₹${new Intl.NumberFormat("en-IN").format(amount || 0)}`;

export const formatNumber = (n) =>
  new Intl.NumberFormat("en-IN").format(n || 0);

export const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};
