import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import LoginForm from "../../../login/LoginForm";

function LoginModel({ open, handleClose, opensignup }) {
  const navigate = useNavigate();

  const handlesignup = () => {
    handleClose();
    navigate("/register");
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "92%", sm: 420 },
        outline: "none",
      }}>
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#0b8599] to-[#0a7085] px-6 pt-6 pb-10">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <CloseIcon sx={{ fontSize: 16, color: "#fff" }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <LoginOutlinedIcon sx={{ fontSize: 22, color: "#fff" }} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Welcome Back</h2>
                <p className="text-white/70 text-xs mt-0.5">Sign in to your FotoAlpha account</p>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="px-6 pb-2 -mt-5">
            <LoginForm handleClose={handleClose} />
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-center gap-2 mt-1">
            <span className="text-xs text-slate-400">Don't have an account?</span>
            <button
              onClick={handlesignup}
              className="flex items-center gap-1 text-xs font-bold text-[#0b8599] hover:text-[#086a7a] transition-colors"
            >
              <PersonAddOutlinedIcon sx={{ fontSize: 13 }} />
              Create New Account
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default LoginModel;
