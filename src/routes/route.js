const express = require("express");
const router = express.Router();

//home render
router.get("/", (req, res) => {
  res.render("index");
});

//signup render
router.get("/register", (req, res) => {
  res.render("register");
});

//signin render
router.get("/login", (req, res) => {
  res.render("login");
});

module.exports = router;
