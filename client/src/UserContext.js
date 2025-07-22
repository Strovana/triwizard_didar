import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(localStorage.getItem("walletAddress") || null);

  return (
    <UserContext.Provider value={{ user, setUser, walletAddress, setWalletAddress }}>
      {children}
    </UserContext.Provider>
  );
};