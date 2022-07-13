require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");
const auth = require("../middleware/auth");

/*
================================================== User Login ==================================================
User input to req body => 
{
    "username": "Desmond Lim",
    "password": "password123"
}

Test =>
let jsonData= pm.response.json();
pm.environment.set("access_token", jsonData['access']);
pm.environment.set("refresh_token", jsonData['refresh']);

1. checks if user exist
2. checks if the password matches using bcrypt.compare
3. input info in the payload *don't put in sensitive information
4. generate access and refresh token using the payload and uuid
5. res.json both the token
*/
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "not authorised" });
    }
    const result = await bcrypt.compare(req.body.password, user.hash);
    if (!result) {
      console.log("username or password error");
      return res.status(401).json({ status: "error", message: "login failed" });
    }

    const payload = {
      id: user._id,
      username: user.username,
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
    console.log("POST /login", error);
    res.status(400).json({ status: "error", message: "login failed" });
  }
});

/*
================================================== use Refresh token to generate Access token ==================================================
User input to req body => 
{
    "refresh": "{{refresh_token}}"
}

Test =>
let jsonData= pm.response.json();
pm.environment.set("access_token", jsonData['access']);


1. verify Refresh Token and store in "decoded" variable
2. use the "decoded" variable to re-store the payload info
3. use the payload info and new uuid to generate access token
4. res.json the access token
*/
router.post("/refresh", (req, res) => {
  try {
    const decoded = jwt.verify(req.body.refresh, process.env.REFRESH_SECRET);

    const payload = {
      id: decoded.id,
      username: decoded.username,
    };
    const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: "20m",
      jwtid: uuidv4(),
    });

    const response = { access };

    res.json(response);
  } catch (err) {
    console.log("POST /refresh", error);
    res.status(401).json({
      status: "error",
      message: "unauthorised",
    });
  }
});

/*
================================================== Create New User ==================================================
User input to req body => 
{
    "username":"Desmond Lim",
    "password":"password123"
}


1. check for duplicate username
2. hash the user entered password
3. create a new user with the entered username and the hashed password
*/
router.put("/create", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      return res
        .status(400)
        .json({ status: "error", message: "duplicate username" });
    }

    //12 is how many times it runs through the salt
    const hash = await bcrypt.hash(req.body.password, 12);
    const createdUser = await User.create({
      username: req.body.username,
      hash,
    });

    console.log("created user: ", createdUser);
    res.json({ status: "ok", message: "user created" });
  } catch (err) {
    console.log("PUT /create", err);
    res.status(400).json({ status: "error", message: "an error has occurred" });
  }
});

/*
================================================== Show all users ==================================================
1. show all username
*/

router.get("/users", auth, async (req, res) => {
  const users = await User.find().select("username");
  res.json(users);
});
