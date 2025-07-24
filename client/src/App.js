import React, { useState, useEffect } from "react";
import logo from './Notemoire_logo.png';
import Sidebar from "./Sidebar";
import Feed from "./Feed";
import Widgets from "./Widgets";
import Profile from "./Profile";
import EditProfile from "./EditProfile";
import "./App.css";

import { BrowserRouter as Router } from "react-router-dom";
import { UserProvider } from "./UserContext";
import axios from "axios";

function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return alert("Metamask not detected");

      const chainId = await ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') {
        alert('Please switch to Sepolia Testnet');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
      console.log("✅ Connected wallet:", accounts[0]);
    } catch (err) {
      console.error("❌ Metamask connection failed:", err);
    }
  };

  const checkCorrectNetwork = async () => {
    const { ethereum } = window;
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    setCorrectNetwork(chainId === '0xaa36a7');
  };

  useEffect(() => {
    connectWallet();
    checkCorrectNetwork();
  }, []);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  useEffect(() => {
    if (!currentAccount) return;

    console.log("🔄 currentAccount changed:", currentAccount);

    const fetchProfile = async () => {
      try {
        console.log("📡 Fetching profile from backend...");
        const response = await axios.post(
          "https://notemore-dashboard.onrender.com/api/auth/wallet-login",
          { walletAddress: currentAccount }
        );

        if (response.data.success && response.data.user) {
          console.log("✅ Backend responded:", response.data);
          localStorage.setItem("authToken", response.data.authToken);
          setProfileData(response.data.user);
        } else {
          console.warn("⚠️ User not found or missing in response, using fallback profile");
          setProfileData({
            name: `User ${currentAccount.slice(-4)}`,
            bio: "",
            location: "",
            website: "",
            verified: false,
            joinedDate: new Date().toISOString().split("T")[0],
            following: 0,
            followers: 0,
            sivs: 0,
            address: currentAccount,
            role: "student",
            profileImage: "",
            bannerImage: ""
          });
        }
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        setProfileData({
          name: `User ${currentAccount.slice(-4)}`,
          bio: "",
          location: "",
          website: "",
          verified: false,
          joinedDate: new Date().toISOString().split("T")[0],
          following: 0,
          followers: 0,
          sivs: 0,
          address: currentAccount,
          role: "student",
          profileImage: "",
          bannerImage: ""
        });
      }
    };

    fetchProfile();
  }, [currentAccount]);

  const handleNavigation = (view) => setCurrentView(view);
  const handleBackToHome = () => setCurrentView('home');
  const handleEditProfile = () => setShowEditModal(true);
  const handleCloseEditModal = () => setShowEditModal(false);

  const handleSaveProfile = async (updatedProfile) => {
    try {
      const payload = {
        walletAddress: profileData?.address || currentAccount,
        name: updatedProfile.name || "",
        profilePicture: updatedProfile.profileImage || "",
        bannerImage: updatedProfile.bannerImage || "",
        bio: updatedProfile.bio || "",
        role: updatedProfile.role || "student",
        location: updatedProfile.location || "",
        website: updatedProfile.website || ""
      };

      console.log("📤 Sending payload to backend:", payload);
      const response = await axios.post(
        "https://notemore-dashboard.onrender.com/api/auth/wallet-login",
        payload
      );

      if (response.data.success && response.data.user) {
        localStorage.setItem("authToken", response.data.authToken);
        setProfileData(response.data.user);
        setShowEditModal(false);
        console.log("✅ Profile updated successfully");
      } else {
        console.error("❌ Profile update failed or user missing:", response.data);
      }
    } catch (error) {
      console.error("❌ Error saving profile:", error);
    }
  };

  const handleImageUpload = async (file, type) => {
    return URL.createObjectURL(file); // Replace with Cloudinary upload later
  };

  const renderMainContent = () => {
    console.log("profileData:", profileData);
    if (!profileData || !profileData.address) {
      return <div style={{ padding: "2rem", color: "gray" }}>Loading profile...</div>;
    }

    switch (currentView) {
      case 'profile':
        return (
          <>
            <Profile
              onBack={handleBackToHome}
              userAddress={profileData.address}
              editButtonLabel="Edit Profile"
              editButtonStyle={{ backgroundColor: "#bb2b7a", color: "#fff" }}
              onEditProfile={handleEditProfile}
              userProfile={profileData}
              setUserProfile={setProfileData}
            />
            {showEditModal && (
              <EditProfileModal
                profile={profileData}
                onSave={handleSaveProfile}
                onClose={handleCloseEditModal}
                onImageUpload={handleImageUpload}
              />
            )}
          </>
        );
      default:
        return <Feed />;
    }
  };

  return (
    <UserProvider>
      <Router>
        <div className="App">
          {showWelcome ? (
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <div className="welcome-message">
                <h1>Just Flick and Click to access your Grimoire</h1>
                {!currentAccount || !correctNetwork ? (
                  <>
                    <p>Please connect your wallet to continue</p>
                    <button className="connect-wallet-button" onClick={connectWallet}>
                      Connect Wallet
                    </button>
                  </>
                ) : null}
              </div>
            </header>
          ) : (
            <div className="app-body fade-in">
              <Sidebar onNavigate={handleNavigation} currentView={currentView} />
              {renderMainContent()}
              <Widgets />
            </div>
          )}
        </div>
      </Router>
    </UserProvider>
  );
}

// === Inline EditProfileModal ===
function EditProfileModal({ profile, onSave, onClose, onImageUpload }) {
  const [form, setForm] = useState({
    name: profile.name || "",
    bio: profile.bio || "",
    location: profile.location || "",
    website: profile.website || "",
    role: profile.role || "student",
    profileImage: profile.profilePicture || "",
    bannerImage: profile.bannerImage || ""
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const uploadedUrl = await onImageUpload(files[0], name);
      setForm((prev) => ({ ...prev, [name]: uploadedUrl }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="edit-modal">
      <div className="edit-modal-content">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <label className="edit-label">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="edit-input" />

          <label className="edit-label">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} className="edit-input" />

          <label className="edit-label">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="edit-input" />

          <label className="edit-label">Website</label>
          <input name="website" value={form.website} onChange={handleChange} className="edit-input" />

          <label className="edit-label">Profile Photo</label>
          <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} className="edit-input" />
          {form.profileImage && <img src={form.profileImage} alt="Profile" style={{ width: 60, height: 60, borderRadius: "50%", marginTop: 8 }} />}

          <label className="edit-label">Banner Image</label>
          <input type="file" name="bannerImage" accept="image/*" onChange={handleFileChange} className="edit-input" />
          {form.bannerImage && <img src={form.bannerImage} alt="Banner" style={{ width: "100%", height: 60, objectFit: "cover", marginTop: 8, borderRadius: 8 }} />}

          <label className="edit-label">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="edit-input">
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>

          <div style={{ marginTop: "1rem" }}>
            <button type="submit" className="edit-save-btn">Save</button>
            <button type="button" onClick={onClose} className="edit-cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;