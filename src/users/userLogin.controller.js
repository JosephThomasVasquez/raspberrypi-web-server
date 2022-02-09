const users = require("../utils/users_data");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const userLoginService = require("./userLogin.service");

// ==============================================================================================
// Validation functions =========================================================================
// ==============================================================================================

// VALIDATION / Has request.body
const hasValidProperties = (req, res, next) => {
  if (!req.body.data)
    return next({
      status: 400,
      message: `Missing data from the request body.`,
    });

  next();
};

// VALIDATION / Has password requirements
const passwordIsValid = (req, res, next) => {
  const { username, password } = req.body.data;

  //   Password strength requirements - Strong Password
  const strongPasswordRequirements = {
    mininumLowercase: "(?=.*[a-z])", //   3. Password must contain at least 1 lowercase letter. (?=.*[a-z])
    minimumUppercase: "(?=.*[A-Z])", //   2. Password must contain at least 1 uppercase letter. (?=.*[A-Z])
    minimumDigits: "(?=.*[0-9])", //   4. Password must contain at least 1 number. (?=.*[0-9])
    minimumSpecialCharacter: "(?=.*[^A-Za-z0-9])", //   5. Password must contain at least 1 special character. ([^A-Za-z0-9])
    minimumCharacters: "(?=.{8,})", //   1. Password must be at least 8 characters in length. (?=.{8,})
  };

  const passwordCheck = Object.values(strongPasswordRequirements).join("");

  let isStrongPassword = new RegExp(passwordCheck);

  if (!isStrongPassword.test(password)) {
    return next({
      status: 400,
      message: `Password ${password} is not strong enough.`,
    });
  }

  console.log("Entered password:", password);

  next();
};

const userExists = async (req, res, next) => {
  //   get categoryId from req.params
  const { user_name, email } = req.body;
  console.log("body", req.body);

  // read category from db
  const user = await userLoginService.read(user_name, email);
  console.log("user:", user);

  // Check if category id is found
  if (user) {
    console.log("Found user:", user);
    res.locals.user = user;
    return next();
  }

  next({ status: 404, message: "Cannot find user." });
};

// =============================================================================================
// Resources functions =========================================================================
// =============================================================================================

// List Users, Search User by Username
const list = async (req, res, next) => {
  const { search } = req.query;
  console.log("search:", search);

  let data = null;

  if (search) {
    data = await userLoginService.searchByUsername(search);
  } else {
    data = await userLoginService.list();
  }

  console.log("data:", data);

  res.json({ data });
};

const read = async (req, res, next) => {
  const data = res.locals.user;

  console.log("data:", data);

  res.json({ data });
};

const create = async (req, res, next) => {
  const body = req.body.data;
  console.log("From req.body:", body);

  res.json({ body });
};

// Login User
const login = async (req, res, next) => {
  const { username, password } = req.body.data;
  console.log("body", req.body);

  try {
    const user = await users.find(
      (user) => username === user.username && password === user.password
    );
    console.log(user);

    if (user) {
      res.status(200).json({ data: user });
    } else {
      next({ status: 403, message: "User not found" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(userExists), asyncErrorBoundary(read)],
  create: [
    asyncErrorBoundary(hasValidProperties),
    asyncErrorBoundary(passwordIsValid),
    asyncErrorBoundary(create),
  ],
  // login: [asyncErrorBoundary(userCredentialsIsValid), login],
};
