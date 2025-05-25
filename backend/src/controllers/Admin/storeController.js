const db = require("../../config/dbConfig");
const {
  validateName,
  validateEmail,
  validateAddress,
} = require("../../utils/validation");

// Add new store
exports.addStore = async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  // Basic validation
  if (!name || !email || !address) {
    return res.status(400).json({
      message: "Please provide name, email, and address for the store.",
    });
  }

  if (!validateName(name)) {
    return res
      .status(400)
      .json({ message: "Store name must be between 20 and 60 characters." });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid store email format." });
  }
  if (!validateAddress(address)) {
    return res
      .status(400)
      .json({ message: "Store address cannot exceed 400 characters." });
  }

  try {
    const [existingStore] = await db.execute(
      "SELECT id FROM stores WHERE email = ?",
      [email]
    );
    if (existingStore.length > 0) {
      return res
        .status(409)
        .json({ message: "A store with this email already exists." });
    }

    // Validate owner_id if provided
    if (owner_id) {
      const [ownerUser] = await db.execute(
        "SELECT id, role FROM users WHERE id = ? AND role = 'store_owner'",
        [owner_id]
      );
      if (ownerUser.length === 0) {
        return res.status(400).json({
          message: "Provided owner_id is not a valid store owner user.",
        });
      }
    }

    // Insert new store
    const sql = `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      name,
      email,
      address,
      owner_id || null,
    ]);

    if (result.affectedRows === 1) {
      res.status(201).json({
        message: "Store added successfully!",
        storeId: result.insertId,
      });
    } else {
      res.status(500).json({ message: "Failed to add store." });
    }
  } catch (error) {
    console.error("Error adding store:", error);

    res.status(500).json({ message: "Server error. Could not add store." });
  }
};

// get ALl Stores

exports.getStores = async (req, res) => {
  try {
    const sql = `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id,
                AVG(r.rating) AS averageRating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at
            ORDER BY s.id ASC 
        `;
    const [stores] = await db.execute(sql);

    // Replace null averageRating with 'N/A'
    const result = stores.map((store) => ({
      ...store,
      averageRating:
        store.averageRating !== null
          ? parseFloat(store.averageRating).toFixed(2)
          : "N/A",
    }));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching store list." });
  }
};
