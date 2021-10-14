const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const route = require("./src/routes/route");
const auth = require("./src/routes/auth");
const { db } = require("./src/db/connection");
const cookieParser = require("cookie-parser");

const publicDirectory = path.join(__dirname, "./public");
const template_path = path.join(__dirname, "./templates/views");
const partials_path = path.join(__dirname, "./templates/partials");

app.use(express.static(publicDirectory));
//routing middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

//view engine
app.set("view engine", "hbs");
app.set("views", template_path);

//register partials
hbs.registerPartials(partials_path);

//routes
app.use("/", route);
app.use("/", auth);

//db connection
db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Mysql Database is connected Succesfully");
  }
});

//Port for server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});
