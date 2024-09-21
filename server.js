import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  readJSONFile,
  writeJSONFile,
  updateData,
  filterData,
} from "./functions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(printTime, express.json());

function printTime(req, res, next) {
  console.log(new Date().toLocaleDateString());
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
      res.status(404).send("Failed to load HTML file");
    });
});

app.get("/users", async (req, res) => {
  const { name, age, email, minAge, maxAge, order } = req.query;
  filterData(name, age, email, minAge, maxAge, order, res);
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const users = await readJSONFile(path.join(__dirname, "./user.json"));
    const user = users.find((u) => u.id === +id);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send(`User with ID ${id} not found`);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/users", async (req, res) => {
  if (!req.is("application/json")) {
    return res.status(404).send("Wrong data type");
  }

  const newUser = req.body;

  try {
    const users = await readJSONFile(path.join(__dirname, "./user.json"));

    newUser.id = users.length + 1;
    users.push(newUser);

    await writeJSONFile(path.join(__dirname, "./user.json"), users);

    res.status(201).send("User successfully created");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  updateData(id, updatedUser, res);
});

app.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  updateData(id, updatedUser, res);
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const users = await readJSONFile(path.join(__dirname, "./user.json"));
    const userIndex = users.findIndex((u) => u.id === +id);

    if (userIndex === -1) {
      return res.status(404).json("User not found");
    }

    users.splice(userIndex, 1);

    await writeJSONFile(path.join(__dirname, "./user.json"), users);

    res.status(204).send("User deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.listen(4000, () => console.log("Server is running!"));
