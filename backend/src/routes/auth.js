const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/dbConfig");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwt_token = require("../utils/jwt_token");
const {
  validateLogin,
  validateSignup,
} = require("../middleware/validationMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");
const { validatePassword } = require("../utils/validation");

// Public SignUp for nomarl users
router.post("/signup", validateSignup, async (req, res) => {
  const { name, email, password, address } = req.body;

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

    const defaultRole = "normal_user";
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, address || null, defaultRole]
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error during registration.", error });
  }
});

// Login
router.post("/login", validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    const [results] = await db.execute(
      "SELECT id, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const userData = { id: user.id, email: user.email, role: user.role };

    const accessToken = jwt_token.generateAccessToken(userData);
    const refreshToken = jwt_token.generateRefreshToken(userData);
    const expiresAt = jwt_token.getExpiryDate();

    // Save refresh token to database
    await db.execute(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, refreshToken, expiresAt]
    );

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Refresh Token
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Token missing." });

  try {
    const [results] = await db.execute(
      "SELECT user_id, expires_at FROM refresh_tokens WHERE token = ? AND expires_at > NOW()",
      [refreshToken]
    );

    if (results.length === 0) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token." });
    }

    const storedToken = results[0];
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

    if (decoded.id !== storedToken.user_id) {
      return res.status(403).json({ message: "Refresh token user mismatch." });
    }

    const [userRows] = await db.execute(
      "SELECT id, email, role FROM users WHERE id = ?",
      [decoded.id]
    );
    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ message: "User with refresh token not found." });
    }
    const user = userRows[0];

    const newAccessToken = jwt_token.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error during refresh token:", error);
    res.status(500).json({ message: "Server error during token refresh." });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "Refresh token missing." });

  try {
    const [result] = await db.execute(
      "DELETE FROM refresh_tokens WHERE token = ?",
      [refreshToken]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Refresh token not found." });
    }

    res.json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error during logout." });
  }
});

// Update password
router.post("/update-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userIdFromToken = req.user.id;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Old password and new password are required." });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      message:
        "New password must be 8-16 characters, include at least one uppercase letter and one special character.",
    });
  }

  try {
    const [results] = await db.execute(
      "SELECT id, password FROM users WHERE id = ?",
      [userIdFromToken]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const [updateResult] = await db.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, userIdFromToken]
    );

    if (updateResult.affectedRows === 0) {
      return res
        .status(500)
        .json({ message: "Password update failed (no rows affected)." });
    }

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error during password update." });
  }
});

module.exports = router;
