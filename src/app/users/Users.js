'use client'

import React, { useEffect, useState } from "react";
import "./Users.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [newUser, setNewUser] = useState({
    firstname: '',
    surname: '',
    email: '',
    password: '',
    username: '',
    dateofbirth: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchUsers = async (searchQuery = "") => {
    const url = searchQuery
      ? `http://localhost:3001/users/search/${searchQuery}`
      : "http://localhost:3001/users";

    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(query);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    const formattedDate = new Date(newUser.dateofbirth).toISOString().split('T')[0];

    try {
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: newUser.firstname,
          surname: newUser.surname,
          email: newUser.email,
          password: newUser.password,
          username: newUser.username,
          dateOfBirth: formattedDate,
        }),
      });

      if (response.ok) {
        const user = await response.json();
        console.log('User added:', user);
        setUsers([...users, user]);
      } else {
        console.error('Failed to add user');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await fetch(`http://localhost:3001/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setUsers(users.filter((user) => user.id !== userId));
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();

    const formattedDate = new Date(newUser.dateofbirth).toISOString().split('T')[0];

    try {
      const res = await fetch(`http://localhost:3001/users/${currentUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: newUser.firstname, 
          surname: newUser.surname,
          email: newUser.email,
          username: newUser.username,
          dateofbirth: formattedDate,
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map((user) => (user.id === currentUserId ? updatedUser : user)));
        setIsEditing(false);
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleEditClick = (user) => {
    setNewUser({ 
      firstname: user.firstname, 
      surname: user.surname, 
      email: user.email,
      username: user.username,
      dateofbirth: user.dateofbirth || '',
    });
    setIsEditing(true);
    setCurrentUserId(user.id);
  };

  return (
    <div>
      <h1>User List</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="Search by email, first name, or surname"
        />
        <button type="submit">Search</button>
      </form>

      <form onSubmit={handleAddUser}>
        <input
          type="text"
          value={newUser.firstname || ''}
          onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          value={newUser.surname || ''}
          onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })}
          placeholder="Surname"
          required
        />
        <input
          type="email"
          value={newUser.email || ''}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={newUser.password || ''}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          placeholder="Password"
          required
        />
        <input
          type="text"
          value={newUser.username || ''}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          placeholder="Username"
          required
        />
        <input
          type="date"
          value={newUser.dateofbirth || ''}
          onChange={(e) => setNewUser({ ...newUser, dateofbirth: e.target.value })}
          placeholder="Date of Birth"
          required
        />
        <button type="submit">Add User</button>
      </form>

      <ul>
        {users.length > 0 ? (
          users.map((user) => (
            <li key={user.id}>
              {user.firstname} {user.surname} - {user.email} - {user.dateofbirth}

              <button onClick={() => handleEditClick(user)}>Edit</button>
              <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
            </li>
          ))
        ) : (
          <p>No users found</p>
        )}
      </ul>

      {isEditing && (
        <div>
          <h2>Edit User</h2>
          <form onSubmit={handleEditUser}>
            <input
              type="text"
              value={newUser.firstname || ''}
              onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })}
              placeholder="First Name"
              required
            />
            <input
              type="text"
              value={newUser.surname || ''}
              onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })}
              placeholder="Surname"
              required
            />
            <input
              type="email"
              value={newUser.email || ''}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Email"
              required
            />
            <input
              type="text"
              value={newUser.username || ''}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Username"
              required
            />
            <input
              type="date"
              value={newUser.dateofbirth || ''}
              onChange={(e) => setNewUser({ ...newUser, dateofbirth: e.target.value })}
              placeholder="Date of Birth"
              required
            />
            <button type="submit">Update User</button>
          </form>
        </div>
      )}

    </div>
  );
};

export default UserList;
