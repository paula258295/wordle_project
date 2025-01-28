const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

let users = [];

app.post("/users", (req, res) => {
  const newUser = { id: Date.now().toString(), ...req.body };
  const existingUser = users.find((user) => user.email === newUser.email);

  if (existingUser) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  users.push(newUser);
  console.log("New user added:", newUser); 
  res.status(201).json(newUser);
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.put("/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "User not found" });

  users[index] = { ...users[index], ...req.body };
  res.json(users[index]);
});

app.delete("/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "User not found" });

  users.splice(index, 1);
  res.status(204).send();
});

app.get("/users/search/:query", (req, res) => {
  const query = req.params.query.toLowerCase();
  const results = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(query) ||
      user.surname.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
  );
  res.json(results);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  console.log("User logged in:", user);

  res.json({ message: "Login successful", user });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
