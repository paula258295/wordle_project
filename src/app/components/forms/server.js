const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
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


const saltRounds = 10;

app.post("/users", async (req, res) => {
    const { firstName, surname, dateOfBirth, email, password, username } = req.body;
  
    try {
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }
  
      const existingUsername = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (existingUsername.rows.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const formattedDateOfBirth = new Date(dateOfBirth).toISOString().split('T')[0];
  
      const result = await pool.query(
        'INSERT INTO users (firstname, surname, email, dateofbirth, password, username) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [firstName, surname, email, formattedDateOfBirth, hashedPassword, username]
      );
  
      const newUser = result.rows[0];
  
      res.status(201).json({
        id: newUser.id,
        firstname: newUser.firstname,
        surname: newUser.surname,
        dateofbirth: newUser.dateofbirth,
        email: newUser.email,
        username: newUser.username,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Internal server error" });
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
    const { firstName, surname, email, username } = req.body;
  
    try {
      const result = await pool.query(
        "UPDATE users SET firstname = $1, surname = $2, email = $3, username = $4 WHERE id = $5 RETURNING *",
        [firstName, surname, email, username, id]
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
  
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
  
      const user = result.rows[0];
  
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
  
      res.cookie("userId", user.id, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
  
      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          firstname: user.firstname,
          surname: user.surname,
          dateofbirth: user.dateofbirth,
          email: user.email,
          username: user.username,
        },
      });
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ error: "Internal server error" });
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
      const result = await pool.query(
        "SELECT id, firstname, surname, dateofbirth, email, username FROM users WHERE id = $1",
        [userId]
      );
  
      const user = result.rows[0];
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json({
        id: user.id,
        firstname: user.firstname,
        surname: user.surname,
        dateofbirth: user.dateofbirth,
        email: user.email, 
        username: user.username
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  

app.get("/check-cookie", (req, res) => {
    console.log("Cookies received:", req.cookies);
    res.json({ cookie: req.cookies.userId || "No cookie found" });
  });

  const adminPassword = 'admin';
bcrypt.hash(adminPassword, saltRounds, (err, hashedPassword) => {
  if (err) throw err;
  console.log(hashedPassword);
});






app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
