import React, { useContext, useState } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const [form, setForm] = useState(user || {});
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/auth/update-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("authToken")
      },
      body: JSON.stringify(form)
    });
    const json = await response.json();
    if (json.success) {
      setUser(json.user);
      alert("Profile updated");
      navigate("/profile");
    }
  };

  return (
    <form className="edit-profile-form" onSubmit={handleSubmit}>
      <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Name" />
      <input name="bio" value={form.bio || ""} onChange={handleChange} placeholder="Bio" />
      <input name="website" value={form.website || ""} onChange={handleChange} placeholder="Website" />
      <input name="location" value={form.location || ""} onChange={handleChange} placeholder="Location" />
      <input name="profilePicture" value={form.profilePicture || ""} onChange={handleChange} placeholder="Profile Picture URL" />
      <input name="bannerImage" value={form.bannerImage || ""} onChange={handleChange} placeholder="Banner Image URL" />
      <select name="role" value={form.role || "student"} onChange={handleChange}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
      <button type="submit">Save</button>
    </form>
  );
};

export default EditProfile;