require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");

const auth = require("../middleware/auth");
const {
  seedUsers,
  seedBoards,
  seedCards,
  seedComments,
} = require("../models/seeds");

const { body, validationResult } = require("express-validator");

////////////////////////////////
// ADD Seed users data after Encrypting the Password
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
////////////////////////////////////////////////////////////////////////////////////////////////
// Users API
////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////
// User Registration
////////////////////////////////
/*
req.body => 
{
    "email":"randomCEO@generalassemb.ly",
    "password":"password12345",
    "password1": "password12345",
    "name":"GACEO",
    "friends": ["desmond.lim@generalassmb.ly","nyna.yusof@generalassemb.ly","zhenhao.chen@generalassemb.ly"]
}
*/
router.put(
  "/register",
  [
    body(
      "password",
      "Invalid password need to be at least 12 characters (alphanumeric only)"
    )
      .not()
      .isEmpty()
      .isLength({ min: 12 })
      .isAlphanumeric(),
    body("email", "Invalid email").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ status: "error", message: "email already exist" });
      }
      if (req.body.password !== req.body.password1) {
        return res
          .status(400)
          .json({ status: "error", message: "password does not match" });
      }

      let friend;
      const newFriends = [];
      for (let i = 0; i < req.body.friends.length; i++) {
        friend = await User.findOne({ email: req.body.friends[i] });
        if (friend) {
          newFriends.push(friend._id);
        } else {
          return res.json(`${req.body.friends[i]} does not exist`);
        }
      }

      //12 is how many times it runs through the salt
      const hash = await bcrypt.hash(req.body.password, 12);
      const createdUser = await User.create({
        email: req.body.email,
        hash,
        name: req.body.name,
        friends: [...newFriends],
      });

      console.log("created user: ", createdUser);
      res.json({ status: "ok", message: "user created" });
    } catch (err) {
      console.log("PUT /create", err);
      res
        .status(400)
        .json({ status: "error", message: "an error has occurred" });
    }
  }
);

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
router.post(
  "/login",
  // [
  //   body("email", "email is required").isEmail(),
  //   body("password", "password is rquired").not().isEmail(),
  // ],
  async (req, res) => {
    try {
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res
      //     .status(400)
      //     .json({ status: "error", message: errors.array() });
      // }

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
        return res
          .status(401)
          .json({ status: "error", message: "login failed" });
      }
      const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        friends: user.friends,
      };

      const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
        expiresIn: "15m",
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
  }
);

////////////////////////////////
// User Refresh Access Token
////////////////////////////////
/*
User input to req body => 
{
    "refresh": "{{refresh_token}}"
}

Test =>
let jsonData= pm.response.json();
pm.environment.set("access_token", jsonData['access']);
*/
router.post("/refresh", (req, res) => {
  try {
    const decoded = jwt.verify(req.body.refresh, process.env.REFRESH_SECRET);

    const payload = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      isAdmin: decoded.isAdmin,
      createdAt: decoded.createdAt,
      updatedAt: decoded.updatedAt,
      friends: decoded.friends,
    };

    const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: "15m",
      jwtid: uuidv4(),
    });

    const response = { access };
    res.json(response);
  } catch (err) {
    console.log("POST /refresh", err);

    res.status(401).json({
      status: "error",
      message: "unauthorised",
    });
  }
});

////////////////////////////////
// Display User Info (protected endpoint)
////////////////////////////////

router.get("/display/user", auth, async (req, res) => {
  const users = await User.findOne({ _id: req.decoded.id });
  res.json(users);
});

////////////////////////////////
// Update User Info (protected endpoint)
////////////////////////////////
/*
req.body => 
{
    "email": "updated.email@generalassemb.ly",
    "password":"password12345",
    "password1": "password12345",
    "name": "updated.name"
    
  }
*/

router.patch(
  "/update/user",
  [
    auth,
    body(
      "password",
      "Invalid password need to be at least 12 characters (alphanumeric only)"
    )
      .not()
      .isEmpty()
      .isLength({ min: 12 })
      .isAlphanumeric(),
    body("email", "Invalid email").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (req.body.password !== req.body.password1) {
      return res
        .status(400)
        .json({ status: "error", message: "password does not match" });
    }
    const user = await User.findOne({ _id: req.decoded.id });
    user.email = req.body.email || user.email;
    user.name = req.body.name || user.name;

    const password = await bcrypt.hash(req.body.password, 12);
    user.hash = password || user.hash;

    await user.save();

    res.json(user);
  }
);

///////===== Admin Endpoints =====/////////////////////////////////

////////////////////////////////
// Display all Users Info (protected endpoint)
////////////////////////////////

router.get("/admin/display/users", auth, async (req, res) => {
  if (req.decoded.isAdmin) {
    const users = await User.find();
    res.json(users);
  } else {
    res.json({ message: "cannot access, need to be an Admin" });
  }
});

////////////////////////////////
// Update isAdmin property
////////////////////////////////

/*
User input to req body => 
{
    "email": "zhenhao.chen@generalassemb.ly",
    "isAdmin": true
  }
*/

router.patch(
  "/admin/update/isadmin",
  [
    auth,
    body("isAdmin", "Invalid isAdmin value(boolean only)")
      .not()
      .isEmpty()
      .isBoolean(),
  ],
  async (req, res) => {
    if (req.decoded.isAdmin) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "user does not exist" });
      }

      user.isAdmin = req.body.isAdmin || user.isAdmin;

      if (req.body.isAdmin === false) {
        user.isAdmin = req.body.isAdmin;
      }

      await user.save();
      res.json(user);
    } else {
      res.json({ message: "cannot access, need to be an Admin" });
    }
  }
);

module.exports = router;
