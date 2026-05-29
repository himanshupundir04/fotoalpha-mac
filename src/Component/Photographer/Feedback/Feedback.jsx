import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Person4Icon from "@mui/icons-material/Person4";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import CircularProgress from "@mui/material/CircularProgress";
import { TablePagination } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import ReviewsOutlinedIcon from "@mui/icons-material/ReviewsOutlined";

const baseURL = import.meta.env.VITE_BASE_URL;

const clampRating = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > 5) return 5;
  return parsed;
};

const formatFeedbackTime = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeFeedback = (item = {}, index = 0) => {
 

  return {
    id: item?._id || item?.id || `feedback-${index}`,
    name: item?.user|| item?.userName || item?.name || "Guest",
    eventName:
      item?.eventName ||
      item?.projectName ||
      item?.event?.name ||
      item?.project?.name ||
      item?.event_title ||
      "Untitled Event",
    eventId: item?.eventId || item?.event?._id || "",   
    rating: clampRating(item?.star ?? item?.rating ?? item?.stars),
    time: formatFeedbackTime(
      item?.time || item?.createdAt || item?.submit_date || item?.timestamp,
    ),
    comment: item?.message || item?.testimonial || item?.comment || "-",
  };
};

const normalizeTopProject = (item = {}, index = 0) => {
  const eventNameFromEvent =
    typeof item?.event === "string" ? item.event : item?.event?.name;

  const averageRating = clampRating(
    item?.averageRating ?? item?.avgRating ?? item?.rating ?? item?.star,
  );
  const totalReviews = Number(
    item?.totalRatings ??
      item?.totalReviews ??
      item?.reviewCount ??
      item?.reviews ??
      item?.feedbackCount ??
      0,
  );

  return {
    id: item?.eventId || item?._id || item?.id || `project-${index}`,
    eventName:
      item?.eventName ||
      item?.projectName ||
      eventNameFromEvent ||
      item?.event?.name ||
      item?.name ||
      "Untitled Event",
    averageRating,
    totalReviews: Number.isFinite(totalReviews) ? totalReviews : 0,
  };
};

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};


const Stars = ({ count }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) =>
      star <= count ? (
        <StarRoundedIcon
          key={star}
          sx={{ fontSize: 16 }}
          className="text-amber-400"
        />
      ) : (
        <StarBorderRoundedIcon
          key={star}
          sx={{ fontSize: 16 }}
          className="text-slate-300"
        />
      ),
    )}
  </div>
);

