"use client";

import { useEffect, useState } from "react";

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
    <div>
      <h1>Account Page</h1>
      <p><strong>First Name:</strong> {user.firstname}</p>
      <p><strong>Surname:</strong> {user.surname}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Date of Birth:</strong> {new Date(user.dateofbirth).toISOString().split('T')[0]}</p>
    </div>
  );
};

export default AccountPage;
