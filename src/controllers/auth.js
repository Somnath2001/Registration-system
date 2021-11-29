const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { db } = require("../db/connection");
const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
port = process.env.PORT || 8086;

//storage for profiepic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploaded-images");
  },
  filename: function (req, file, cb) {
    const mimeExtension = {
      "image/jpeg": ".jpeg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
    };
    cb(null, file.fieldname + "-" + Date.now() + mimeExtension[file.mimetype]);
  },
});

//uploder for profilepic
exports.uploadPic = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/gif"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      req.fileError = "File format Invalid";
    }
  },
});

//register the user
exports.register = (req, res) => {
  const {
    firstname,
    lastname,
    email,
    contact,
    password,
    comfirm_password,
    image,
  } = req.body;

  db.query(
    `SELECT email FROM users WHERE email = ?`,
    [email],
    async (error, results) => {
      if (error) {
        console.log(error);
      }
      if (results.length > 0) {
        fs.unlinkSync(req.file.path);
        return res.render("register", {
          message: "Email Already Taken",
        });
      } else if (password !== comfirm_password) {
        return res.render("register", {
          message: "Password do not match",
        });
      }

      let hashedPassword = await bcrypt.hash(password, 8);
      // console.log(hashedPassword);

      db.query(
        `INSERT INTO users SET ?`,
        {
          firstname: firstname,
          lastname: lastname,
          email: email,
          contact: contact,
          password: hashedPassword,
          file: req.file.filename,
        },
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            // console.log(results);
            // return res.redirect("profile/" + results.insertId);
            return res.render("register", {
              message: "User Registered Successfully",
            });
          }
        }
      );
    }
  );
};

//login for user
exports.login = (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  var sql = `SELECT * FROM users WHERE email = ?;`;
  db.query(sql, [email], (error, results) => {
    if (error) {
      console.log(error);
    } else if (
      results.length > 0 &&
      bcrypt.compareSync(password, results[0].password)
    ) {
      const token = jwt.sign(
        { id: results[0].id.toString() },
        process.env.SECRET_KEY
      );

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 36000000),
        httpOnly: true,
        //   secure: true,
      });

      return res.redirect("profile/" + results[0].id);
    } else {
      return res.render("login", {
        message: "Invalid Credentials",
      });
    }
  });
};

//get the profile of user
exports.profile = (req, res) => {
  var message = "";
  var id = req.params.id;
  var sql = "SELECT * FROM `users` WHERE `id`='" + id + "'";
  db.query(sql, function (err, result) {
    if (err) {
      res.render("user", { message: "Error Occurred" });
    } else if (result.length > 0) {
      data = result[0];
      res.render("user", { data: data, env: port });
    }
  });
};

//update the user profile
exports.updateProfile = async (req, res) => {
  var id = req.params.id;
  if (id) {
    const { firstname, lastname, email, contact, password, image } = req.body;

    let updatedhashedPassword = await bcrypt.hash(password, 8);

    db.query(
      `UPDATE users SET ?`,
      {
        firstname: firstname,
        lastname: lastname,
        email: email,
        contact: contact,
        password: updatedhashedPassword,
        file: req.file.filename,
      },
      (error, results) => {
        if (error) {
          console.log(error);
          fs.unlinkSync(req.file.path);
        } else {
          var sql = "SELECT * FROM `users` WHERE `id`='" + id + "'";
          db.query(sql, function (err, result) {
            if (err) {
              res.render("user", { message: "Error Occurred" });
            } else if (result.length > 0) {
              data = result[0];
              res.render("user", {
                data: data,
                env: port,
                message: "User updated Successfully",
              });
            }
          });
        }
      }
    );
  } else {
    return res.render("user", {
      message: "User update failed",
    });
  }
};

//user logout
exports.logout = (req, res) => {
  try {
    return res.clearCookie("jwt").redirect("/");
  } catch (error) {
    return res.render("user", {
      message: "Failed to logout",
    });
  }
};
