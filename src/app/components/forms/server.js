const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "wordle",
  password: "BazaDanych",
  port: 5432,
});

const app = express();
const port = 3001;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.post("/users", async (req, res) => {
    const { firstName, surname, dateOfBirth, username, email, password } = req.body;
  
    try {
      const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1 OR username = $2",
        [email, username]
      );
  
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "Email or username is already taken" });
      }
  
      const newUser = await pool.query(
        "INSERT INTO users (firstName, surname, dateOfBirth, username, email, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [firstName, surname, dateOfBirth, username, email, password]
      );
  
      res.status(201).json(newUser.rows[0]);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

app.get("/users", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM users");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
app.get("/users/:id", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  

app.put("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    
    try {
      const result = await pool.query(
        "UPDATE users SET username = $1 WHERE id = $2 RETURNING *",
        [username, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  

app.delete("/users/:id", async (req, res) => {
    try {
      const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  

app.get("/users/search/:query", async (req, res) => {
    const query = req.params.query.toLowerCase();
  
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE LOWER(firstname) LIKE $1 OR LOWER(surname) LIKE $1 OR LOWER(email) LIKE $1",
        [`%${query}%`]
      );
  
      const results = result.rows;
      res.json(results);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "An error occurred while searching users" });
    }
  });
  

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Login request:", email, password);
  
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];
  
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
  
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
  
      console.log("User logged in:", user);
  
      res.cookie("userId", user.id, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
  
      res.json({ message: "Login successful", user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
app.post("/logout", (req, res) => {
    res.clearCookie("userId", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.json({ message: "Logout successful" });
  });
  
app.get("/current-user", async (req, res) => {
    const userId = req.cookies.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
  
    try {
      const result = await pool.query("SELECT id, firstName, surname, email FROM users WHERE id = $1", [userId]);
      const user = result.rows[0];
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

app.get("/check-cookie", (req, res) => {
    console.log("Cookies received:", req.cookies);
    res.json({ cookie: req.cookies.userId || "No cookie found" });
  });
  



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
