const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const initializePassport = require("./utils/passportConfig");

// Error Handling
const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");

// Import routes
const userRouter = require("./users/userLogin.router");
const homeRouter = require("./home/home.router");
const categoriesRouter = require("./categories/categories.router");
const itemsRouter = require("./items/items.router");
const searchRouter = require("./search/search.router");

const app = express();

app.use(morgan("dev"));
app.use(
  cors({
    origin: "https://inventory-manager-backend.herokuapp.com",
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);
app.use(express.json());

// Remove
initializePassport(passport);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/users", userRouter);
app.use("/", homeRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/items", itemsRouter);
app.use("/api/search", searchRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
