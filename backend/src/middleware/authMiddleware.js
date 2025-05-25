const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Access Denied. No token provided" });
  }
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware };
