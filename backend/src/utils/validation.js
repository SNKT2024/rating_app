// Functions to validate form inputs

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const validateName = (name) => {
  return typeof name === "string" && name.length >= 20 && name.length <= 60;
};

const validateEmail = (email) => {
  return typeof email === "string" && emailRegex.test(email);
};

const validatePassword = (password) => {
  return typeof password === "string" && passwordRegex.test(password);
};

const validateAddress = (address) => {
  if (address === null || address === undefined || address === "") {
    return true;
  }
  return typeof address === "string" && address.length <= 400;
};

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
};
