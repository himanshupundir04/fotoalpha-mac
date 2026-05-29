import React, { useEffect, useState } from "react";
import { Box, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useFormik } from "formik";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import * as Yup from "yup";
import { toast } from "react-toastify";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "92%", sm: 440 },
  outline: "none",
};

const baseURL = import.meta.env.VITE_BASE_URL;

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "?";
}

function EditTeamMember({ open, handleClose, id, fetchTeam }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (open && id) fetchData(id);
    if (!open) setData(undefined);
  }, [open, id]);

  const fetchData = async (memberId) => {
    if (!memberId) return;
    try {
      setFetchingData(true);
      const response = await axios.get(`${baseURL}/photographer/team/${memberId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
      });
      const user =
        response?.data?.user ||
        response?.data?.data?.user ||
        response?.data?.data ||
        null;
      setData(user);
      if (!user) toast.error("Failed to load team member data");
    } catch (error) {
      toast.error("Failed to fetch team member details");
    } finally {
      setFetchingData(false);
    }
  };

  const validationSchema = Yup.object({
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: data?.name || "",
      username: data?.username || "",
      email: data?.email || "",
      password: "",
      confirmPassword: "",
      role: "6953cfa992c61d75c3d82fb4",
      phone: data?.phone || "",
      countryCode: data?.countryCode || "",
      id: data?._id,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        await axios.put(`${baseURL}/photographer/team`, values, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setLoading(false);
        toast.success("Team member updated successfully", { autoClose: 1000 });
        formik.resetForm();
        setTimeout(() => fetchTeam(), 500);
        handleClose();
      } catch (error) {
        setLoading(false);
        toast.error(error?.response?.data?.message || "Something went wrong", { autoClose: 1000 });
      }
    },
  });

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#0b8599] to-[#0a7085] px-6 pt-6 pb-10">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <CloseIcon sx={{ fontSize: 16, color: "#fff" }} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BorderColorIcon sx={{ fontSize: 22, color: "#fff" }} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Edit Team Member</h2>
                <p className="text-white/70 text-xs mt-0.5">Update member details below</p>
              </div>
            </div>
          </div>

          {/* Avatar chip overlapping header */}
          <div className="relative -mt-6 px-6 mb-1 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
              <span className="text-white font-bold text-base">{getInitials(formik.values.name)}</span>
            </div>
            {!fetchingData && data?.name && (
              <div className="bg-white dark:bg-slate-700 rounded-xl px-3 py-1.5 shadow border border-slate-100 dark:border-slate-600">
                <p className="text-xs font-semibold text-slate-700 dark:text-white">{data.name}</p>
                {data.email && <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{data.email}</p>}
              </div>
            )}
          </div>

          {/* Body */}
          <form onSubmit={formik.handleSubmit} className="px-6 pb-6 pt-3">
            {fetchingData ? (
              <div className="flex flex-col gap-4 py-4">
                {[80, 60, 80].map((w, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className={`h-3 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse`} style={{ width: `${w}%` }} />
                    <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-2">
                {/* Name Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <PersonOutlineIcon sx={{ fontSize: 12 }} />
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-sm font-medium text-slate-700 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b8599]/25 focus:border-[#0b8599] transition-all"
                  />
                </div>

                {/* Phone Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <PhoneOutlinedIcon sx={{ fontSize: 12 }} />
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`flex items-center rounded-xl border bg-slate-50 dark:bg-slate-700/50 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#0b8599]/25 focus-within:border-[#0b8599] ${
                      formik.touched.phone && formik.errors.phone
                        ? "border-red-400"
                        : "border-slate-200 dark:border-slate-600"
                    }`}
                  >
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
                        fontSize: "14px",
                        fontWeight: 500,
                        paddingLeft: "48px",
                        height: "42px",
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
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                      {formik.errors.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || fetchingData}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0b8599] to-[#0a7085] text-white text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <BorderColorIcon sx={{ fontSize: 15 }} />
                    Update Member
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}

export default EditTeamMember;
