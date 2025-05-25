const express = require("express");
const router = express.Router();
const adminUserController = require("../controllers/Admin/userController");
const adminStoreController = require("../controllers/Admin/storeController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleAuth } = require("../middleware/roleMiddleware");
const { validateSignup } = require("../middleware/validationMiddleware");

// User Routes
router.post(
  "/users",
  validateSignup,
  authMiddleware,
  roleAuth(["system_admin"]),
  adminUserController.createUser
);

router.get(
  "/dashboard-stats",
  authMiddleware,
  adminUserController.getDashboardStats
);

router.get("/users", authMiddleware, adminUserController.getUsers);
router.get("/users/:id", authMiddleware, adminUserController.getUserById);

// Store Routes
router.post("/stores", authMiddleware, adminStoreController.addStore);
router.get("/stores", authMiddleware, adminStoreController.getStores);
module.exports = router;
