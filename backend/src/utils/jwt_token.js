const jwt = require("jsonwebtoken");

const generateAccessToken = (user) =>
  jwt.sign(user, process.env.JWT_ACCESS_TOKEN, { expiresIn: "1h" });

const generateRefreshToken = (user) =>
  jwt.sign(user, process.env.JWT_REFRESH_TOKEN, { expiresIn: "7d" });

const getExpiryDate = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  getExpiryDate,
};
