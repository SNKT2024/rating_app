const db = require("../../config/dbConfig");

// Store owner dashboard
exports.getStoreOwnerDashboard = async (req, res) => {
  const storeOwnerId = req.user.id;

  try {
    const [ownedStores] = await db.execute(
      "SELECT id, name, email, address FROM stores WHERE owner_id = ?",
      [storeOwnerId]
    );

    if (ownedStores.length === 0) {
      return res
        .status(404)
        .json({ message: "No store found associated with this owner." });
    }

    const ownedStore = ownedStores[0];
    const storeId = ownedStore.id;

    const [averageRatingResult] = await db.execute(
      `SELECT COALESCE(AVG(rating), 0) AS averageRating FROM ratings WHERE store_id = ?`,
      [storeId]
    );
    const averageRating = parseFloat(
      averageRatingResult[0].averageRating
    ).toFixed(1);

    const [ratedUsers] = await db.execute(
      `SELECT
                u.id AS userId,
                u.name AS userName,
                u.email AS userEmail,
                r.rating AS submittedRating,
                r.created_at AS ratingDate
            FROM
                ratings r
            JOIN
                users u ON r.user_id = u.id
            WHERE
                r.store_id = ?
            ORDER BY
                r.created_at DESC`,
      [storeId]
    );

    res.status(200).json({
      store: {
        id: ownedStore.id,
        name: ownedStore.name,
        email: ownedStore.email,
        address: ownedStore.address,
        averageRating: averageRating,
      },
      ratingsGivenByUsers: ratedUsers,
    });
  } catch (error) {
    console.error("Error fetching store owner dashboard data:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching dashboard data." });
  }
};
