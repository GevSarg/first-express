import fs from "fs";

// Function to read JSON from a file
export const readJSONFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    throw new Error("Failed to load JSON");
  }
};

export const writeJSONFile = async (filePath, data) => {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    throw new Error("Failed to write JSON");
  }
};

export const filterData = async (
  name,
  age,
  email,
  minAge,
  maxAge,
  order,
  res
) => {
  try {
    const users = await readJSONFile("./user.json");

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
      filteredUsers.sort((a, b) =>
        order === "asc" ? a.age - b.age : b.age - a.age
      );
    }

    if (filteredUsers.length > 0) {
      res.status(200).json(filteredUsers);
    } else {
      res.status(404).send("No users found with the specified criteria");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const updateData = async (id, updatedUser, res, filePath) => {
  try {
    const users = await readJSONFile(filePath);
    const userIndex = users.findIndex((u) => u.id === +id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    users[userIndex] = { ...users[userIndex], ...updatedUser };
    await writeJSONFile(filePath, users);

    res.status(200).json("User updated successfully");
  } catch (err) {
    res.status(500).json(err.message);
  }
};
