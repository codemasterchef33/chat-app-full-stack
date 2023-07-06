const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const chatController = require("../controllers/chat");
const middleware = require("../middleware/auth");

router.post("/signup", userController.postSignup);
router.post("/login", userController.postLogin);
router.post("/postmessage", middleware.authentication, chatController.postMessage);
router.get('/getmessage', middleware.authentication, chatController.getMessage)

module.exports = router;