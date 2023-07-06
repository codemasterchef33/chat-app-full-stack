const Group = require("../models/group");
const UserGroup = require("../models/usergroup");

exports.getGroups = async (req, res, next) => {
  try {
    let groups = await UserGroup.findAll({ where: { userId: req.user.id } });
    let data = [];
    for (let i = 0; i < groups.length; i++) {
      let group = await Group.findByPk(groups[i].groupId);
      data.push(group);
    }
    console.log(data)
    if (!data) {
      res.status(404).json({ message: "No data found!" });
    }
    res.status(200).json({ data, message: "Group info retrieved!" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.createGroup = async (req, res, next) => {
  const { group } = req.body;
  try {
    if (!group) {
      res.status(404).json({ message: "Invalid Credentials!" });
    }
    let data = await req.user.createGroup({ name: group }, { through: { isAdmin: true } });
    res.status(201).json({ message: "Successfully created new group!" });
  } catch (error) {
    return res.status(500).json(error);
  };
};
