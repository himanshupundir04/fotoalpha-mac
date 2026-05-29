import React, { useState } from "react";
import { Box, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
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

function CreateTeamMember({ open, handleClose, fetchTeam, fetchTeamAssign }) {
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      role: "6953cfa992c61d75c3d82fb4",
      phone: "",
      countryCode: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        await axios.post(`${baseURL}/photographer/team/create-team`, values, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setLoading(false);
        toast.success("Team member added successfully", { autoClose: 1000 });
        formik.resetForm();
        fetchTeam();
        handleClose();
      } catch (error) {
        setLoading(false);
        toast.error(error?.response?.data?.message || "Something went wrong", { autoClose: 1000 });
      }
    },
  });

  const initials = formik.values.name
    ? formik.values.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("")
    : null;

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
                <PersonAddOutlinedIcon sx={{ fontSize: 24, color: "#fff" }} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Add Team Member</h2>
                <p className="text-white/70 text-xs mt-0.5">Invite a photographer or assistant</p>
              </div>
            </div>
          </div>

          {/* Live avatar chip overlapping header */}
          <div className="relative -mt-6 px-6 mb-1 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 flex-shrink-0">
              {initials ? (
                <span className="text-white font-bold text-base">{initials}</span>
              ) : (
                <PersonAddOutlinedIcon sx={{ fontSize: 20, color: "rgba(255,255,255,0.8)" }} />
              )}
            </div>
            {formik.values.name && (
              <div className="bg-white dark:bg-slate-700 rounded-xl px-3 py-1.5 shadow border border-slate-100 dark:border-slate-600">
                <p className="text-xs font-semibold text-slate-700 dark:text-white">{formik.values.name}</p>
                <p className="text-[10px] text-slate-400">New team member</p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="px-6 pb-6 pt-3">
            <div className="flex flex-col gap-4 mt-2">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <PersonOutlineIcon sx={{ fontSize: 12 }} />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-sm font-medium text-slate-700 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b8599]/25 focus:border-[#0b8599] transition-all"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <PhoneOutlinedIcon sx={{ fontSize: 12 }} />
                  Phone Number <span className="text-red-500">*</span>
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
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                    {formik.errors.phone}
                  </p>
                )}
              </div>

              {/* Info note */}
              <div className="bg-[#e6f8fb] dark:bg-[#0b8599]/10 border border-[#b2eaf4] dark:border-[#0b8599]/30 rounded-xl px-4 py-3">
                <p className="text-xs text-[#0b8599] dark:text-[#4dd6ea] font-medium leading-relaxed">
                  An invitation will be sent to this member. They can accept or decline from their account.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0b8599] to-[#0a7085] text-white text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Adding…
                  </>
                ) : (
                  <>
                    <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />
                    Add Member
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

export default CreateTeamMember;
