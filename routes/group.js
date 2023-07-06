const express = require("express");
const router = express.Router();

const middleware = require("../middleware/auth");
const groupController = require("../controllers/group");
const usergroupController = require("../controllers/usergroup");

router.get("/getgroups", middleware.authentication, groupController.getGroups);

router.post("/create-group", middleware.authentication, groupController.createGroup);

router.get("/fetch-users/:groupId", middleware.authentication, usergroupController.fetchUsers);

router.post('/adduser', middleware.authentication, usergroupController.addUserToGroup);

router.get('/isAdmin/:groupId', middleware.authentication, usergroupController.isAdmin);

router.post('/remove-user', middleware.authentication, usergroupController.removeUserFromGroup);

router.post('/makeAdmin', middleware.authentication, usergroupController.makeAdmin);

router.post('/removeAdmin', middleware.authentication, usergroupController.removeAdmin);

module.exports = router;
