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

// Update Store

exports.updateStore = async (req, res) => {
  const storeId = req.params.id;
  const { name, email, address, owner_id } = req.body;

  if (!storeId) {
    return res
      .status(400)
      .json({ message: "Store ID is required for update." });
  }

  const fieldsToUpdate = [];
  const params = [];

  if (name !== undefined) {
    if (!validateName(name)) {
      return res
        .status(400)
        .json({ message: "Store name must be between 20 and 60 characters." });
    }
    fieldsToUpdate.push("name = ?");
    params.push(name);
  }
  if (email !== undefined) {
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid store email format." });
    }
    fieldsToUpdate.push("email = ?");
    params.push(email);
  }
  if (address !== undefined) {
    if (!validateAddress(address)) {
      return res
        .status(400)
        .json({ message: "Store address cannot exceed 400 characters." });
    }
    fieldsToUpdate.push("address = ?");
    params.push(address || null);
  }
  if (owner_id !== undefined) {
    if (owner_id !== null) {
      const [ownerUser] = await db.execute(
        "SELECT id, role FROM users WHERE id = ? AND role = 'store_owner'",
        [owner_id]
      );
      if (ownerUser.length === 0) {
        return res.status(400).json({
          message: "Provided owner ID is not a valid store owner user.",
        });
      }
    }
    fieldsToUpdate.push("owner_id = ?");
    params.push(owner_id);
  }

  if (fieldsToUpdate.length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update." });
  }

  try {
    const [existingStore] = await db.execute(
      "SELECT id FROM stores WHERE id = ?",
      [storeId]
    );
    if (existingStore.length === 0) {
      return res.status(404).json({ message: "Store not found." });
    }

    if (email !== undefined) {
      const [duplicateEmail] = await db.execute(
        "SELECT id FROM stores WHERE email = ? AND id != ?",
        [email, storeId]
      );
      if (duplicateEmail.length > 0) {
        return res
          .status(409)
          .json({ message: "Another store with this email already exists." });
      }
    }

    const sql = `UPDATE stores SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;
    params.push(storeId);

    const [result] = await db.execute(sql, params);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Store not found or no changes made." });
    }

    res.status(200).json({ message: "Store updated successfully!" });
  } catch (error) {
    console.error("Error updating store:", error);

    res.status(500).json({ message: "Server error while updating store." });
  }
};

//  Delete Store

exports.deleteStore = async (req, res) => {
  const storeId = req.params.id;

  if (!storeId) {
    return res
      .status(400)
      .json({ message: "Store ID is required for deletion." });
  }

  try {
    const [existingStore] = await db.execute(
      "SELECT id FROM stores WHERE id = ?",
      [storeId]
    );
    if (existingStore.length === 0) {
      return res.status(404).json({ message: "Store not found." });
    }

    await db.execute("DELETE FROM ratings WHERE store_id = ?", [storeId]);
    console.log(`Deleted ratings for store ${storeId}`);

    const [result] = await db.execute("DELETE FROM stores WHERE id = ?", [
      storeId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(500)
        .json({ message: "Failed to delete store: no rows affected." });
    }

    res.status(200).json({ message: "Store deleted successfully." });
  } catch (error) {
    console.error("Error deleting store:", error);
    res.status(500).json({ message: "Server error while deleting store." });
  }
};

// Get Store By Id
exports.getStoreById = async (req, res) => {
  const storeId = req.params.id;

  if (!storeId) {
    return res.status(400).json({ message: "Store ID is required." });
  }

  try {
    // SQL query to fetch store details and calculate average rating
    const [storeRows] = await db.execute(
      `SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id,
                COALESCE(AVG(r.rating), 0) AS averageRating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE s.id = ?
            GROUP BY s.id, s.name, s.email, s.address, s.owner_id`, // Group by all non-aggregated columns
      [storeId]
    );

    if (storeRows.length === 0) {
      return res.status(404).json({ message: "Store not found." });
    }

    const store = {
      ...storeRows[0],
      averageRating: parseFloat(storeRows[0].averageRating).toFixed(2), // Format rating
    };

    // Optionally, fetch owner details if owner_id exists
    if (store.owner_id) {
      const [ownerRows] = await db.execute(
        "SELECT id, name, email FROM users WHERE id = ?",
        [store.owner_id]
      );
      if (ownerRows.length > 0) {
        store.owner = {
          // Attach owner object
          id: ownerRows[0].id,
          name: ownerRows[0].name,
          email: ownerRows[0].email,
        };
      }
    }

    res.status(200).json(store);
  } catch (error) {
    console.error("Error fetching store by ID:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching store details." });
  }
};
