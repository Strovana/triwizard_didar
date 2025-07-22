import React, { useContext } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";

function shortWallet(address) {
  if (!address) return "Anonymous";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const Profile = () => {
  const { user, walletAddress } = useContext(UserContext);
  const navigate = useNavigate();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-card">
      <img src={user.bannerImage} className="banner" alt="Banner" />
      <img src={user.profilePicture} className="profile-pic" alt="Profile" />
      <h2>{user.name}</h2>
      <p>@{shortWallet(walletAddress)}</p>
      <p>{user.bio}</p>
      <a href={user.website} target="_blank" rel="noopener noreferrer">{user.website}</a>
      <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
    </div>
  );
};

export default Profile;