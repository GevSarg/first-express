import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(printTime, express.json());

function printTime(req, res, next) {
  console.log(new Date().toLocaleDateString());
  console.log(new Date().toLocaleTimeString());
  next();
}

app.get("/", (req, res) => {
  fs.promises
    .readFile(path.join(__dirname, "./index.html"), "utf-8")
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(404).send("failed to load html file");
    });
});

app.get("/users", (req, res) => {
  const { name, age, email, minAge, maxAge, order } = req.query;
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
      if (order) {
        switch (order) {
          case "asc":
            filteredUsers.toSorted((a, b) => a.age - b.age);
            break;
          case "desc":
            filteredUsers.toSorted((a, b) => b.age - a.age);
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
        // console.log(req.params);
      } else {
        res.status(404).send(`User with ID ${id} not found`);
      }
    })
    .catch(() => {
      res.status(500).send("failed to load Json");
    });
});

app.post("/users", (req, res) => {
  if (!req.is("application/json")) {
    return res.status(400).send("Wrong type data");
  }

  const newUser = req.body;

  fs.promises
    .readFile(path.join(__dirname, "./user.json"), "utf-8")
    .then((data) => {
      const users = JSON.parse(data);
      let newId;

      if (users.length > 0) {
        const maxId = Math.max(...users.map((user) => user.id));
        newId = maxId + 1;
      } else {
        newId = 1;
      }

      const userWithId = {
        id: newId,
        ...newUser,
      };

      users.push(userWithId);

      return fs.promises.writeFile(
        path.join(__dirname, "./user.json"),
        JSON.stringify(users, null, 2)
      );
    })
    .then(() => {
      res.status(201).send("User successfully created");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Failed to add User");
    });
});

app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  fs.promises
    .readFile(path.join(__dirname, "./user.json"), "utf-8")
    .then((data) => {
      const users = JSON.parse(data);
      const userIndex = users.findIndex((u) => u.id === +id);

      if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
      }

      users[userIndex] = { ...users[userIndex], ...updatedUser };

      return fs.promises.writeFile(
        path.join(__dirname, "./user.json"),
        JSON.stringify(users, null, 2)
      );
    })
    .then(() => {
      res.status(200).json("User updated successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json("Failed to update user");
    });
});
app.patch("/users/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  fs.promises
    .readFile(path.join(__dirname, "./user.json"), "utf-8")
    .then((data) => {
      const users = JSON.parse(data);
      const userIndex = users.findIndex((u) => u.id === +id);

      if (userIndex === -1) {
        return res.status(404).json("User not found");
      }

      users[userIndex] = { ...users[userIndex], ...updates };

      return fs.promises.writeFile(
        path.join(__dirname, "./user.json"),
        JSON.stringify(users, null, 2)
      );
    })
    .then(() => {
      res.status(200).json("User updated successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json("Failed to update user");
    });
});
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  fs.promises
    .readFile(path.join(__dirname, "./user.json"), "utf-8")
    .then((data) => {
      const users = JSON.parse(data);
      const userIndex = users.findIndex((u) => u.id === +id);

      if (userIndex === -1) {
        return res.status(404).json("User not found");
      }

      users.splice(userIndex, 1);

      return fs.promises.writeFile(
        path.join(__dirname, "./user.json"),
        JSON.stringify(users, null, 2)
      );
    })
    .then(() => {
      res.status(204).send("User Deleted");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json("Failed to delete user");
    });
});

app.listen(4000, () => console.log("Server is running!"));
