'use client'
import "./Users.css"
import { useState, useEffect } from "react";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [newUser, setNewUser] = useState({
    firstname: "",
    surname: "",
    email: "",
    password: "",
    username: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editUser, setEditUser] = useState(null);

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

  const handleSearchChange = (e) => setQuery(e.target.value);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(query);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

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
        }),
      });

      if (response.ok) {
        const user = await response.json();
        console.log('User added:', user);
        setUsers([...users, user]);

        setNewUser({
          firstname: '',
          surname: '',
          email: '',
          password: '',
          username: '',
        });
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


    try {
      const res = await fetch(`http://localhost:3001/users/${currentUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: editUser.firstname,
          surname: editUser.surname,
          email: editUser.email,
          username: editUser.username,
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map((user) => (user.id === currentUserId ? updatedUser : user)));
        setIsEditing(false);
        setEditUser(null);
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleEditClick = (user) => {
    setEditUser({
      firstname: user.firstname,
      surname: user.surname,
      email: user.email,
      username: user.username
    });
    setIsEditing(true);
    setCurrentUserId(user.id);
  };

  return (
    <div>
      <h1>User List</h1>

      <form onSubmit={handleSearch}>
        <input type="text" value={query} onChange={handleSearchChange} placeholder="Search by email, first name, or surname" />
        <button type="submit">Search</button>
      </form>

      <h2>User List</h2>
      <ul>
        {users.length > 0 ? (
          users.map((user) => (
            <li key={user.id}>
              <div className="user-info">
                <strong>First Name:</strong> {user.firstname} <br />
                <strong>Surname:</strong> {user.surname} <br />
                <strong>Email:</strong> {user.email} <br />
              </div>
              <div className="button-group">
                <button onClick={() => handleEditClick(user)}>Edit</button>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </div>
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
            <input type="text" value={editUser.firstname} onChange={(e) => setEditUser({ ...editUser, firstname: e.target.value })} placeholder="First Name" required />
            <input type="text" value={editUser.surname} onChange={(e) => setEditUser({ ...editUser, surname: e.target.value })} placeholder="Surname" required />
            <input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} placeholder="Email" required />
            <input type="text" value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} placeholder="Username" required />
            <button type="submit">Update User</button>
          </form>
        </div>
      )}

    <h2>Add User</h2>
      <form onSubmit={handleAddUser}>
        <input type="text" value={newUser.firstname} onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })} placeholder="First Name" required />
        <input type="text" value={newUser.surname} onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })} placeholder="Surname" required />
        <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" required />
        <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Password" required />
        <input type="text" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} placeholder="Username" required />
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default UserList;
