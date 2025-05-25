const db = require("../../config/dbConfig");
const bcrypt = require("bcrypt");

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
  try {
    const sql = `SELECT id, name, email, address, role, created_at, updated_at FROM users`;
    const [users] = await db.execute(sql);

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
