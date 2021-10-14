const jwt = require("jsonwebtoken");

//Authentication middleware
exports.auth_secure = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    req.token = token;
    return next();
  } catch (error) {
    return res.status(401).render("index", {
      message: "No json web token found",
    });
  }
};

//Redirect for userlogout
exports.Redirect = (req, res, next) => {
  try {
    const shot = req.cookies.jwt ? true : false;
    res.locals.notice = shot;
  } catch (err) {
    console.log(err);
  }
  next();
};
