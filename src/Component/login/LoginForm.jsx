import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import OTPInput from "react-otp-input";
import PhoneInput from "react-phone-input-2";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

const baseURL = import.meta.env.VITE_BASE_URL;

function LoginForm({ handleClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingotp, setLoadingotp] = useState(false);
  const [showotp, setShowotp] = useState(false);
  const [phone, setPhone] = useState(null);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpRef = useRef(null);

  useEffect(() => {
    let interval;
    if (showotp) {
      setTimer(30);
      setCanResend(false);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showotp]);

  useEffect(() => {
    if (showotp) {
      setTimeout(() => { otpRef.current?.querySelector("input")?.focus(); }, 100);
    }
  }, [showotp]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = users.find((u) => u.isCurrent);
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTimestamp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      if (expiryTimestamp <= now) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("users");
        localStorage.removeItem("avatar");
        toast.error("Your session has expired. Please log in again.", { autoClose: 1000 });
        navigate("/");
        return;
      }
      if (currentUser?.role?.name === "photographer") navigate("/photographer/dashboard");
      else if (currentUser?.role?.name === "photographer-team") navigate("/photographer_team/dashboard");
      else if (currentUser?.role?.name === "guest") navigate("/guest/my_events");
      else if (currentUser?.role?.name === "superadmin") navigate("/superadmin/dashboard");
      else if (currentUser?.role?.name === "admin_support") navigate("/admin_support/dashboard");
      else if (currentUser?.role?.name === "organization") navigate("/organization/dashboard");

      const timeout = (expiryTimestamp - now) * 1000;
      const t = setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("users");
        localStorage.removeItem("avatar");
        toast.error("Your session has expired. Please log in again.", { autoClose: 1200 });
        navigate("/");
      }, timeout);
      return () => clearTimeout(t);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: { phone: "", countryCode: "" },
    onSubmit: async (values) => {
      setLoading(true);
      setPhone(values.phone);
      try {
        await axios.post(`${baseURL}/auth/login`, values);
        setLoading(false);
        setShowotp(true);
        toast.success("OTP sent successfully", { autoClose: 1200 });
      } catch (error) {
        setLoading(false);
        toast.error(error?.response?.data?.message, { autoClose: 1500 });
      }
    },
  });

  const formikotp = useFormik({
    enableReinitialize: true,
    initialValues: { otp: "", phone },
    onSubmit: async (values) => {
      setLoadingotp(true);
      try {
        const res = await axios.post(`${baseURL}/auth/verify-login-otp`, values);
        setLoadingotp(false);
        toast.success("Login Successful", { autoClose: 1200 });
        formik.resetForm();

        const newUser = {
          ...res.data.data.user,
          token: res.data.data.token,
          refreshToken: res.data.data.refreshToken,
          avatar: res.data.data.avatarUrl,
        };

        let Exuser = JSON.parse(localStorage.getItem("users")) || [];
        Exuser = Exuser.map((u) => ({ ...u, isCurrent: false }));
        const existingIndex = Exuser.findIndex((u) => u._id === newUser._id);
        if (existingIndex !== -1) {
          Exuser[existingIndex] = { ...newUser, isCurrent: true };
        } else {
          Exuser.push({ ...newUser, isCurrent: true });
        }

        localStorage.setItem("users", JSON.stringify(Exuser));
        localStorage.setItem("token", newUser.token);
        localStorage.setItem("avatar", newUser.avatar);

        const role = res.data.data.user.role.name;
        const paths = {
          photographer: "/photographer/dashboard",
          guest: "/guest/my_events",
          superadmin: "/superadmin/dashboard",
          "photographer-team": "/photographer_team/dashboard",
          organization: "/organization/dashboard",
        };
        const targetPath = paths[role] || "/";

        handleClose?.();
        navigate(targetPath);
      } catch (error) {
        setLoadingotp(false);
        toast.error(error?.response?.data?.message, { autoClose: 1500 });
      }
    },
  });

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      await axios.post(`${baseURL}/auth/request-otp`, { phone });
      toast.success("OTP Resend Successful", { autoClose: 1200 });
      setTimer(30);
      setCanResend(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP Resend Failed", { autoClose: 1500 });
    }
  };

  const handleEditPhone = () => {
    setShowotp(false);
    formikotp.resetForm();
  };

  /* ── OTP Step ─────────────────────────────────────── */
  if (showotp) {
    return (
      <form onSubmit={formikotp.handleSubmit} className="flex flex-col items-center pt-6 pb-2">
        {/* Avatar circle */}
        <div className="w-14 h-14 rounded-full bg-[#e6f8fb] dark:bg-[#0b8599]/20 flex items-center justify-center mb-4 shadow-inner">
          <span className="text-2xl">🔐</span>
        </div>

        <h3 className="text-slate-800 dark:text-white font-bold text-xl mb-1">Enter OTP</h3>
        <p className="text-slate-400 text-xs text-center mb-1">
          We sent a 6-digit code to
        </p>
        <button
          type="button"
          onClick={handleEditPhone}
          className="flex items-center gap-1 text-[#0b8599] font-semibold text-sm mb-5 hover:text-[#086a7a] transition-colors"
        >
          +{phone}
          <BorderColorIcon sx={{ fontSize: 13 }} />
        </button>

        {/* OTP boxes */}
        <div ref={otpRef} className="w-full flex justify-center mb-2">
          <OTPInput
            value={formikotp.values.otp}
            onChange={(value) => formikotp.setFieldValue("otp", value)}
            numInputs={6}
            inputType="number"
            renderInput={(props) => (
              <input
                {...props}
                style={{
                  width: "2.8rem",
                  height: "2.8rem",
                  margin: "0 4px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  background: "#f8fafc",
                  textAlign: "center",
                  outline: "none",
                  transition: "all 0.15s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0b8599";
                  e.target.style.boxShadow = "0 0 0 3px rgba(11,133,153,0.15)";
                  e.target.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "#f8fafc";
                }}
              />
            )}
          />
        </div>

        {/* Resend */}
        <div className="flex items-center justify-center mb-5 h-6">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-xs font-bold text-[#0b8599] hover:text-[#086a7a] tracking-wide uppercase transition-colors"
            >
              Resend Code
            </button>
          ) : (
            <p className="text-xs text-slate-400 font-medium">
              Resend in <span className="text-[#0b8599] font-bold">{timer}s</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loadingotp || formikotp.values.otp.length < 6}
          className="w-full bg-gradient-to-r from-[#0b8599] to-[#0a7085] text-white text-sm font-bold tracking-wide py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#0b8599]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loadingotp ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Verifying…
            </>
          ) : "Verify & Sign In"}
        </button>
      </form>
    );
  }

  /* ── Phone Step ───────────────────────────────────── */
  return (
    <form
      onSubmit={formik.handleSubmit}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); formik.handleSubmit(); } }}
      className="flex flex-col pt-6 pb-2"
    >
      {/* Floating avatar from header overlap */}

      <h3 className="text-slate-800 dark:text-white font-bold text-xl text-center mb-1">Sign In</h3>
      <p className="text-slate-400 text-xs text-center mb-6">Enter your phone number to receive an OTP</p>

      {/* Phone field */}
      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <PhoneOutlinedIcon sx={{ fontSize: 11 }} />
          Phone Number
        </label>
        <div className={`flex items-center rounded-xl border-2 bg-slate-50 dark:bg-slate-700/50 overflow-hidden transition-all focus-within:border-[#0b8599] focus-within:ring-2 focus-within:ring-[#0b8599]/15 border-slate-200 dark:border-slate-600`}>
          <PhoneInput
            country={"in"}
            enableSearch={true}
            countryCodeEditable={false}
            value={
              (formik.values.countryCode || "").replace("+", "") +
              (formik.values.phone || "")
            }
            onChange={(value, country) => {
              const cleanValue = value.replace(/\D/g, "");
              const phoneWithoutCode = cleanValue.slice(country.dialCode.length);
              formik.setFieldValue("phone", phoneWithoutCode);
              formik.setFieldValue("countryCode", "+" + country.dialCode);
            }}
            inputStyle={{
              border: "none",
              outline: "none",
              width: "100%",
              background: "transparent",
              fontSize: "15px",
              fontWeight: "500",
              color: "#1e293b",
              height: "44px",
              paddingLeft: "48px",
            }}
            buttonStyle={{
              border: "none",
              background: "transparent",
              paddingLeft: "8px",
            }}
            containerStyle={{ width: "100%" }}
            onBlur={formik.handleBlur}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#0b8599] to-[#0a7085] text-white text-sm font-bold tracking-wide py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#0b8599]/25 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Sending OTP…
          </>
        ) : "Send OTP"}
      </button>
    </form>
  );
}

export default LoginForm;
