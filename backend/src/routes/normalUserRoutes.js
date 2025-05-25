const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/Rating/ratingController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleAuth } = require("../middleware/roleMiddleware");

router.use(authMiddleware);

// Normal User Endpoints
router.get(
  "/stores",
  roleAuth(["normal_user", "store_owner"]),
  ratingController.getStoresForNormalUser
);

// Rating Endpoints

router.post(
  "/ratings",
  roleAuth(["normal_user"]),
  ratingController.submitRating
);

router.put(
  "/ratings/:id",
  roleAuth(["normal_user"]),
  ratingController.modifyRating
);

module.exports = router;
