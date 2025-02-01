"use client";

import { useEffect, useState } from "react";
import "./AccountPage.css"

const API_URL = "http://localhost:3001";

const AccountPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/current-user`, {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <p>Loading user data...</p>;

  return (
    <div className="account-container">
      <h1 className="account-title">Account Page</h1>
      <div className="account-details">
        <div className="account-info">
          <p><strong>First Name:</strong> {user.firstname}</p>
          <p><strong>Surname:</strong> {user.surname}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Date of Birth:</strong> {new Date(user.dateofbirth).toISOString().split('T')[0]}</p>
        </div>
      </div>
      <div className="account-actions">
        <a href="/edit-profile">
          <button className="button edit-button">Edit Profile</button>
        </a>
        <button className="button back-button" onClick={() => window.history.back()}>
          Back
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
