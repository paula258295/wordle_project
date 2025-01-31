'use client'

import React from "react";
import { useRouter } from "next/router";

const Admin = () => {
  const router = useRouter();

  const handleViewUsers = () => {
    router.push("/users");
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={handleViewUsers}>View All Users</button>
    </div>
  );
};

export default Admin;
