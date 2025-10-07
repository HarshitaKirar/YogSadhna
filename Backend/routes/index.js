var express = require("express");
var router = express.Router();
const { register, login } = require("../model/user");
const { getProfile, updateProfile } = require("../controllers/userController");
const { createBlog, updateBlog, deleteBlog, likeBlog, addComment } = require('../controllers/blogController');
const { getLibrary, suggestBook, likeBook, addReview, addComment: addBookComment } = require('../controllers/libraryController');
const { getAdminDashboard, createClass, updateClass, deleteClass, getClassChat, sendMessage: sendClassMessage } = require('../controllers/adminController');
const { getClasses, enrollClass } = require('../controllers/classController');
const { getDincharya, sendMessage: sendDincharyaMessage, deleteMessage } = require('../controllers/dincharyaController');
const { requireAdmin } = require('../middleware/adminAuth');
const upload = require("../middleware/upload");
const blogUpload = require('../middleware/blogUpload');
const dincharyaUpload = require('../middleware/dincharyaUpload');

// Authentication middleware
function isLoggedIn(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}

// Check if user is logged in (for API)
function checkAuth(req, res, next) {
  if (req.session.user) {
    req.user = req.session.user;
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/register", function (req, res, next) {
  res.render("register", { error: req.flash("error") });
});

router.get("/login", function (req, res, next) {
  res.render("login", { error: req.flash("error") });
});

router.get("/About", function (req, res, next) {
  res.render("about");
});

router.get("/classes", getClasses);
router.post("/classes/enroll/:id", isLoggedIn, enrollClass);

router.get("/services", function (req, res, next) {
  res.render("services");
});

router.get("/contact", function (req, res, next) {
  res.render("contact");
});

router.get("/blog", function (req, res, next) {
  res.render("blog");
});

router.get("/library", getLibrary);

router.get("/dincharya", isLoggedIn, getDincharya);
router.post("/dincharya/message", isLoggedIn, dincharyaUpload.single('media'), sendDincharyaMessage);
router.post("/dincharya/delete/:id", isLoggedIn, deleteMessage);

router.get("/profile", isLoggedIn, getProfile);

router.post(
  "/profile/update",
  isLoggedIn,
  upload.single("profilePhoto"),
  updateProfile
);

router.post("/profile/remove-photo", isLoggedIn, async function (req, res) {
  try {
    const { User } = require("../model/user");
    await User.findByIdAndUpdate(req.session.user._id, {
      profilePhoto: "/images/default-avatar.png",
    });
    req.session.user.profilePhoto = "/images/default-avatar.png";
    res.redirect("/profile");
  } catch (error) {
    console.error("Remove photo error:", error);
    res.redirect("/profile");
  }
});

/* POST register */
router.post("/register", async function (req, res) {
  try {
    console.log("Register data:", req.body);
    const user = await register(req.body);
    console.log("User created:", user);
    req.session.user = user;
    res.redirect("/");
  } catch (error) {
    console.log("Register error:", error.message);
    req.flash("error", error.message);
    res.redirect("/register");
  }
});

/* POST login */
router.post("/login", async function (req, res) {
  try {
    console.log("Login data:", req.body);
    const { email, password } = req.body;
    const user = await login(email, password);
    console.log("User logged in:", user);
    req.session.user = user;
    
    // Redirect admin to admin dashboard
    if (user.isAdmin) {
      res.redirect("/admin");
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    console.log("Login error:", error.message);
    req.flash("error", error.message);
    res.redirect("/login");
  }
});

/* POST logout */
router.post("/logout", function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log("Logout error:", err);
    }
    res.redirect("/");
  });
});

/* Blog Routes */
router.post('/blog/create', isLoggedIn, blogUpload.fields([{name: 'images', maxCount: 5}, {name: 'videos', maxCount: 3}]), createBlog);
router.post('/blog/update/:id', isLoggedIn, blogUpload.fields([{name: 'images', maxCount: 5}, {name: 'videos', maxCount: 3}]), updateBlog);
router.post('/blog/delete/:id', isLoggedIn, deleteBlog);
router.post('/blog/like/:id', isLoggedIn, likeBlog);
router.post('/blog/comment/:id', isLoggedIn, addComment);

/* Library Routes */
router.post('/library/suggest', isLoggedIn, upload.single('coverImage'), suggestBook);
router.post('/library/like/:id', isLoggedIn, likeBook);
router.post('/library/review/:id', isLoggedIn, addReview);
router.post('/library/comment/:id', isLoggedIn, addBookComment);

/* Admin Routes */
router.get('/admin', requireAdmin, getAdminDashboard);
router.post('/admin/class/create', requireAdmin, createClass);
router.post('/admin/class/update/:id', requireAdmin, updateClass);
router.post('/admin/class/delete/:id', requireAdmin, deleteClass);
router.get('/admin/class/:id/chat', requireAdmin, getClassChat);
router.post('/admin/class/:id/message', requireAdmin, sendClassMessage);

/* API Routes */
router.get("/api/user", checkAuth, function (req, res) {
  res.json({ user: req.user });
});
module.exports = router;
