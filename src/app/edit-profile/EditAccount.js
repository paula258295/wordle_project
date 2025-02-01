'use client'

import React, { useEffect, useState } from "react";

const ProfileUpdate = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        firstname: "",
        surname: "",
        dateofbirth: "",
        username: "",
        email: "",
        profile_description: ""
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:3001/current-user", { credentials: "include" });
                if (!res.ok) throw new Error("Failed to fetch user");
                const data = await res.json();
                setUser(data);
                const formattedDate = new Date(data.dateofbirth).toISOString().split('T')[0];
                setFormData({
                    firstname: data.firstname,
                    surname: data.surname,
                    dateofbirth: formattedDate,
                    username: data.username,
                    email: data.email,
                    profile_description: data.profile_description || ""
                });
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3001/update-profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.error);
                return;
            }

            const updatedUser = await res.json();
            setUser(updatedUser);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleDeleteDescription = async () => {
        try {
            const res = await fetch("http://localhost:3001/delete-profile-description", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.error);
                return;
            }

            setFormData((prev) => ({ ...prev, profile_description: "" }));
            alert("Profile description deleted!");
        } catch (error) {
            console.error("Error deleting profile description:", error);
        }
    };

    return (
        <div>
            <h2>Update Profile</h2>
            {user ? (
                <form onSubmit={handleSubmit}>
                    <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} placeholder="First Name" required />
                    <input type="text" name="surname" value={formData.surname} onChange={handleChange} placeholder="Surname" required />
                    <input type="date" name="dateofbirth" value={formData.dateofbirth} onChange={handleChange} required />
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                    <textarea name="profile_description" value={formData.profile_description} onChange={handleChange} placeholder="Profile Description" />
                    <button type="submit">Update Profile</button>
                    
                    {formData.profile_description && (
                        <button type="button" onClick={handleDeleteDescription}>Delete Description</button>
                    )}
                </form>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default ProfileUpdate;
