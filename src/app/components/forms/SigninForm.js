"use client";

import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import "./signin.css";

const API_URL = "http://localhost:3001";

export function SigninForm() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),

    onSubmit: async (values) => {
      try {
        console.log("Attempting login with values:", values);

        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.error);
          console.log("Login failed:", errorData.error);
          return;
        }

        const loginData = await response.json();
        console.log("Login successful:", loginData);

        alert("Login successful! Redirecting to the homepage...");
        router.push(`/?id=${loginData.user.id}`);
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      }
    },
  });

  return (
    <div className="signin-container">
      <form onSubmit={formik.handleSubmit} className="signin-form">
        <h2 className="form-title">Sign In</h2>
        <p className="form-description">
          Enter your details to sign in to your account
        </p>

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
            className="input-field"
          />
          {formik.touched.email && formik.errors.email && (
            <div className="error-message">{formik.errors.email}</div>
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
            className="input-field"
          />
          {formik.touched.password && formik.errors.password && (
            <div className="error-message">{formik.errors.password}</div>
          )}
        </div>

        <div className="form-footer">
          <button
            type="submit"
            className="submit-button"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </form>

      <div className="signup-link">
        <p>
          Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
