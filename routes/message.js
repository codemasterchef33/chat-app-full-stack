const express = require("express");
const router = express.Router();
const multer = require('multer');
const middleware = require("../middleware/auth");
const chatController = require("../controllers/chat");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/postmessage/:groupId",
  middleware.authentication,
  chatController.postMessage
);

router.get(
  "/getmessage/:groupId",
  middleware.authentication,
  chatController.getMessage
);

router.post(
  "/postfile/:groupId",
  [middleware.authentication, upload.single('inputFile')],
  chatController.postFile
);

router.get(
  "/getfile?:groupId",
  middleware.authentication,
  chatController.getAllFIles
);

module.exports = router;
