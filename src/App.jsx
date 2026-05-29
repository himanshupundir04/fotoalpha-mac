import "./App.css";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error?.response?.status;
//     if (status === 401 || status === 403) {
//       const users = JSON.parse(localStorage.getItem("users") || "[]");
//       const currentUser = users.find((u) => u.isCurrent);
//       if (currentUser) {
//         const remaining = users.filter((u) => u._id !== currentUser._id);
//         localStorage.setItem("users", JSON.stringify(remaining));
//       }
//       localStorage.removeItem("token");
//       localStorage.removeItem("avatar");
//       toast.error("You have been logged out. Please sign in again.", {
//         toastId: "auth-expired",
//       });
//       window.location.hash = "/";
//     }
//     return Promise.reject(error);
//   }
// );

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = error.config?.url || "";
      // Don't redirect for OTP verification - wrong OTP should show an error message, not log out
      if (url.includes("/verify-login-otp")) {
        return Promise.reject(error);
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("users");
      localStorage.removeItem("avatar");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

import Login from "./Component/login/Login";
import Register from "./Component/Register/Register";
import Verify from "./Component/Register/Verify/Verify";

//Photographer
import CreatePortfolio from "./Component/Photographer/CreatePortfolio";
import PhotographerLayout from "./Component/Photographer/PhotographerLayout";
import PhotographerMain from "./Component/Photographer/Dashboard/Main/Main";
import Portfolio from "./Component/Photographer/Portfolio/Portfolio";
import ViewPhotos from "./Component/Photographer/Portfolio/ViewPhotos";
import EventsCategory from "./Component/Photographer/Events/EventsCategory";
import CreateEvents from "./Component/Photographer/Events/CreateEvents";
import EditEvents from "./Component/Photographer/Events/EditEvents";
import PhotographerEvents from "./Component/Photographer/Events/Event";
import PhotographerSingleEvent from "./Component/Photographer/Events/SingleEvent";
import SubEventPhotos from "./Component/Photographer/Events/SubEventPhotos";
import PhotographerAccount from "./Component/Photographer/Myaccount/Account";
import Publicview from "./Component/Photographer/Portfolio/Publicview";
import Calendar from "./Component/Photographer/Calendar/Calendar";
import PaymentManagement from "./Component/Photographer/Events/PaymentManagement";
import Settings from "./Component/Photographer/Settings/Settings";
import SyncPhotos from "./Component/Photographer/Events/SyncPhotos";
import Album from "./Component/Photographer/Album/Album";
import ManageTeam from "./Component/Photographer/Events/ManageTeam";
import Team from "./Component/Photographer/Team/Team";
import Search from "./Component/Photographer/Dashboard/Search/Search";
import Billing from "./Component/Photographer/Billing/Billing"
import CoinsPage from "./Component/Photographer/Coins/CoinsPage";
import ReferralDashboard from "./Component/Photographer/Referrals/ReferralDashboard";
import Feedback from "./Component/Photographer/Feedback/Feedback";
import PrintOrders from "./Component/Photographer/PrintOrders/Orders"


//Photographer-Team
import PhotographerTeamLayout from "./Component/PhotographerTeam/PhotographerTeamLayout";
import PhotographerTeamMain from "./Component/PhotographerTeam/Dashboard/Main/Main";
import PhotographerTeamEvents from "./Component/PhotographerTeam/Events/Event";
import PhotographerTeamSingleEvent from "./Component/PhotographerTeam/Events/SingleEvent";
import PhotographerTeamAccount from "./Component/PhotographerTeam/Myaccount/Account";
import PhotographerTeamCalendar from "./Component/PhotographerTeam/Calendar/Calendar";
import PhotographerTeamSettings from "./Component/PhotographerTeam/Settings/Settings";
import PhotographerPhotos from "./Component/PhotographerTeam/Events/Photos";
import PhotographerTeamSyncPhotos from "./Component/PhotographerTeam/Events/SyncPhotos";
import UploadPhotos from "./Component/Photographer/UploadPhotos/UploadPhotos";
import Events from "./Component/Photographer/UploadPhotos/Events";
import SubCategory from "./Component/Photographer/UploadPhotos/SubCategory";
import Albumimg from "./Component/Photographer/Album/Albumimg";
import Searchteam from "./Component/PhotographerTeam/Dashboard/Search/Search";
import UpgradePlan from "./Component/Photographer/Dashboard/UpgradePlan/UpgradePlan";
import EventLists from "./Component/Photographer/Events/EventLists";
import CreateEvent from "./Component/Photographer/UploadPhotos/CreateEvent";
import NotFound from "./Component/login/NotFound";
import PhotoVideo from "./Component/Photographer/Events/PhotoVideo";
import { useEffect } from "react";
import { desktopUploadService } from "./services/desktopUploadService";
import ActiveWatchers from "./Component/Common/ActiveWatchers";

function App() {
  useEffect(() => {
    desktopUploadService.init();
    desktopUploadService.resumePendingUploads();
  }, []);
  const router = createHashRouter([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
    {
      index: true,
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/register/verify",
      element: <Verify />,
    },
    {
      path: "create_portfolio",
      element: <CreatePortfolio />,
    },
    {
      path: "/photographer",
      element: (
        <PhotographerLayout />
      ),
      children: [
        {
          index: true,
          element: <PhotographerMain />,
        },
        {
          path: "dashboard",
          element: <PhotographerMain />,
        },
        {
          path: "search/:name",
          element: <Search />,
        },
        {
          path: "public_portfolio",
          element: <Publicview />,
        },
        {
          path: "manage_portfolio",
          element: <Portfolio />,
        },
        {
          path: "add_portfolio/view-photos/:name/:id",
          element: <ViewPhotos />,
        },
        {
          path: "events_category",
          element: <EventsCategory />,
        },
        {
          path: "events_category/:id",
          element: <PhotographerEvents />,
        },
        {
          path: "events_category/:id/create_event",
          element: <CreateEvents />,
        },
        {
          path: "event/:eventid/edit_event",
          element: <EditEvents />,
        },
        {
          path: "event/:eventid",
          element: <PhotographerSingleEvent />,
        },
        {
          path: "events_list",
          element: <EventLists />,
        },
        {
          path: "create_event",
          element: <CreateEvent />,
        },
        {
          path: "event/:eventId/subevent/:subeventId/sync_photos",
          element: <SyncPhotos />,
        },
        {
          path: "event/:eventId/subevent/:subeventId/photos",
          element: <SubEventPhotos />,
        },
        {
          path: "event/:id/Payment_management",
          element: <PaymentManagement />,
        },
        {
          path: "event/:id/team_management",
          element: <ManageTeam />,
        },
        {
          path: "album",
          element: <Album />,
        },
        {
          path: "album/:id",
          element: <Albumimg />,
        },
        {
          path: "print_orders",
          element: <PrintOrders />,
        },
        {
          path: "team",
          element: <Team />,
        },
        {
          path: "upload_photos",
          element: <UploadPhotos />,
        },
        {
          path: "upload_photos/:id",
          element: <SubCategory />,
        },
        {
          path: "upload_photos/:eventId/subevent/:subeventId/sync_photos",
          element: <SyncPhotos />,
        },
        {
          path: "profile",
          element: <PhotographerAccount />,
        },
        {
          path: "calendar",
          element: <Calendar />,
        },
        {
          path: "feedback",
          element: <Feedback />,
        },
        {
          path: "upgrade_plan",
          element: <UpgradePlan />,
        },
        {
          path: "billing",
          element: <Billing />,
        },
        {
          path: "coins",
          element: <CoinsPage />,
        },
        {
          path: "referrals",
          element: <ReferralDashboard />,
        },
        {
          path: "settings",
          element: <Settings />,
        },
        {
          path: "sync_watchers",
          element: <ActiveWatchers />,
        },
      ],
    },

    {
      path: "/photographer_team",
      element: <PhotographerTeamLayout />,
      children: [
        {
          index: true,
          element: <PhotographerTeamMain />,
        },
        {
          path: "dashboard",
          element: <PhotographerTeamMain />,
        },
        {
          path: "search/:name",
          element: <Searchteam />,
        },
        {
          path: "events",
          element: <PhotographerTeamEvents />,
        },
        {
          path: "event/:id",
          element: <PhotographerTeamSingleEvent />,
        },
        {
          path: "event/:id/subevent/:subid/",
          element: <PhotographerPhotos />,
        },
        {
          path: "event/:eventId/subevent/:subeventId/sync_photos",
          element: <PhotographerTeamSyncPhotos />,
        },
        {
          path: "profile",
          element: <PhotographerTeamAccount />,
        },
        {
          path: "calendar",
          element: <PhotographerTeamCalendar />,
        },
        {
          path: "settings",
          element: <PhotographerTeamSettings />,
        },
      ],
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
      <ToastContainer />
    </div>
  );
}

export default App;
