import express from "express";
import mongoose from "mongoose";
import { User } from "./Models/User.js";
import path from "path";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { userInfo } from "os";

cloudinary.config({
  cloud_name: "dlaccpuyp",
  api_key: "975179542768573",
  api_secret: "QySIC2jcU7RykIamWBH2LTmGYfQ",
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));


const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// localhost:5000/
// user login page
app.get("/", (req, res) => {
  res.render("login.ejs");
});
// user Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    console.log("getting user", user);
    if (!user) res.render("login.ejs");
    else if (user.password != password) {
      res.render("login.ejs");
    } else {
      res.render("Profile.ejs", { user });
    }
  } catch (error) {
    res.send(error);
  }
});

// localhost:5000/register
// user register page
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// user register route
app.post("/register", upload.single("profile"), async (req, res) => {
  const file = req.file.path;
  const { name, email, password } = req.body;
  try {
    const cloudinaryRes = await cloudinary.uploader.upload(file, {
      folder: "Nodejs_authantication_app",
    });

    let user = await User.create({
      name,
      email,
      password,
      profileimage: cloudinaryRes.secure_url,
    });

    res.redirect("/");

    console.log(cloudinaryRes, name, email, password);
  } catch (error) {
    res.send(error);
  }
});

// localhost:5000/user
// user list page
app.get("/users", async (req, res) => {
  try {
    let users = await User.find().sort({ createdAt: -1 });
    res.render("Users.ejs", { users });
  } catch (error) {
    res.send(error);
  }
});

// 🟢 MongoDB connection
mongoose
  .connect(
    "mongodb+srv://pawardeepanshu97_db_user:92C3f552RXaQfXeZ@cluster0.o2741zl.mongodb.net/",
    {
      dbName: "Nodejs_express_api_series",
    }
  )
  .then(() => console.log("Connected to the database"))
  .catch((error) => console.log(error));

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