function Feedback() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [feedbacks, setFeedbacks] = useState([]);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [topRatedProjects, setTopRatedProjects] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [loadingTopProjects, setLoadingTopProjects] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchTopRatedProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const response = await axios.get(`${baseURL}/photographer/feedbacks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      const rows = Array.isArray(response?.data?.feedbacks)
        ? response.data.feedbacks
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];

      const normalizedRows = rows.map((item, index) => normalizeFeedback(item, index));
      const totalFromApi = Number(
        response?.data?.pagination?.total ??
          response?.data?.total ??
          response?.data?.count,
      );

      setFeedbacks(normalizedRows);
      setTotalFeedback(
        Number.isFinite(totalFromApi) ? totalFromApi : normalizedRows.length,
      );
    } catch {
      setFeedbacks([]);
      setTotalFeedback(0);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const fetchTopRatedProjects = async () => {
    setLoadingTopProjects(true);
    try {
      const response = await axios.get(`${baseURL}/photographer/top-rated-projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 10,
        },
      });

      const rows = Array.isArray(response?.data?.projects)
        ? response.data.projects
        : Array.isArray(response?.data?.topRatedProjects)
          ? response.data.topRatedProjects
          : Array.isArray(response?.data?.events)
            ? response.data.events
            : Array.isArray(response?.data?.data)
              ? response.data.data
              : Array.isArray(response?.data)
                ? response.data
                : [];

      const normalizedRows = rows
        .map((item, index) => normalizeTopProject(item, index))
        .sort(
          (a, b) =>
            b.averageRating - a.averageRating || b.totalReviews - a.totalReviews,
        );

      setTopRatedProjects(normalizedRows);
    } catch {
      setTopRatedProjects([]);
    } finally {
      setLoadingTopProjects(false);
    }
  };

  const averageGuestRating = useMemo(() => {
    if (!feedbacks.length) return "0.0";
    const total = feedbacks.reduce((acc, item) => acc + item.rating, 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const bestProjectRating = useMemo(() => {
    if (!topRatedProjects.length) return "0.0";
    return topRatedProjects[0].averageRating.toFixed(1);
  }, [topRatedProjects]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <main className="flex-1 pb-3 text-start">
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Average Guest Rating"
          value={averageGuestRating}
          icon={<Person4Icon sx={{ fontSize: 22 }} />}
          iconClass="bg-yellow-100 text-yellow-700"
        />
        <StatCard
          title="Top Project Rating"
          value={bestProjectRating}
          icon={<ReviewsOutlinedIcon sx={{ fontSize: 22 }} />}
          iconClass="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          title="Total Feedback"
          value={totalFeedback}
          icon={<QuestionAnswerIcon sx={{ fontSize: 22 }} />}
          iconClass="bg-violet-100 text-violet-700"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {loadingFeedbacks ? (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CircularProgress />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="flex flex-col sm:flex-row items-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 shadow-sm overflow-hidden">
              {/* Illustration */}
              <div className="flex-shrink-0 flex items-center justify-center bg-indigo-50/80 sm:w-52 w-full py-10 sm:py-0 sm:h-56">
                <svg viewBox="0 0 120 100" className="w-36 h-28" fill="none">
                  {/* Back bubble */}
                  <rect x="30" y="28" width="70" height="48" rx="12" fill="#c7d2fe" opacity="0.6" />
                  <polygon points="85,76 95,88 75,76" fill="#c7d2fe" opacity="0.6" />
                  {/* Front bubble */}
                  <rect x="14" y="16" width="66" height="46" rx="11" fill="#818cf8" opacity="0.85" />
                  <polygon points="22,62 12,76 34,62" fill="#818cf8" opacity="0.85" />
                  {/* Stars inside front bubble */}
                  <text x="22" y="46" fontSize="20" fill="white" opacity="0.95">★</text>
                  <text x="44" y="46" fontSize="20" fill="white" opacity="0.95">★</text>
                  <text x="34" y="34" fontSize="14" fill="white" opacity="0.6">★</text>
                  {/* Dots */}
                  <circle cx="105" cy="20" r="3" fill="#c7d2fe" opacity="0.7" />
                  <circle cx="10" cy="14" r="2" fill="#818cf8" opacity="0.4" />
                  <circle cx="112" cy="60" r="2" fill="#a5b4fc" opacity="0.6" />
                </svg>
              </div>
              {/* Content */}
              <div className="flex-1 px-8 py-8 text-start">
                <h3 className="text-xl font-bold text-slate-800 mb-2">No feedback yet</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">
                  Guest ratings and review submissions will appear here once your clients share their experience.
                </p>
                <button onClick={() => navigate("/photographer/events_category")} className="inline-flex items-center gap-2 bg-blue rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Share Event Gallery
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
                      {getInitials(item.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-800">
                          {item.name}
                        </h3>                        
                        <span className="text-xs text-slate-400">
                          {item.time}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Event: {item.eventName}
                      </p>
                      <div className="mt-1">
                        <Stars count={item.rating} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2">
            <TablePagination
              component="div"
              count={totalFeedback}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 15, 20, 50]}
              className="rounded-b-xl bg-white text-black"
            />
          </div>
        </div>

        <aside className="xl:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-4">
            <div className="flex items-center gap-2">
              <ReviewsOutlinedIcon className="text-amber-500" />
              <h3 className="text-base font-semibold text-slate-800">
                Top Rated Projects
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Event name with average star rating.
            </p>

            <div className="mt-4 space-y-3">
              {loadingTopProjects ? (
                <div className="flex h-24 items-center justify-center">
                  <CircularProgress size={24} />
                </div>
              ) : topRatedProjects.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                  No project ratings available.
                </p>
              ) : (
                topRatedProjects.map((project, index) => (
                  <div
                    key={project.id || `${project.eventName}-${index}`}
                    className="rounded-xl border border-slate-200 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-700">
                        #{index + 1}
                      </p>
                      <p className="text-xs text-slate-500">
                        {project.totalReviews} review
                        {project.totalReviews > 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
                      {project.eventName}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Stars count={Math.round(project.averageRating)} />
                      <span className="text-xs font-semibold text-slate-600">
                        {project.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function StatCard({ title, value, icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
        </div>
        <span className={`rounded-lg p-2 ${iconClass}`}>{icon}</span>
      </div>
    </div>
  );
}

export default Feedback;
