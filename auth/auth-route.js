const express = require("express");
const bcrypt = require("bcryptjs");
const Users = require("../user/user-model");
const jwt = require("jsonwebtoken");
const secrets = require("../config/secrets");
const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await Users.findBy({ username }).first();
    //check is username is available
    console.log("users come here", user);
    if (user) {
      return res.status(409).json({
        message: "Username is already taken.",
      });
    }

    res.status(201).json(await Users.add(req.body));
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await Users.findBy({ username }).first();
    console.log("come on start working", user);
    const passwordValid = await bcrypt.compare(password, user.password);
    console.log("is it correct password", passwordValid);
    if (user && passwordValid) {
      req.session.user = user;
      const token = generateToken(user);
      console.log("token token works", token);
      res.status(200).json({ id: user.id, username: user.username, token });
    } else {
      res.status(401).json({ message: "User cannot be found." });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "There was an error accessing your account." });
  }
  //Assume the token can be seen by anyone
  //DO NOT send sensitive data.
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    character: user.char_name,
  };
  // const options = {
  //   expiresIn: "1h", //This sweet little option come from the jwt library.
  // };

  return jwt.sign(payload, secrets.jwtSecret);
}

router.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.json({
          message: "You could not be logged out!",
        });
      } else {
        res.status(200).json({
          message: "You have been logged out.",
        });
      }
    });
  } else {
    res.status(200).json({ message: "You weren't even logged in." });
  }
});

module.exports = router;
