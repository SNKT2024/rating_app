const roleAuth = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Access Denied" });
  }

  next();
};

module.exports = { roleAuth };
