const express = require("express");
const router = express.Router();
const storeOwnerDashboardController = require("../controllers/Store_Owner/dashboardContoller");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleAuth } = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(roleAuth(["store_owner"]));

// Dashboard Route
router.get("/dashboard", storeOwnerDashboardController.getStoreOwnerDashboard);

module.exports = router;
