"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import "./Header.css";

const API_URL = "http://localhost:3001";

const Header = () => {
  const [user, setUser] = useState(null);
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return; 

      try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, [userId]);

  const handleLogout = () => {
    setUser(null);
    router.push("/");
    alert("You have been logged out successfully.");
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