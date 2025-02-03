'use client'

import React, { useEffect, useState } from "react";
import "./EditAccount.css"

const ProfileUpdate = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        firstname: "",
        surname: "",
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
                if (!data) {
                    console.error("No user data received");
                    return;
                }
        
                setUser(data);
                setFormData({
                    firstname: data.firstname,
                    surname: data.surname,
                    username: data.username,
                    email: data.email,
                    profile_description: data.profile_description || "",
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
        <div className="form-container">
            <h2 className="form-title">Update Profile</h2>
            {user ? (
                <form onSubmit={handleSubmit} className="form">
                    <div className="my-div">
                        <div className="form-group">
                            <label htmlFor="firstname" className="form-label">First Name</label>
                            <input
                                type="text"
                                id="firstname"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleChange}
                                placeholder="First Name"
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="surname" className="form-label">Surname</label>
                            <input
                                type="text"
                                id="surname"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                placeholder="Surname"
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Username"
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile_description" className="form-label">Profile Description</label>
                            <textarea
                                id="profile_description"
                                name="profile_description"
                                value={formData.profile_description}
                                onChange={handleChange}
                                placeholder="Profile Description"
                                className="form-textarea"
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="form-submit-btn">Update Profile</button>
                    
                    {user.profile_description && formData.profile_description && (
                        <button type="button" onClick={handleDeleteDescription} className="form-delete-btn">
                            Delete Description
                        </button>
                    )}

                    <a href="/">
                        <button type="button" className="form-submit-btn">Home</button>
                    </a>
                </form>
            ) : (
                <p className="loading-text">Loading...</p>
            )}
        </div>
    )
}

export default ProfileUpdate;
