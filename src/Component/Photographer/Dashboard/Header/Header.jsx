import React, { useState, useEffect, useContext } from "react";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import {
  Avatar,
  Box,
  Divider,
  Menu,
  MenuItem,
  Modal,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import SwitchAccountOutlinedIcon from "@mui/icons-material/SwitchAccountOutlined";
import LoginModel from "./LoginModel";
import SignupModel from "./SignupModel";
import VerifyModel from "./VerifyModel";
import Notification from "./Notification";
import axios from "axios";
import { PhotographerEventContext } from "../../Context/PhotographerEventContext";
import {
  fetchCurrentSubscription,
  getSubscriptionStatus,
} from "../../../../services/subscriptionService";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { format } from "date-fns";
import logo from "../../../image/bg-removed.png";
import PrintIcon from "@mui/icons-material/Print";

const baseURL = import.meta.env.VITE_BASE_URL;
function Header() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem("users")) || []);
  const currentUser = users.find((u) => u.isCurrent);
  const otherUsers = users.filter((u) => u._id !== currentUser?._id);
  const [anchorEl, setAnchorEl] = useState(null);
  const [accountEl, setAccountEl] = useState(null);
  const opend = Boolean(accountEl);
  const [opendialog, setOpendialog] = useState(false);
  const [openlogin, setOpenlogin] = useState(false);
  const handleOpenlogin = () => setOpenlogin(true);
  const handleClosedlogin = () => setOpenlogin(false);
  const [opensignup, setOpensignup] = useState(false);
  const handleOpensignup = () => setOpensignup(true);
  const handleClosedsignup = () => setOpensignup(false);
  const [openveify, setOpenverify] = useState(false);
  const handleOpenverify = () => setOpenverify(true);
  const handleClosedverify = () => setOpenverify(false);
  const [showUpgrade, setUpgrade] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [coinBalance, setCoinBalance] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  // console.log("user:", users);
  const avatar = localStorage.getItem("avatar");
  const [profile, setProfileurl] = useState();
  const { setProfile, setCoinsglobal, coinsglobal } = useContext(PhotographerEventContext);

  // Fetch subscription from UserSubscription collection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoadingSubscription(true);
      fetchCurrentSubscription(token).then((sub) => {
        // console.log("sub",sub)
        if (sub) {
          setSubscription(sub);
          // const { statusMessage, showUpgradeButton } = getSubscriptionStatus(sub);
          // console.log(sub?.data?.data?.trial_end);
          setStatusMessage(sub?.data?.data?.trial_end || statusMessage);
          setUpgrade(sub?.data?.data?.in_trial);
        } else {
          // No subscription found, show upgrade button
          setUpgrade(true);
          setStatusMessage("");
        }
        setLoadingSubscription(false);
      });
    }
  }, []);

  // Fetch coin balance
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${baseURL}/coins/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.success) {
            setCoinBalance(res.data.data.availableCoins || 0);
            setCoinsglobal(res.data.data.availableCoins || 0)
          }
        })
        .catch((err) => {
          console.error("Error fetching coin balance:", err);
        });
    }
  }, []);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleadd = () => {
    handleClosed();
    setTimeout(() => {
      handleClickOpen();
    }, 200);
  };

  const handleClickd = (event) => {
    setAccountEl(event.currentTarget);
  };

  const handleClosed = () => {
    setAccountEl(null);
  };

  const handleClickOpen = () => {
    setOpendialog(true);
  };

  const handleClosedialog = (value) => {
    setOpendialog(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Re-sync users state from localStorage whenever the login modal closes.
  // LoginForm writes the new user to localStorage before calling handleClose(),
  // so by the time openlogin becomes false the data is already there.
  useEffect(() => {
    if (!openlogin) {
      setUsers(JSON.parse(localStorage.getItem("users")) || []);
    }
  }, [openlogin]);

  const fetchEvents = async () => {
    axios
      .get(`${baseURL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
      })
      .then((response) => {
        setProfileurl(response.data.avatarUrl);
        localStorage.setItem("avatar", response?.data?.avatarUrl);
        setProfile(response.data);
        // console.log(response.data);
      })
      .catch((error) => {
        console.log(error);

        if (
          error?.response?.status === 401 ||
          error?.response?.data?.message ===
            "The user belonging to this token no longer exists."
        ) {
          // Clear stored auth data
          localStorage.clear();

          // Redirect to login
          window.location.hash = "/";
        }
      });
  };

  // const handleLogout = () => {
  //   let users = JSON.parse(localStorage.getItem("users")) || [];
  //   // Find current user by isCurrent flag
  //   const currentUser = users.find((u) => u.isCurrent);
  //   if (!currentUser) {
  //     // No current user found — maybe already logged out
  //     navigate("/");
  //     return;
  //   }
  //   // Remove current user from array
  //   users = users.filter((u) => u._id !== currentUser._id);
  //   // Update users array and remove token data
  //   localStorage.setItem("users", JSON.stringify(users));
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("avatar");

  //   if (users.length > 0) {
  //     // Set the next user as current
  //     users[0].isCurrent = true;
  //     localStorage.setItem("users", JSON.stringify(users));
  //     localStorage.setItem("token", users[0].token);
  //     localStorage.setItem("avatar", users[0].avatar);
  //     navigate("/"); // or redirect based on role of users[0]
  //   } else {
  //     // No users left, go to login
  //     navigate("/");
  //   }
  // };

  const handleLogout = () => {
    handleClose();
    handleClosed();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = users.find((u) => u.isCurrent);
    if (!currentUser) { navigate("/"); return; }
    users = users.filter((u) => u._id !== currentUser._id);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.removeItem("token");
    localStorage.removeItem("avatar");
    if (users.length > 0) {
      users[0].isCurrent = true;
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("token", users[0].token);
      localStorage.setItem("avatar", users[0].avatar);
    }
    navigate("/");
  };

  const handleExisting = () => {
    handleClosed();
    handleClosedialog();
    handleOpenlogin();
  };

  const handleNew = () => {
    navigate("/register");
  };

  const handleAccount = () => {
    navigate("profile");
    handleClosed();
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSwitch = (userId) => {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    users = users.map((u) => ({
      ...u,
      isCurrent: u._id === userId, // Set only one user as current
    }));

    const selected = users.find((u) => u._id === userId);

    if (selected) {
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("token", selected.token);
      localStorage.setItem("refreshToken", selected.refreshToken);
      localStorage.setItem("avatar", selected.avatar);
      setUsers(users);
    }

    const role = selected.role.name;

    const paths = {
      photographer: "/photographer/dashboard",
      guest: "/guest/my_events",
      superadmin: "/superadmin/dashboard",
      "photographer-team": "/photographer_team/dashboard",
      admin_support: "/admin_support/dashboard",
      organization: "/organization/dashboard",
    };
    const targetPath = paths[role] || "/";

    // Same-URL: window.location.href is a no-op in most browsers, so use reload().
    // Different URL: href triggers a full navigation naturally.
    if (window.location.pathname === targetPath) {
      window.location.reload();
    } else {
      window.location.href = targetPath;
    }
  };

  return (
    <>
      <div className=" title flex ms-2 lg:hidden justify-center gap-2 items-center border-solid border-b-2 border-slate-100 dark:border-slate-800 py-1 dark:text-white">
        <img
          src={logo}
          alt="logo"
          className="w-[40px] lg:w-[50px]"
          onClick={() => {
            navigate("dashboard");
          }}
        />
      </div>
      <div className="flex justify-end items-center p-1 light:bg-white w-webkit-fill-available">
        <div className="flex justify-between items-center space-x-3 me-3 dark:text-white">
          {/* Coins Display */}
          <div
            className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-lg cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition"
            onClick={() => navigate("coins")}
            title="View coins details"
          >
            <LocalFireDepartmentIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
              {coinsglobal }
            </span>
          </div>

          {showUpgrade === true && (
            <div className="upgrade flex items-center gap-2">
              {statusMessage && (
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium hidden md:block">
                  {/* {statusMessage} */}
                  Trial end on {format(new Date(statusMessage), "MMM dd, yyyy")}
                </span>
              )}

              <button
                className="flex items-center bg-blue text-white text-xs py-1 px-2 font-normal rounded hidden md:block hover:bg-blueHover"
                onClick={() => navigate("upgrade_plan")}
              >
                Upgrade Plan
              </button>
            </div>
          )}

          <Notification />

          {/* <BedtimeIcon
            sx={{ fontSize: "22px" }}
            className="cursor-pointer"
            onClick={() => setDarkMode(!darkMode)}
          /> */}
          <div className="flex flex-col">
            <div
              className="flex items-center cursor-pointer gap-2"
              aria-controls={opend ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={opend ? "true" : undefined}
              onClick={handleClickd}
            >
              <Avatar
                src={profile || currentUser?.avatar || avatar || "/broken-image.jpg"}
                sx={{ width: 32, height: 32 }}
              />
              <h3 className="text-slate-700 font-semibold dark:text-white capitalize max-w-24 truncate text-sm hidden sm:block">
                {currentUser?.name}
              </h3>
              <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="dark:text-white text-slate-500" />
            </div>

            <Menu
              id="account-menu"
              anchorEl={accountEl}
              open={opend}
              onClose={handleClosed}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                elevation: 0,
                sx: {
                  borderRadius: "16px",
                  minWidth: 280,
                  overflow: "hidden",
                  filter: "drop-shadow(0px 8px 32px rgba(0,0,0,0.13))",
                  mt: 1,
                  border: "1px solid #f1f5f9",
                },
              }}
            >
              {/* Current account header */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={profile || currentUser?.avatar || avatar || "/broken-image.jpg"}
                    sx={{ width: 46, height: 46 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-bold text-sm truncate">{currentUser?.name}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#e6f8fb] text-[#0b8599] capitalize">
                      {currentUser?.role?.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleAccount}
                  className="mt-3 w-full text-center text-xs font-semibold text-[#0b8599] hover:text-[#086a7a] bg-[#f0fbfd] hover:bg-[#e0f7fa] rounded-xl py-2 transition-colors"
                >
                  Manage your account
                </button>
              </div>

              {/* Other accounts */}
              {otherUsers.length > 0 && (
                <>
                  <div className="h-px bg-slate-100 mx-3" />
                  <div className="px-3 pt-3 pb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Switch account</p>
                    {otherUsers.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => { handleSwitch(user._id); handleClosed(); }}
                        className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <Avatar src={user?.avatar || "/broken-image.jpg"} sx={{ width: 38, height: 38 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-700 font-semibold text-sm truncate">{user?.name}</p>
                          <p className="text-[11px] text-slate-400 capitalize">{user?.role?.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="h-px bg-slate-100 mx-3" />

              {/* Add account */}
              <div
                onClick={handleadd}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center flex-shrink-0">
                  <AddCircleOutlineIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                </div>
                <p className="text-slate-600 text-sm font-medium">Add another account</p>
              </div>

              <div className="h-px bg-slate-100 mx-3" />

              {/* Settings + Sign out */}
              <div className="p-2">
                <div
                  onClick={handleAccount}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <SettingsIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  <p className="text-slate-600 text-sm font-medium">Profile Settings</p>
                </div>
                <div
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <ExitToAppIcon sx={{ fontSize: 18, color: "#ef4444" }} />
                  <p className="text-red-500 text-sm font-medium">Sign out</p>
                </div>
              </div>
            </Menu>
          </div>
          <Modal open={opendialog} onClose={handleClosedialog}>
            <Box sx={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 420 },
              outline: "none",
            }}>
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">

                {/* Close */}
                <button
                  onClick={handleClosedialog}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors z-10"
                >
                  <CloseIcon sx={{ fontSize: 15 }} className="text-slate-500 dark:text-slate-300" />
                </button>

                {/* Top section */}
                <div className="pt-8 pb-6 px-6 flex flex-col items-center text-center">
                  {/* Animated ring icon */}
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-full bg-[#e6f8fb] dark:bg-[#0b8599]/20 flex items-center justify-center">
                      <SwitchAccountOutlinedIcon sx={{ fontSize: 28, color: "#0b8599" }} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0b8599] rounded-full flex items-center justify-center shadow">
                      <AddCircleOutlineIcon sx={{ fontSize: 12, color: "#fff" }} />
                    </span>
                  </div>
                  <h2 className="text-slate-800 dark:text-white font-bold text-xl">Add Account</h2>
                  <p className="text-slate-400 text-xs mt-1 max-w-[220px] leading-relaxed">
                    Choose how you'd like to add another FotoAlpha account
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 dark:bg-slate-700 mx-6" />

                {/* Two choice cards */}
                <div className="p-5 grid grid-cols-2 gap-3">

                  {/* Log in */}
                  <button
                    onClick={handleExisting}
                    className="group flex flex-col items-center text-center gap-3 rounded-2xl p-5 border-2 border-[#0b8599]/20 bg-[#f0fbfd] dark:bg-[#0b8599]/10 hover:border-[#0b8599] hover:bg-[#e0f7fa] dark:hover:bg-[#0b8599]/20 hover:-translate-y-1 active:scale-95 transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0b8599] to-[#0a7085] flex items-center justify-center shadow-lg shadow-[#0b8599]/30 group-hover:shadow-[#0b8599]/50 transition-shadow">
                      <LoginOutlinedIcon sx={{ fontSize: 22, color: "#fff" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0b8599] dark:text-[#4dd6ea] leading-tight">Log In</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Sign in to an existing account</p>
                    </div>
                  </button>

                  {/* Create new */}
                  <button
                    onClick={handleNew}
                    className="group flex flex-col items-center text-center gap-3 rounded-2xl p-5 border-2 border-violet-200 dark:border-violet-700/50 bg-violet-50 dark:bg-violet-900/10 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:-translate-y-1 active:scale-95 transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-400/30 group-hover:shadow-violet-400/50 transition-shadow">
                      <PersonAddOutlinedIcon sx={{ fontSize: 22, color: "#fff" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-violet-600 dark:text-violet-400 leading-tight">Register</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Create a brand new account</p>
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 pb-5">
                  www.fotoalpha.com
                </p>
              </div>
            </Box>
          </Modal>
          {/* <Avatar
            src={profile || users?.avatar || avatar || "/broken-image.jpg"}
            id="demo-positioned-button"
            aria-controls={open ? "demo-positioned-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            sx={{ width: 22, height: 22 }}
            className="cursor-pointer"
          /> */}
          {/* <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            className="mt-9"
          >
            <MenuItem onClick={handleAccount}>
              <SettingsIcon sx={{ fontSize: "18px" }} />
              &nbsp; Profile Setting
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToAppIcon sx={{ fontSize: "18px" }} /> &nbsp;Signout
            </MenuItem>
          </Menu> */}
        </div>
      </div>
      <LoginModel
        open={openlogin}
        handleClose={handleClosedlogin}
        opensignup={handleOpensignup}
      />
      <SignupModel
        open={opensignup}
        handleClose={handleClosedsignup}
        openlogin={handleOpenlogin}
        openverify={handleOpenverify}
        closeSignup={handleClosedsignup}
      />
      <VerifyModel open={openveify} handleClose={handleClosedverify} />

      {/* Logout confirmation modal */}
      <Modal open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "88%", sm: 360 },
          outline: "none",
        }}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
            {/* Icon header */}
            <div className="flex flex-col items-center pt-8 pb-5 px-6">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <ExitToAppIcon sx={{ fontSize: 30, color: "#ef4444" }} />
              </div>
              <h2 className="text-slate-800 dark:text-white font-bold text-lg text-center">Sign out?</h2>
              <p className="text-slate-400 text-xs text-center mt-1.5 leading-relaxed max-w-[220px]">
                You'll be signed out of your current FotoAlpha account.
              </p>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-700 mx-5" />

            {/* Actions */}
            <div className="flex gap-3 p-5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 text-white text-sm font-bold transition-all shadow-lg shadow-red-500/25"
              >
                Sign out
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
}

export default Header;
