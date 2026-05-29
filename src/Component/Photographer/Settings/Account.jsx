import React, { useEffect, useState } from "react";
import demo from "../../image/guset-album 1.png";
import axios from "axios";
import { useFormik } from "formik";
import ChangePassword from "./ChangePassword";
import { toast } from "react-toastify";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

const baseUrl = import.meta.env.VITE_BASE_URL;

const POSITIONS = [
  { value: "top-left", label: "Top Left", row: 0, col: 0 },
  { value: "top-center", label: "Top Center", row: 0, col: 1 },
  { value: "top-right", label: "Top Right", row: 0, col: 2 },
  { value: "center-left", label: "Mid Left", row: 1, col: 0 },
  { value: "center", label: "Center", row: 1, col: 1 },
  { value: "center-right", label: "Mid Right", row: 1, col: 2 },
  { value: "bottom-left", label: "Bottom Left", row: 2, col: 0 },
  { value: "bottom-center", label: "Bottom Center", row: 2, col: 1 },
  { value: "bottom-right", label: "Bottom Right", row: 2, col: 2 },
];

function getPositionStyle(position) {
  const map = {
    "top-left": { top: "8px", left: "8px" },
    "top-center": { top: "8px", left: "50%", transform: "translateX(-50%)" },
    "top-right": { top: "8px", right: "8px" },
    "center-left": { top: "50%", left: "8px", transform: "translateY(-50%)" },
    center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    "center-right": { top: "50%", right: "8px", transform: "translateY(-50%)" },
    "bottom-left": { bottom: "8px", left: "8px" },
    "bottom-center": { bottom: "8px", left: "50%", transform: "translateX(-50%)" },
    "bottom-right": { bottom: "8px", right: "8px" },
  };
  return map[position] || map["bottom-right"];
}

