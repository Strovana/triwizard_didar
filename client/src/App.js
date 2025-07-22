import logo from './Notemoire_logo.png';
import Sidebar from "./Sidebar";
import Feed from "./Feed";
import Widgets from "./Widgets";
import Profile from "./Profile";
import EditProfile from "./EditProfile";
import "./App.css";
import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, UserContext } from "./UserContext";

import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Avatar from 'react-avatar';

<Avatar name="Sociva User" size="100" round={true} />

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

function ProtectedRoute({ children }) {
  const { user } = useContext(UserContext);
  if (!localStorage.getItem("authToken")) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {

  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [currentAccount, setCurrentAccount] = useState('');
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'profile'

  // Add state for showing the edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Sociva User",
    bio: "Building the future of decentralized social media 🚀",
    location: "Metaverse",
    website: "https://sociva.social",
    verified: false,
    joinedDate: "June 2024",
    following: 198,
    followers: 156,
    sivs: 42,
    address: "",
    role: "teacher" // or "student"
  });

    // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Metamask not detected')
        return;
      }
      let chainId = await ethereum.request({ method: 'eth_chainId'})
      console.log('Connected to chain:' + chainId);

      const sepoliaChainId = '0xaa36a7';

      if (chainId !== sepoliaChainId) {
        alert('You are not connected to the Sepolia Testnet!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Found account', accounts[0]);
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log('Error connecting to metamask', error);
    }
  }

  // Checks if wallet is connected to the correct network
  const checkCorrectNetwork = async () => {
    const { ethereum } = window
    let chainId = await ethereum.request({ method: 'eth_chainId' })
    console.log('Connected to chain:' + chainId)

    const sepoliaChainId = '0xaa36a7'

    if (chainId !== sepoliaChainId) {
      setCorrectNetwork(false)
    } else {
      setCorrectNetwork(true)
    }
  }
  
   // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    connectWallet();
    checkCorrectNetwork();
  });

  // Automatically hide welcome screen after 3 seconds
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // Handle navigation between views
  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  // Handler for Edit Profile button
  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  // Handler to close modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  // When wallet connects, update address in profileData
  useEffect(() => {
    if (currentAccount) {
      setProfileData(prev => ({
        ...prev,
        address: currentAccount,
        name: `User ${currentAccount.slice(-4)}`,
      }));
    }
  }, [currentAccount]);

  // Handler for saving profile edits
  const handleSaveProfile = (updatedProfile) => {
    setProfileData(prev => ({
      ...prev,
      ...updatedProfile,
    }));
    setShowEditModal(false);
  };

  // Image upload handler
  const handleImageUpload = async (file, type) => {
    // Example: upload to server or IPFS, then return the URL
    // For now, just use a local preview
    return URL.createObjectURL(file);
  };

  // Render main content based on current view
  const renderMainContent = () => {
    switch(currentView) {
      case 'profile':
        return (
          <>
            <Profile
              onBack={handleBackToHome}
              userAddress={profileData.address}
              editButtonLabel="Edit Profile"
              editButtonStyle={{ backgroundColor: "#bb2b7a", color: "#fff" }}
              onEditProfile={() => setShowEditModal(true)}
              userProfile={profileData}
            />
            {showEditModal && (
              <EditProfileModal
                profile={profileData}
                onSave={handleSaveProfile}
                onClose={handleCloseEditModal}
                onImageUpload={handleImageUpload} // Pass the prop for image upload
              />
            )}
          </>
        );
      case 'home':
      default:
        return <Feed />;
    }
  };

  return (
    <UserProvider>
      <Router>
        <div className="App">
          {showWelcome ? (
            // Welcome Screen
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <div className="welcome-message">
                
                <h1>Just Flick and Click to access your Grimoire</h1>
                {currentAccount && correctNetwork ? null : (
                  <div>
                    <p>Please connect your wallet to continue</p>
                    <button className="connect-wallet-button" onClick={connectWallet}>
                      Connect Wallet
                    </button>
                  </div>
                )}
              </div>
            </header>
          ) : (
            // Main App with Feed
            <div className="app-body fade-in">
              <Sidebar onNavigate={handleNavigation} currentView={currentView} />
              {renderMainContent()}
              <Widgets />
            </div>
          )}
          <Routes>
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            {/* Add login and public profile routes as needed */}
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

function EditProfileModal({ profile, onSave, onClose, onImageUpload }) {
  const [form, setForm] = useState({
    name: profile.name,
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
    role: profile.role || "student",
    profileImage: profile.profileImage || "",
    bannerImage: profile.bannerImage || "",
  });

  // Handle text input changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file uploads
  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Upload logic here (replace with your upload API)
      const uploadedUrl = await onImageUpload(files[0], name); // returns URL
      setForm({ ...form, [name]: uploadedUrl });
    }
  };

  const handleRoleChange = e => {
    setForm({ ...form, role: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="edit-modal">
      <div className="edit-modal-content">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="edit-input"
          />
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Bio"
            className="edit-input"
          />
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="edit-input"
          />
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="Website"
            className="edit-input"
          />

          {/* Profile Picture Upload */}
          <div style={{ margin: "1rem 0" }}>
            <label>Profile Picture:</label>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleFileChange}
              className="edit-input"
            />
            {form.profileImage && (
              <img src={form.profileImage} alt="Profile" style={{ width: 60, height: 60, borderRadius: "50%", marginTop: 8 }} />
            )}
          </div>

          {/* Banner Image Upload */}
          <div style={{ margin: "1rem 0" }}>
            <label>Banner Image:</label>
            <input
              type="file"
              name="bannerImage"
              accept="image/*"
              onChange={handleFileChange}
              className="edit-input"
            />
            {form.bannerImage && (
              <img src={form.bannerImage} alt="Banner" style={{ width: "100%", height: 60, objectFit: "cover", marginTop: 8, borderRadius: 8 }} />
            )}
          </div>

          <div style={{ margin: "1rem 0" }}>
            <label style={{ marginRight: "10px" }}>Role:</label>
            <select
              name="role"
              value={form.role}
              onChange={handleRoleChange}
              className="edit-input"
              style={{ width: "auto", display: "inline-block" }}
            >
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
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