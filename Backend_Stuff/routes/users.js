require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");

const auth = require("../middleware/auth");
const { seedUsers, seedBoards, seedCards } = require("../models/seeds");

const { body, validationResult } = require("express-validator");

////////////////////////////////
// ADD Seed data after Encrypting the Password
////////////////////////////////

router.get("/seedUsers", async (req, res) => {
  // encrypts the given seed passwords
  hashedSeed = seedUsers.map((user) => ({
    ...user,
    hash: bcrypt.hashSync(user.hash, 12),
  }));
  // seeds the data
  await User.create(hashedSeed, (err, data) => {
    if (err) console.log(err.message);
    console.log("Added default users", data);
    res.json(data);
  });
});

////////////////////////////////
// User Login
////////////////////////////////
/*
req.body => 
{
   
    "email": "desmond.lim@generalassemb.ly",
    "password": "password12345"
}

Test =>
let jsonData= pm.response.json();
pm.environment.set("access_token", jsonData['access']);
pm.environment.set("refresh_token", jsonData['refresh']);
*/
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (req.body.email == "" || req.body.password == "") {
      return res
        .status(400)
        .json({ status: "error", message: "Please complete the input" });
    }
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "username does not exist" });
    }

    const result = await bcrypt.compare(req.body.password, user.hash);
    if (!result) {
      console.log("email or password error");
      return res.status(401).json({ status: "error", message: "login failed" });
    }
    const payload = {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      company: user.company,
    };

    const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: "20m",
      jwtid: uuidv4(),
    });
    const refresh = jwt.sign(payload, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
      jwtid: uuidv4(),
    });

    const response = { access, refresh };
    res.json(response);
  } catch (err) {
    console.log("POST /login", err);
    res.status(400).json({ status: "error", message: "login failed" });
  }
});

//Getting all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    //sending status 500 means server error
    res.status(500).json({ message: err.message });
  }
});

//Getting one user
router.get("/:id", getUser, (req, res) => {
  res.send(res.user);
});

//Creating one user (register a user)
router.post("/", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.name,
      password: hashedPassword,
      email: req.body.email,
    });
    const newUser = await user.save();
    //when sending POST use 201 status means that user successfully created something
    res.status(201).json(newUser);
  } catch (err) {
    //400 error means the user gives bad data, something wrong with the uer input
    res.status(400).json({ message: err.message });
  }
});

//Authenticate user based on username and password
router.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  //   console.log(user);
  if (user == null) {
    return res.status(400).json({ message: "Cannot find User" });
  }
  try {
    console.log(user);
    if (bcrypt.compareSync(req.body.password, user.password)) {
      const accessToken = jwt.sign(
        JSON.stringify(user),
        process.env.ACCESS_TOKEN_SECRET
      );
      res.json({ message: "Login Successful", accessToken: accessToken });
    } else {
      res.send("Not Allowed");
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

//Updating one user

//Deleting one user

//function to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

//function to check if user exist (middleWare)
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      //sending status 404 means cannot find user that is being inputed
      return res.status(404).json({ message: "Cannot find User" });
    }
  } catch (err) {
    //sending status 500 means server error
    return res.status(500).json({ message: err.message });
  }
  res.user = user;
  next();
}

module.exports = router;
