"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./Header.css";

const API_URL = "http://localhost:3001";

const Header = () => {
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

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      alert("You have been logged out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="header">
      <div className="header-container">
        <div className="logo">
          <h2>Wordle</h2>
        </div>

        <div className="nav-links">
          {user ? (
            <>
              <p className="welcome-text">
                Welcome, <span className="username">{user.username}</span>!
              </p>

              <Link href={`/account?id=${user.id}`}>
                <button className="button account-button">My Account</button>
              </Link>

              {user.firstname.toLowerCase() === "admin" && (
                <>
                <Link href="/admin">
                  <button className="button admin-button">Admin Panel</button>
                </Link>
                <Link href="/words-list">
                  <button className="button admin-button">Manage Words</button>
                </Link>
              </>
              )}
              <Link href="/notes-list">
                  <button className="button notes-button">Notes</button>
              </Link>

              <button className="button logout-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <button className="button signin-button">Sign In</button>
              </Link>

              <Link href="/signup">
                <button className="button signup-button">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;