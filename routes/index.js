var express = require("express");
var usersModel = require("./users");
const passport = require("passport");
var router = express.Router();
const localStrategy = require("passport-local").Strategy;

passport.use(new localStrategy(usersModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index");
});

router.get("/signin", function (req, res) {
  res.render("login", { error: req.flash("error") });
});

// router.get("/nav", function (req, res) {
//   res.render("nav");
// });

router.get("/profile", isLoggedIn, function (req, res) {
  res.render("profile", {nav:true});
});

router.get("/editprofile", isLoggedIn, function (req, res) {
  res.render("editprofile", {nav:true});
});

router.get("/home", isLoggedIn, function (req, res) {
  res.render("home", {nav:true});
});

router.get("/feed", isLoggedIn, function (req, res) {
  res.render("feed", {nav:true});
});

router.get("/searchuser", isLoggedIn, function (req, res) {
  res.render("searchuser", {nav:true});
});

router.get("/addpost", isLoggedIn, function (req, res) {
  res.render("addpost", {nav:true});
});

router.get("/viewpost", isLoggedIn, function (req, res) {
  res.render("viewpost");
});

router.post("/register", function (req, res) {
  // const idToken = req.body.idtoken;
  // const clientId = '1076973195205-ej31kbtb7b1f0o3m8cdanlj330elbb2h';
  const userData = new usersModel({
    email: req.body.email,
    fullname: req.body.fullname,
    username: req.body.username,
  });
  usersModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post("/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/signin",
    failureFlash: true,
  })
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/signin");
}

module.exports = router;
