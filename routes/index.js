var express = require("express");
var usersModel = require("./users");
var postsModel = require("./posts");
const passport = require("passport");
var router = express.Router();
const localStrategy = require("passport-local").Strategy;
const upload = require("./multer.js");

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

router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await usersModel.findOne({
    username: req.session.passport.user,
  }).populate("posts");
  // const posts = await postsModel.find({
  //   username: req.session.passport.user,
  // });
  res.render("profile", { nav: true, user });
});

router.get("/editprofile", isLoggedIn, async function (req, res) {
  const user = await usersModel.findOne({
    username: req.session.passport.user,
  });
  res.render("editprofile", { user });
});

router.post(
  "/updateprofile",
  upload.single("image"),
  isLoggedIn,
  async function (req, res) {
    let user = await usersModel.findOneAndUpdate(
      { username: req.session.passport.user },
      {
        username: req.body.username,
        name: req.body.name,
        description: req.body.description,
      },
      { new: true }
    );
    if (req.file) {
      user.profilePicture = req.file.filename;
    }
    await user.save();
    res.redirect("/profile");
  }
);

router.get("/home", isLoggedIn, async function (req, res) {
  const user = await usersModel.findOne({
    username: req.session.passport.user,
  });
  const posts = await postsModel.find().populate("user");
  console.log(posts);
  res.render("home", { nav: true, posts, user });
});

router.get("/feed", isLoggedIn, function (req, res) {
  res.render("feed", { nav: true });
});

router.get("/searchuser", isLoggedIn, function (req, res) {
  res.render("searchuser", { nav: true });
});

router.get("/addpost", isLoggedIn, function (req, res) {
  res.render("addpost");
});

router.post(
  "/uploadpost",
  upload.single("photo"),
  isLoggedIn,
  async function (req, res) {
    const user = await usersModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postsModel.create({
      image: req.file.filename,
      caption: req.body.caption,
      user: user._id,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/home");
  }
);

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

router.post(
  "/login",
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
