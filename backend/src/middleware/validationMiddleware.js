const {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} = require("../utils/validation");

function validateSignup(req, res, next) {
  const { name, email, password, address } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }
  if (!validateName(name)) {
    return res
      .status(400)
      .json({ message: "Name must be between 20 and 60 characters." });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        "Password must be 8-16 characters, include at least one uppercase letter and one special character.",
    });
  }
  if (address !== undefined && !validateAddress(address)) {
    return res
      .status(400)
      .json({ message: "Address cannot exceed 400 characters." });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  next();
}

module.exports = {
  validateSignup,
  validateLogin,
};
