const express = require("express");
const app = express();
const router = express.Router();
const adminUserController = require("../controllers/Admin/userController");
const adminStoreController = require("../controllers/Admin/storeController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleAuth } = require("../middleware/roleMiddleware");
const { validateSignup } = require("../middleware/validationMiddleware");

app.use(authMiddleware);
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
router.put("/users/:id", adminUserController.updateUser);
router.delete("/users/:id", adminUserController.deleteUser);
// Store Routes
router.post("/stores", authMiddleware, adminStoreController.addStore);
router.get("/stores", authMiddleware, adminStoreController.getStores);
router.get("/stores/:id", adminStoreController.getStoreById);
router.put("/stores/:id", adminStoreController.updateStore);
router.delete("/stores/:id", adminStoreController.deleteStore);
module.exports = router;
