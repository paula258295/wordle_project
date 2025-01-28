"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_URL = "http://localhost:3001";

const AccountPage = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (userId) {
      fetch(`${API_URL}/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error("Error fetching user:", data.error);
          } else {
            setUser(data);
          }
        })
        .catch((error) => console.error("Fetch error:", error));
    }
  }, [userId]);

  if (!user) {
    return <p>Loading user data...</p>;
  }

  return (
    <div>
      <h1>Account Page</h1>
      <p><strong>First Name:</strong> {user.firstName}</p>
      <p><strong>Surname:</strong> {user.surname}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Date of Birth:</strong> {user.dateOfBirth}</p>
    </div>
  );
};

export default AccountPage;
