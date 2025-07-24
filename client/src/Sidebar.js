import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import SidebarOption from "./SidebarOption";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import CreateIcon from "@mui/icons-material/Create";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import Collapse from "@mui/material/Collapse";
import logo from "./Notemoire_logo.png";

function Sidebar({ onNavigate, currentView }) {
  const [activeItem, setActiveItem] = useState("Home");
  const [showMore, setShowMore] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [messages, setMessages] = useState(7);
  const [userStats, setUserStats] = useState({
    sivs: 42,
    following: 198,
    followers: 156
  });

  // Sync active item with current view
  useEffect(() => {
    if (currentView === 'home') {
      setActiveItem('Home');
    } else if (currentView === 'profile') {
      setActiveItem('Profile');
    }
  }, [currentView]);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update notification count
      if (Math.random() > 0.8) {
        setNotifications(prev => prev + 1);
      }
      // Randomly update message count
      if (Math.random() > 0.9) {
        setMessages(prev => prev + 1);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (item) => {
    setActiveItem(item);

    // Handle different navigation actions
    switch (item) {
      case "Home":
        console.log("Navigating to Home feed");
        if (onNavigate) onNavigate('home');
        // Focus the compose box when clicking home
        setTimeout(() => {
          const sivBox = document.querySelector('.sivBox__input input');
          if (sivBox) sivBox.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;
      case "Explore":
        console.log("Opening Explore page");
        alert("🧙‍♂️ The 'Explore' charm is still being brewed deep within the dungeons. This feature will be added in a future update.");
        break;

      case "Notifications":
        console.log("Opening Notifications");
        alert("📨 The Owl Post is currently off duty. Notifications will be delivered magically in a future update.");
        setNotifications(0);
        break;

      case "Messages":
        console.log("Opening Messages");
        alert("🦉 Your enchanted messages are still traveling through the Floo Network. This feature will be available in a future update.");
        setMessages(0);
        break;

      case "Bookmarks":
        console.log("Opening Bookmarks");
        alert("🔖 The Bookmarks are still hidden in the Restricted Section. They shall be unlocked in a future update.");
        break;

      case "Lists":
        console.log("Opening Lists");
        alert("📜 The Lists Ledger is still being transcribed by magical quills. This feature will be introduced in a future update.");
        break;

      case "Settings":
        console.log("Opening Settings");
        alert("⚙️ The Room of Requirement hasn’t revealed your Settings yet. They will be accessible in a future update.");
        break;

      case "Help":
        console.log("Opening Help");
        alert("❓ The enchanted Help Scrolls are still being prepared. Assistance will be available in a future update.");
        break;

      case "Profile":
        console.log("Opening Profile");
        if (onNavigate) {
          onNavigate('profile');
        } else {
          alert(`👤 Your Profile: ${userStats.sivs} Sivs, ${userStats.followers} Followers, ${userStats.following} Following`);
        }
        break;
      case "Settings":
        console.log("Opening Settings");
        alert("⚙️ Opening account settings...");
        break;
      case "Help":
        console.log("Opening Help");
        alert("❓ Need help? Check our documentation!");
        break;
      case "Logout":
        console.log("Logging out");
        if (window.confirm("Are you sure you want to logout?")) {
          alert("👋 Logged out successfully!");
          // In a real app, this would clear auth state
          window.location.reload();
        }
        break;
      default:
        break;
    }
  };

  const handleMoreClick = () => {
    setShowMore(!showMore);
  };

  const handleSivClick = () => {
    console.log("Opening Siv composer");
    // In a real app, this would open a compose modal or focus the SivBox
    document.querySelector('.sivBox__input input')?.focus();
  };

  return (
    <div className="sidebar">
      <img src={logo} className="sidebar__logo" alt="Sociva Logo" />

      <div className="sidebar__navigation">
        <SidebarOption
          Icon={HomeIcon}
          text="Home"
          active={activeItem === "Home"}
          onClick={() => handleNavigation("Home")}
        />

        <SidebarOption
          Icon={SearchIcon}
          text="Explore"
          active={activeItem === "Explore"}
          onClick={() => handleNavigation("Explore")}
        />

        <SidebarOption
          Icon={notifications > 0 ? NotificationsIcon : NotificationsNoneIcon}
          text="Notifications"
          active={activeItem === "Notifications"}
          badge={notifications}
          onClick={() => handleNavigation("Notifications")}
        />

        <SidebarOption
          Icon={MailOutlineIcon}
          text="Messages"
          active={activeItem === "Messages"}
          badge={messages}
          onClick={() => handleNavigation("Messages")}
        />

        <SidebarOption
          Icon={BookmarkBorderIcon}
          text="Bookmarks"
          active={activeItem === "Bookmarks"}
          onClick={() => handleNavigation("Bookmarks")}
        />

        <SidebarOption
          Icon={ListAltIcon}
          text="Lists"
          active={activeItem === "Lists"}
          onClick={() => handleNavigation("Lists")}
        />

        <SidebarOption
          Icon={PermIdentityIcon}
          text="Profile"
          active={activeItem === "Profile"}
          onClick={() => handleNavigation("Profile")}
        />

        <SidebarOption
          Icon={MoreHorizIcon}
          text="More"
          active={showMore}
          onClick={handleMoreClick}
        />

        {/* Collapsible More Options */}
        <Collapse in={showMore} timeout="auto" unmountOnExit>
          <div className="sidebar__moreOptions">
            <SidebarOption
              Icon={SettingsIcon}
              text="Settings"
              active={activeItem === "Settings"}
              onClick={() => handleNavigation("Settings")}
              nested
            />
            <SidebarOption
              Icon={HelpOutlineIcon}
              text="Help Center"
              active={activeItem === "Help"}
              onClick={() => handleNavigation("Help")}
              nested
            />
            <SidebarOption
              Icon={LogoutIcon}
              text="Logout"
              onClick={() => handleNavigation("Logout")}
              nested
            />
          </div>
        </Collapse>
      </div>

      {/* User Stats */}
      <div className="sidebar__userStats">
        <div className="sidebar__stat" onClick={() => handleNavigation("Profile")}>
          <span className="sidebar__statNumber">{userStats.sivs}</span>
          <span className="sidebar__statLabel">Sivs</span>
        </div>
        <div className="sidebar__stat" onClick={() => alert(`Following ${userStats.following} accounts`)}>
          <span className="sidebar__statNumber">{userStats.following}</span>
          <span className="sidebar__statLabel">Following</span>
        </div>
        <div className="sidebar__stat" onClick={() => alert(`${userStats.followers} followers`)}>
          <span className="sidebar__statNumber">{userStats.followers}</span>
          <span className="sidebar__statLabel">Followers</span>
        </div>
      </div>

      {/* Siv Button */}
      <Button
        className="sidebar__siv"
        variant="contained"
        disableElevation
        onClick={handleSivClick}
        startIcon={<CreateIcon />}
      >
        Siv
      </Button>
    </div>
  );

}

export default Sidebar;