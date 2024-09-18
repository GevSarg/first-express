const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});

app.get("/users", (req, res) => {
  const { name, age, email, minAge, maxAge, sortOrder } = req.query;
  console.log(req.query);

  fs.promises
    .readFile(path.join(__dirname, "./user.json"), "utf-8")
    .then((data) => {
      const users = JSON.parse(data);
      const filteredUsers = users.filter((user) => {
        let isMatch = true;

        if (name && !user.name.toLowerCase().includes(name.toLowerCase())) {
          isMatch = false;
        }

        if (age && user.age !== +age) {
          isMatch = false;
        }

        if (email && !user.email.toLowerCase().includes(email.toLowerCase())) {
          isMatch = false;
        }

        if (minAge && user.age < +minAge) {
          isMatch = false;
        }

        if (maxAge && user.age > +maxAge) {
          isMatch = false;
        }

        return isMatch;
      });
      if (sortOrder) {
        switch (sortOrder) {
          case "asc":
            filteredUsers.sort((a, b) => a.age - b.age);
            break;
          case "desc":
            filteredUsers.sort((a, b) => b.age - a.age);
            break;
          default:
            break;
        }
      }

      if (filteredUsers.length > 0) {
        res.status(200).json(filteredUsers);
      } else {
        res.status(404).send("No users found with the specified criteria");
      }
    })
    .catch(() => {
      res.status(500).send("Failed to load JSON");
    });
});

app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  fs.promises
    .readFile(path.join(__dirname, "./user.json"), "utf-8")
    .then((data) => {
      const users = JSON.parse(data);
      const user = users.find((u) => u.id === +id);
      if (user) {
        res.status(200).json(user);
        console.log(req.params);
      } else {
        res.status(404).send(`User with ID ${id} not found`);
      }
    })
    .catch(() => {
      res.status(500).send("failed to load Json");
    });
});

app.listen(4000, () => console.log("Server is running!"));
