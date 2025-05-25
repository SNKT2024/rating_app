const db = require("../../config/dbConfig");
const bcrypt = require("bcrypt");
const {
  validateName,
  validateEmail,
  validateAddress,
} = require("../../utils/validation");
//  Create new user
exports.createUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!role) {
    return res
      .status(400)
      .json({ message: "Role is required for user creation by admin." });
  }

  if (!["system_admin", "store_owner", "normal_user"].includes(role)) {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  try {
    const [existingUserRows] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUserRows.length > 0) {
      return res
        .status(409)
        .json({ message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, address || null, role]
    );

    res
      .status(201)
      .json({ message: "User created successfully", userId: result.insertId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error while creating user." });
  }
};

// getDashboardStats

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsersRows] = await db.execute(
      "SELECT COUNT(id) AS totalUsers FROM users"
    );
    const [totalStoresRows] = await db.execute(
      "SELECT COUNT(id) AS totalStores FROM stores"
    );
    const [totalRatingsRows] = await db.execute(
      "SELECT COUNT(id) AS totalRatings FROM ratings"
    );

    res.status(200).json({
      totalUsers: totalUsersRows[0].totalUsers,
      totalStores: totalStoresRows[0].totalStores,
      totalRatings: totalRatingsRows[0].totalRatings,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching dashboard statistics." });
  }
};

// getUsers
exports.getUsers = async (req, res) => {
  const { role } = req.query;

  let sql = `SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE 1=1`;
  const params = [];

  // Apply role filter if provided
  if (role) {
    // Ensure the role is valid for filtering (security and data integrity)
    if (!["system_admin", "store_owner", "normal_user"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role filter specified." });
    }
    sql += ` AND role = ?`;
    params.push(role);
  }

  // Default sorting for consistency, even if frontend handles overall sorting
  sql += ` ORDER BY id ASC`;

  try {
    const [users] = await db.execute(sql, params);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching user list." });
  }
};

// getUserByID
exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const [userRows] = await db.execute(
      "SELECT id, name, email, address, role FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userRows[0];
    const userDetails = { ...user };

    // If the user is a store_owner
    if (user.role === "store_owner") {
      const [storeRows] = await db.execute(
        `SELECT s.id, s.name, s.email, s.address, AVG(r.rating) AS averageRating
                 FROM stores s
                 LEFT JOIN ratings r ON s.id = r.store_id
                 WHERE s.owner_id = ?
                 GROUP BY s.id`,
        [userId]
      );

      if (storeRows.length > 0) {
        userDetails.ownedStore = {
          id: storeRows[0].id,
          name: storeRows[0].name,
          email: storeRows[0].email,
          address: storeRows[0].address,
          averageRating: storeRows[0].averageRating
            ? parseFloat(storeRows[0].averageRating).toFixed(2)
            : "N/A",
        };
      } else {
        userDetails.ownedStore = null;
      }
    }

    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching user details." });
  }
};

// Update Users
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, password, address, role } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required for update." });
  }

  const fieldsToUpdate = [];
  const params = [];

  if (name !== undefined) {
    if (!validateName(name)) {
      return res
        .status(400)
        .json({ message: "Name must be between 20 and 60 characters." });
    }
    fieldsToUpdate.push("name = ?");
    params.push(name);
  }
  if (email !== undefined) {
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    fieldsToUpdate.push("email = ?");
    params.push(email);
  }
  if (password !== undefined) {
    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters, include at least one uppercase letter and one special character.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    fieldsToUpdate.push("password = ?");
    params.push(hashedPassword);
  }
  if (address !== undefined) {
    if (!validateAddress(address)) {
      return res
        .status(400)
        .json({ message: "Address cannot exceed 400 characters." });
    }
    fieldsToUpdate.push("address = ?");
    params.push(address || null);
  }
  if (role !== undefined) {
    if (!["system_admin", "store_owner", "normal_user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }
    fieldsToUpdate.push("role = ?");
    params.push(role);
  }

  if (fieldsToUpdate.length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update." });
  }

  try {
    const [existingUser] = await db.execute(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    if (email !== undefined) {
      const [duplicateEmail] = await db.execute(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, userId]
      );
      if (duplicateEmail.length > 0) {
        return res
          .status(409)
          .json({ message: "Another user with this email already exists." });
      }
    }

    const sql = `UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;
    params.push(userId);

    const [result] = await db.execute(sql, params);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made." });
    }

    res.status(200).json({ message: "User updated successfully!" });
  } catch (error) {
    console.error("Error updating user:", error);

    res.status(500).json({ message: "Server error while updating user." });
  }
};

// Delete User

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res
      .status(400)
      .json({ message: "User ID is required for deletion." });
  }

  try {
    const [existingUserRows] = await db.execute(
      "SELECT id, role FROM users WHERE id = ?",
      [userId]
    );
    if (existingUserRows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    const userToDelete = existingUserRows[0];

    await db.execute("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
    console.log(`Deleted refresh tokens for user ${userId}`);

    await db.execute("DELETE FROM ratings WHERE user_id = ?", [userId]);
    console.log(`Deleted ratings for user ${userId}`);

    if (userToDelete.role === "store_owner") {
      await db.execute("UPDATE stores SET owner_id = NULL WHERE owner_id = ?", [
        userId,
      ]);
      console.log(`Disassociated stores from store owner ${userId}`);
    }

    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(500)
        .json({ message: "Failed to delete user: no rows affected." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error while deleting user." });
  }
};
