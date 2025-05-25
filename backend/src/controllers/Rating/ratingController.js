const db = require("../../config/dbConfig");

// Get store list for normal users
exports.getStoresForNormalUser = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const sql = `
            SELECT
                s.id AS storeId,
                s.name AS storeName,
                s.address AS storeAddress,
                COALESCE(AVG(all_ratings.rating), 0) AS overallRating,
                user_ratings.rating AS userSubmittedRating,
                user_ratings.id AS userRatingId -- This is correctly selected
            FROM
                stores s
            LEFT JOIN
                ratings all_ratings ON s.id = all_ratings.store_id
            LEFT JOIN
                ratings user_ratings ON s.id = user_ratings.store_id AND user_ratings.user_id = ?
            GROUP BY
                s.id, s.name, s.address, user_ratings.rating, user_ratings.id -- FIX: Ensure user_ratings.id is here
            ORDER BY
                s.id ASC;
        `;

    const [stores] = await db.execute(sql, [currentUserId]);

    const formattedStores = stores.map((store) => ({
      storeId: store.storeId,
      storeName: store.storeName,
      storeAddress: store.storeAddress,
      overallRating: parseFloat(store.overallRating).toFixed(1),
      userSubmittedRating:
        store.userSubmittedRating !== null ? store.userSubmittedRating : null,
      userRatingId: store.userRatingId !== null ? store.userRatingId : null, // Ensure this is passed to frontend
    }));

    res.status(200).json(formattedStores);
  } catch (error) {
    console.error("Error fetching stores for normal user:", error);
    res.status(500).json({ message: "Server error while fetching stores." });
  }
};

// Update average rating
const updateStoreAverageRating = async (storeId) => {
  try {
    const [result] = await db.execute(
      `SELECT AVG(rating) AS newAverage FROM ratings WHERE store_id = ?`,
      [storeId]
    );
    const newAverage = result[0].newAverage || 0;

    await db.execute(`UPDATE stores SET average_rating = ? WHERE id = ?`, [
      newAverage,
      storeId,
    ]);
    console.log(`Store ${storeId} average rating updated to: ${newAverage}`);
  } catch (error) {
    console.error(`Error updating average rating for store ${storeId}:`, error);
  }
};

// Submit new rating

exports.submitRating = async (req, res) => {
  const { storeId, rating } = req.body;
  const userId = req.user.id;

  if (rating === undefined || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ message: "Rating must be a number between 1 and 5." });
  }
  if (!storeId) {
    return res
      .status(400)
      .json({ message: "Store ID is required to submit a rating." });
  }

  try {
    const [storeExists] = await db.execute(
      "SELECT id FROM stores WHERE id = ?",
      [storeId]
    );
    if (storeExists.length === 0) {
      return res.status(404).json({ message: "Store not found." });
    }

    const [existingRating] = await db.execute(
      "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
      [userId, storeId]
    );

    if (existingRating.length > 0) {
      return res.status(409).json({
        message:
          "You have already submitted a rating for this store. Please modify your existing rating.",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)",
      [userId, storeId, rating]
    );

    updateStoreAverageRating(storeId);

    res.status(201).json({
      message: "Rating submitted successfully!",
      ratingId: result.insertId,
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Server error while submitting rating." });
  }
};

// Update Rating

exports.modifyRating = async (req, res) => {
  const ratingId = req.params.id;
  const { rating } = req.body;
  const userId = req.user.id;

  if (rating === undefined || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ message: "Rating must be a number between 1 and 5." });
  }

  try {
    const [existingRating] = await db.execute(
      "SELECT id, user_id, store_id FROM ratings WHERE id = ?",
      [ratingId]
    );

    if (existingRating.length === 0) {
      return res.status(404).json({ message: "Rating not found." });
    }

    if (existingRating[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to modify this rating." });
    }

    const storeId = existingRating[0].store_id;

    const [result] = await db.execute(
      "UPDATE ratings SET rating = ? WHERE id = ?",
      [rating, ratingId]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Failed to modify rating." });
    }

    updateStoreAverageRating(storeId);

    res.status(200).json({ message: "Rating modified successfully!" });
  } catch (error) {
    console.error("Error modifying rating:", error);
    res.status(500).json({ message: "Server error while modifying rating." });
  }
};
