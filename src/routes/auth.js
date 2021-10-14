const express = require("express");
const router = express.Router();
const {
  register,
  login,
  uploadPic,
  profile,
  updateProfile,
  logout,
} = require("../controllers/auth");
const { auth_secure, Redirect } = require("../controllers/authmiddleware");

router.use(Redirect);

router.post("/register", uploadPic.single("image"), register);

router.post("/login", login);

router.get("/profile/:id", auth_secure, profile);

router.post(
  "/profile/update/:id",
  auth_secure,
  uploadPic.single("updatedimage"),
  updateProfile
);
// logout user
router.get("/logout", auth_secure, logout);
module.exports = router;
