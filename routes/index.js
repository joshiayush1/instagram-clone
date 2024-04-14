var express = require("express");
var router = express.Router();
var usersModel = require("./users");
var postsModel = require("./posts");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const upload = require("./multer.js");

passport.use(new localStrategy(usersModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index");
});

router.get("/signin", function (req, res) {
  res.render("login", { error: req.flash("error") });
});

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

router.get("/profile/:userId", isLoggedIn, async function (req, res) {
  const user = await usersModel.findById(req.params.userId).populate("posts");
  const user2 = await usersModel.findOne({username: req.session.passport.user});
  res.render("viewprofile", { nav: true, user, user2 });
});

router.get("/home", isLoggedIn, async function (req, res) {
  const user = await usersModel.findOne({
    username: req.session.passport.user,
  });
  const posts = await postsModel.find().populate("user");
  console.log(posts);
  res.render("home", { nav: true, posts, user });
});

router.get("/feed", isLoggedIn, async function (req, res) {
  const user = await usersModel.findOne({username: req.session.passport.user});
  const posts = await postsModel.find().populate("user");
  res.render("feed", { nav: true, user, posts });
});

router.get("/like/post/:postId", isLoggedIn, async function (req, res) {
  const user = await usersModel.findOne({username: req.session.passport.user});
  const post = await postsModel.findById({_id: req.params.postId});
  
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.redirect("/home");
});

router.get("/tolike/post/:postId", isLoggedIn, async function (req, res) {
  const user = await usersModel.findOne({username: req.session.passport.user});
  const post = await postsModel.findById({_id: req.params.postId});
  
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.redirect("/post/" + req.params.postId);

});

router.get("/comments/post/:postId", isLoggedIn, async function(req, res){
  const user = await usersModel.findOne({ username: req.session.passport.user });
  const post = await postsModel.findOne({_id: req.params.postId}).populate("comments");
  res.render("comments", {post, user});
});

router.post("/tocomments/post/:postId", isLoggedIn, async function(req, res){
  const user = await usersModel.findOne({ username: req.session.passport.user });
  const post = await postsModel.findOne({ _id: req.params.postId });

  const { username, profilePicture } = user; 
  const { comment } = req.body; 

  const value = req.body.comment; 
  post.comments.push({ user: user._id, content: value, username, profilePicture }); 
  await post.save();
  res.redirect("/comments/post/" + req.params.postId);
});

router.get("/follow/user/:userId", async function(req, res){
  const user = await usersModel.findOne({username: req.session.passport.user});
  const user2 = await usersModel.findOne({_id: req.params.userId});

  if(user2.followers.indexOf(user._id) === -1){
    user2.followers.push(user._id);
    user.following.push(user2._id);
  }
  else{
    user2.followers.splice(user2.followers.indexOf(user._id), 1);
    user.following.splice(user.following.indexOf(user2._id), 1);
  }
  await user.save();
  await user2.save();
  res.redirect("/profile/" + req.params.userId);
})

router.get('/post/:postId', async (req, res) => {
  const user = await usersModel.findOne({username: req.session.passport.user});
  const post = await postsModel.findById(req.params.postId).populate("user");
  res.render('viewpost', { post, user });
});

router.get("/searchuser", isLoggedIn, function (req, res) {
  res.render("searchuser", { nav: true });
});

router.get("/searchuser/:username", isLoggedIn, async function (req, res) {
  const regex = new RegExp(`^${req.params.username}`, 'i');
  const users = await usersModel.find({username: regex});
  res.json(users);
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
