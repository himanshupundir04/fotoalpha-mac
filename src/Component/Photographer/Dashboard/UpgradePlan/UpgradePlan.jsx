import React, { useContext, useEffect, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import DiamondIcon from "@mui/icons-material/Diamond";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TuneIcon from "@mui/icons-material/Tune";
import axios from "axios";
import { PlanContext } from "../../Context/PlanContext";
import PaymentDetails from "./Pricing/PaymentDetails";
import { useFormik } from "formik";
import Calculateprice from "./Calculateprice";
import * as yup from "yup";

const baseURL = import.meta.env.VITE_BASE_URL;

const BILLING_PERIODS = [
  { id: "monthly",    label: "Monthly" },
  { id: "halfYearly", label: "Half-Yearly" },
  { id: "yearly",     label: "Yearly" },
];

const PLAN_TABS = [
  { id: "monthly",    label: "Starter", icon: BoltIcon },
  { id: "halfyearly", label: "Pro",     icon: DiamondIcon },
  { id: "myop",       label: "MYOP",    icon: TuneIcon },
];

const SCHEME = [
  {
    border: "border-teal-200",
    headerFrom: "from-[#0b8599]", headerTo: "to-[#0a7085]",
    shadow: "shadow-[#0b8599]/20",
    check: "#0b8599",
    badge: "bg-[#e6f8fb] text-[#0b8599]",
  },
  {
    border: "border-violet-200",
    headerFrom: "from-violet-500", headerTo: "to-purple-600",
    shadow: "shadow-violet-400/20",
    check: "#7c3aed",
    badge: "bg-violet-50 text-violet-700",
  },
  {
    border: "border-amber-200",
    headerFrom: "from-amber-400", headerTo: "to-orange-500",
    shadow: "shadow-amber-400/20",
    check: "#d97706",
    badge: "bg-amber-50 text-amber-700",
  },
];

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

function PlanCard({ plan, index, isCurrent, onSelect }) {
  const s = SCHEME[index % SCHEME.length];
  const displayName = plan?.planName === "Plus" ? "Starter" : plan?.planName;
  const features = [
    { label: "Validity",       value: `${plan?.validity} days` },
    { label: "Events Covered", value: plan?.events === -1 ? "Unlimited" : `${plan?.events} events` },
    { label: "Photo Uploads",  value: `${plan?.uploadPhotos?.toLocaleString()} photos` },
    { label: "Storage",        value: formatBytes(plan?.storage) },
  ];

  return (
    <div className={`bg-white rounded-2xl border-2 ${s.border} shadow-lg ${s.shadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col`}>
      {/* Gradient header */}
      <div className={`bg-gradient-to-br ${s.headerFrom} ${s.headerTo} px-6 pt-6 pb-10`}>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mb-4">
          {displayName}
        </span>
        <div className="text-white">
          <span className="text-4xl font-black">₹{plan?.price?.toLocaleString()}</span>
          <span className="text-white/70 text-xs ml-2">+{plan?.gstInPercent}% GST</span>
        </div>
        <p className="text-white/70 text-xs mt-1 capitalize">per {plan?.planType}</p>
        <p className="text-white/60 text-xs mt-3 leading-relaxed">
          Best for solo photographers or small teams handling a few events.
        </p>
      </div>

      {/* Features — overlaps header */}
      <div className="-mt-4 bg-white rounded-t-2xl px-6 pt-5 pb-6 flex flex-col flex-1">
        <div className="space-y-3 flex-1 mb-6">
          {features.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon sx={{ fontSize: 16, color: s.check }} />
                <span className="text-slate-500 text-sm">{label}</span>
              </div>
              <span className="text-slate-800 text-sm font-bold">{value}</span>
            </div>
          ))}
        </div>

        {isCurrent ? (
          <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold text-center flex items-center justify-center gap-1.5">
            <CheckCircleIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
            Current Plan
          </div>
        ) : (
          <button
            onClick={onSelect}
            className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${s.headerFrom} ${s.headerTo} text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg ${s.shadow}`}
          >
            Select Plan
          </button>
        )}
      </div>
    </div>
  );
}

function UpgradePlan() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const currentUser = users.find((u) => u.isCurrent);
  const token = localStorage.getItem("token");

  const { setPlan, setYear, setPlanid, setPriceDetail, setFillDetail } = useContext(PlanContext);
  const [discount, setDiscount] = useState(0);
  const [annual, setAnnual] = useState([]);
  const [open, setopen] = useState(false);
  const handleClose = () => setopen(false);
  const [loading, setLoading] = useState(false);
  const [paydata, setPayData] = useState([]);
  const [opend, setOpend] = useState(false);
  const handleClosed = () => setOpend(false);
  const [latestData, setLatestData] = useState(null);
  const [plans, setPlans] = useState("monthly");
  const [allplan, setAllPlan] = useState([]);
  const [activeTab, setActiveTab] = useState("monthly");

  const handleOpen = (plan, year, id, gst) => {
    setopen(true);
    setPlan(plan);
    setYear(year);
    setPlanid(id);
    setDiscount(gst);
  };

  const id = currentUser?._id;

  useEffect(() => {
    if (paydata.length) {
      const latestDate = new Date(Math.max(...paydata.map((item) => new Date(item?.subscription_id?.end_date))));
      const latestRecord = paydata.find((item) => new Date(item?.subscription_id?.end_date).getTime() === latestDate.getTime());
      setLatestData(latestRecord);
    }
  }, [paydata]);

  const fetchPayment = async () => {
    try {
      const res = await axios.get(`${baseURL}/transactions/user/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchPayment();
  }, []);

  const fetchPlans = () => {
    axios
      .get(`${baseURL}/mysubscriptions/plans`, {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "69418" },
      })
      .then((res) => {
        const p = res.data.data.plans;
        setPlan(p);
        setAllPlan(p);
      })
      .catch(console.log);
  };

  const formik = useFormik({
    initialValues: { validityInMonths: "", numberOfEvents: "", uploadPhotos: "", storageGB: "" },
    validationSchema: yup.object({
      validityInMonths: yup.number().min(1, "Month must be at least 1").required("Month is required"),
      numberOfEvents:   yup.number().min(3, "Events must be at least 3").required("Events is required"),
      uploadPhotos:     yup.number().min(5000, "Photos must be at least 5000").required("Photos is required"),
      storageGB:        yup.string().required("Storage is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setFillDetail(values);
      try {
        const response = await axios.post(`${baseURL}/mysubscriptions/myop/calculate-price`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", "ngrok-skip-browser-warning": "69418" },
        });
        setLoading(false);
        setPriceDetail(response.data);
        setOpend(true);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    },
  });

  const storageOptions = [
    { label: "250 GB", value: 250 },
    { label: "500 GB", value: 500 },
    { label: "1 TB",   value: 1024 },
    { label: "2 TB",   value: 2048 },
    { label: "3 TB",   value: 3072 },
    { label: "4 TB",   value: 4096 },
    { label: "5 TB",   value: 5120 },
  ];

  const myopFields = [
    { name: "validityInMonths", label: "Validity (months)", placeholder: "e.g. 3", type: "number" },
    { name: "numberOfEvents",   label: "Number of Events",  placeholder: "e.g. 10", type: "number" },
    { name: "uploadPhotos",     label: "Photo Upload Limit", placeholder: "e.g. 10000", type: "number" },
  ];

  const renderCards = (filterFn) => {
    const filtered = allplan.filter(filterFn);
    if (!filtered.length) return (
      <p className="text-center text-slate-400 py-12 text-sm">No plans available for this period.</p>
    );
    return (
      <div className="flex flex-wrap justify-center gap-6">
        {filtered.map((plan, index) => (
          <div key={plan._id} className="w-full sm:w-80">
            <PlanCard
              plan={plan}
              index={index}
              isCurrent={latestData?.plan_id?._id === plan?._id}
              onSelect={() => handleOpen(plan?.price, plan?.planType, plan?._id, plan?.gstInPercent)}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === "myop") return (
      <div className="flex justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl border-2 border-rose-200 shadow-lg shadow-rose-100/50 overflow-hidden">
          {/* MYOP header */}
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 px-6 pt-6 pb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <AutoAwesomeIcon sx={{ fontSize: 22, color: "#fff" }} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Make Your Own Plan</h3>
                <p className="text-white/70 text-xs">Pay only for what you need</p>
              </div>
            </div>
            <p className="text-white/60 text-xs leading-relaxed mt-2">
              Fully customise your storage, events, and upload quota. We'll calculate the best price for you.
            </p>
          </div>

          <div className="-mt-4 bg-white rounded-t-2xl px-6 pt-5 pb-6">
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {myopFields.map(({ name, label, placeholder, type }) => (
                <div key={name}>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={formik.values[name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border-2 border-slate-100 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all"
                  />
                  {formik.touched[name] && formik.errors[name] && (
                    <p className="text-red-500 text-xs mt-1">· {formik.errors[name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Storage</label>
                <select
                  name="storageGB"
                  value={formik.values.storageGB}
                  onChange={formik.handleChange}
                  className="w-full border-2 border-slate-100 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none transition-all bg-white"
                >
                  <option value="">Select storage size</option>
                  {storageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {formik.touched.storageGB && formik.errors.storageGB && (
                  <p className="text-red-500 text-xs mt-1">· {formik.errors.storageGB}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-rose-500/25 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : <AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                {loading ? "Calculating…" : "Calculate My Price"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );

    if (activeTab === "monthly")    return renderCards((p) => p.planType === plans && p.planName.includes("Plus"));
    if (activeTab === "halfyearly") return renderCards((p) => p.planType === plans && p.planName.includes("Pro"));
    return null;
  };

  return (
    <>
      {/* Page header */}
      <div className="text-center pt-6 pb-2">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">Choose Your Plan</h1>
        <p className="text-slate-400 text-sm mt-1">Simple, transparent pricing that grows with your business</p>
      </div>

      {/* Billing period toggle — hidden for MYOP */}
      {activeTab !== "myop" && (
        <div className="flex justify-center mt-5 mb-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
            {BILLING_PERIODS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setPlans(id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  plans === id
                    ? "bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Plan type tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {PLAN_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === id
                  ? "bg-gradient-to-r from-[#0b8599] to-[#0a7085] text-white shadow-lg shadow-[#0b8599]/30"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon sx={{ fontSize: 15 }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="pb-10 px-4">
        {renderContent()}
      </div>

      <PaymentDetails payopen={open} payclose={handleClose} discountamnt={discount} />
      <Calculateprice open={opend} handleClose={handleClosed} />
    </>
  );
}

export default UpgradePlan;
