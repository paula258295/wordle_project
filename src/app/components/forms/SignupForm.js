"use client";

import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import "./signup.css";

const API_URL = "http://localhost:3001";

export function SignupForm() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      surname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .max(30, "Must be 30 characters or less")
        .required("First name is required")
        .matches(
          /^[A-Za-z]+$/,
          "First name must not contain special characters or numbers"
        ),
      surname: Yup.string()
        .max(30, "Must be 30 characters or less")
        .required("Surname is required")
        .matches(
          /^[A-Za-z]+$/,
          "Surname must not contain special characters or numbers"
        ),
      username: Yup.string()
        .min(3, "Must be at least 3 characters")
        .max(20, "Must be 20 characters or less")
        .required("Username is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Must be at least 8 characters")
        .max(20, "Must be 20 characters or less")
        .required("Password is required")
        .matches(/[A-Z]/, "Must contain at least one uppercase letter")
        .matches(/[\W_]/, "Must contain at least one special character"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.error);
          return;
        }
    
        const newUser = await response.json();
        console.log("New user response:", newUser);
    
        const loginResponse = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
          credentials: "include",
        });
    
        if (!loginResponse.ok) {
          const errorData = await loginResponse.json();
          alert(errorData.error);
          return;
        }
    
        const loggedInUser = await loginResponse.json();
    
        console.log("Logged in user:", loggedInUser);
    
        alert("Registration and login successful! Redirecting to the homepage...");
        router.push('/');
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
},
  });

    return (
    <div className="form-container">
      <form onSubmit={formik.handleSubmit}>
        <div className="form-card">
          <div className="form-header">
            <h1>Sign Up</h1>
            <p>Enter your details to create a new account</p>
          </div>
          <div className="form-body">
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.firstName}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <div className="error">{formik.errors.firstName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="surname">Surname</label>
              <input
                id="surname"
                name="surname"
                type="text"
                placeholder="Surname"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.surname}
              />
              {formik.touched.surname && formik.errors.surname && (
                <div className="error">{formik.errors.surname}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Username"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
              />
              {formik.touched.username && formik.errors.username && (
                <div className="error">{formik.errors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="error">{formik.errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              <div className="password-info">
                Must contain at least one uppercase letter and one special
                character.
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="error">{formik.errors.password}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <div className="error">{formik.errors.confirmPassword}</div>
                )}
            </div>
          </div>
          <div className="form-footer">
            <button type="submit" className="submit-button">
              Sign Up
            </button>
          </div>
        </div>
        <div className="form-link">
          <p>Have an account?</p>
          <Link href="/signin">Sign In</Link>
        </div>
      </form>
    </div>
  );
}