function Account() {
  const [open, setOpen] = useState(false);
  const handleClosed = () => setOpen(false);
  const [watermark, setWatermark] = useState(null);
  const [watermarkPreview, setWatermarkPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    logo: "",
    width: 100,
    height: 100,
    opacity: 80,
    position: "bottom-right",
  });

  useEffect(() => {
    fetchWatermark();
  }, []);

  const fetchWatermark = async () => {
    try {
      const response = await axios.get(`${baseUrl}/photographer/watermark`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = response.data?.watermarkSettings;
      if (data) {
        setSettings({
          logo: data.logoSignedUrl || "",
          width: data.width || 100,
          height: data.height || 100,
          opacity: data.opacity || 80,
          position: data.position || "bottom-right",
        });
        if (data.logoSignedUrl) setWatermarkPreview(data.logoSignedUrl);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      logo: watermark || settings.logo || "",
      width: settings.width,
      height: settings.height,
      opacity: settings.opacity,
      position: settings.position,
    },
    onSubmit: async (values) => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const formData = new FormData();
      formData.append("logo", values.logo);
      formData.append("width", values.width);
      formData.append("height", values.height);
      formData.append("opacity", values.opacity);
      formData.append("position", values.position);
      try {
        await axios.post(`${baseUrl}/photographer/watermark`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
        });
        toast.success("Watermark updated successfully", { autoClose: 1000 });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error making request:", error?.message);
      }
    },
  });

  const handleWatermarkUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWatermark(file);
      setWatermarkPreview(URL.createObjectURL(file));
      formik.setFieldValue("logo", file);
    }
  };

  const handleRemoveLogo = () => {
    setWatermark(null);
    setWatermarkPreview("");
    formik.setFieldValue("logo", "");
  };

  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    formik.setFieldValue(name, value);
  };

  return (
    <>
      <section className="animate-fadeIn text-start">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0b8599] to-[#0a7085] flex items-center justify-center shadow-md flex-shrink-0">
              <ImageOutlinedIcon sx={{ fontSize: 20, color: "#fff" }} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg dark:text-white leading-tight">
                Watermark & Branding
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Protect your photos with a custom logo watermark
              </p>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-700">
              {/* ── Left Panel ── */}
              <div className="flex-1 p-6 flex flex-col gap-5">
                {/* Upload Zone */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Logo File
                  </p>
                  {!watermarkPreview ? (
                    <label
                      htmlFor="watermark-upload"
                      className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-[#0b8599] hover:bg-[#f0fbfd] dark:hover:bg-slate-700/40 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#e6f8fb] group-hover:bg-[#ccf2ff] flex items-center justify-center mb-3 transition-colors">
                        <CloudUploadIcon sx={{ fontSize: 24, color: "#0b8599" }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Click to upload watermark
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        PNG with transparent background · Max 5 MB
                      </span>
                    </label>
                  ) : (
                    <div className="relative w-full h-36 rounded-2xl border border-slate-200 dark:border-slate-600 bg-[#f8fafc] dark:bg-slate-700/30 flex items-center justify-center overflow-hidden group">
                      <img
                        src={watermarkPreview}
                        alt="Uploaded logo"
                        className="max-h-28 max-w-[80%] object-contain drop-shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <label
                          htmlFor="watermark-upload"
                          className="bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer shadow hover:bg-slate-50 transition"
                        >
                          Replace
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-red-600 transition flex items-center gap-1"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    id="watermark-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleWatermarkUpload}
                  />
                </div>

                {/* Live Preview */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Live Preview
                  </p>
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-200">
                    {/* checkerboard bg */}
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg,#cbd5e1 25%,transparent 25%,transparent 75%,#cbd5e1 75%),linear-gradient(45deg,#cbd5e1 25%,transparent 25%,transparent 75%,#cbd5e1 75%)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0,8px 8px",
                        backgroundColor: "#e2e8f0",
                      }}
                    />
                    <img
                      src={demo}
                      alt="Preview"
                      className="w-full h-full object-cover relative z-10 opacity-75"
                    />
                    {watermarkPreview && (
                      <img
                        src={watermarkPreview}
                        alt="Watermark"
                        className="z-20 transition-all duration-200 drop-shadow-lg"
                        style={{
                          width: `${settings.width}px`,
                          height: `${settings.height}px`,
                          opacity: settings.opacity / 100,
                          position: "absolute",
                          ...getPositionStyle(settings.position),
                        }}
                      />
                    )}
                    {!watermarkPreview && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-white bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                          Upload a logo to preview
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Right Panel ── */}
              <div className="w-full lg:w-[300px] p-6 flex flex-col gap-5 bg-slate-50/60 dark:bg-slate-800/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Display Settings
                </p>

                {/* Width & Height */}
                <div className="grid grid-cols-2 gap-3">
                  {["width", "height"].map((field) => (
                    <div key={field}>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                        {field} <span className="text-slate-400 font-normal normal-case">(px)</span>
                      </label>
                      <input
                        type="number"
                        name={field}
                        value={settings[field]}
                        onChange={handleSettingChange}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b8599]/25 focus:border-[#0b8599] text-sm font-medium text-slate-700 dark:text-white shadow-sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Opacity Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Opacity
                    </label>
                    <span className="text-xs font-bold text-[#0b8599] bg-[#e6f8fb] px-2 py-0.5 rounded-full">
                      {settings.opacity}%
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      name="opacity"
                      min={0}
                      max={100}
                      value={settings.opacity}
                      onChange={handleSettingChange}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#0b8599]"
                      style={{
                        background: `linear-gradient(to right, #0b8599 ${settings.opacity}%, #e2e8f0 ${settings.opacity}%)`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Position Grid Picker */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                    Position
                  </label>
                  <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-3 shadow-sm">
                    <div className="grid grid-cols-3 gap-1.5">
                      {POSITIONS.map((pos) => {
                        const active = settings.position === pos.value;
                        return (
                          <button
                            key={pos.value}
                            type="button"
                            title={pos.label}
                            onClick={() =>
                              handleSettingChange({ target: { name: "position", value: pos.value } })
                            }
                            className={`aspect-square rounded-lg flex items-center justify-center transition-all border ${
                              active
                                ? "bg-[#0b8599] border-[#0b8599] shadow-md scale-105"
                                : "border-slate-200 dark:border-slate-600 hover:border-[#0b8599]/50 hover:bg-[#f0fbfd] dark:hover:bg-slate-600"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                active ? "bg-white" : "bg-slate-300 dark:bg-slate-500"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
                      {POSITIONS.find((p) => p.value === settings.position)?.label || "Bottom Right"}
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-auto bg-gradient-to-r from-[#0b8599] to-[#0a7085] text-white py-2.5 rounded-2xl font-bold text-sm tracking-wide hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
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
                    "Save Watermark"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
      <ChangePassword open={open} handleClose={handleClosed} />
    </>
  );
}

export default Account;
