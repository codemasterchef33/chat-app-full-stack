const User = require('../models/user');
const Group = require('../models/group');
const Usergroup = require('../models/usergroup');

exports.fetchUsers = async (req, res, next) => {
    try {
        let groupId = req.params.groupId;
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Cannot find group!' });
        };
        let users = await group.getUsers();
        let data = users.filter(user => user.id != req.user.id);
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error, message: "Some error occured!" });
    };
};

exports.addUserToGroup = async (req, res, next) => {
    const { email, groupId } = req.body;

    try {
        let user = await User.findOne({ where: { email } });
        let group = await Group.findByPk(groupId);
        if (!user || !group) {
            return res.status(404).json({ message: "User not found!" });
        }
        const check = await group.hasUser(user);
        if (check) {
            return res.status(401).json({ message: "User already in group" })
        }
        const data = await group.addUser(user, { through: { isAdmin: false } });
        return res.status(200).json({ user, message: "Added user to group!" });
    } catch (error) {
        res.status(500).json({ error, message: "Some error occured!" });
    };
};

exports.isAdmin = async (req, res, next) => {
    let groupId = req.params.groupId;
    try {
        if (!groupId) {
            return res.status(400).json({ message: 'No group id found!' });
        };
        let group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: "no group found!" });
        }
        let row = await Usergroup.findOne({ where: { userId: req.user.id, groupId: groupId } });
        let isAdmin = row.isAdmin;
        return res.status(200).json(isAdmin);
    } catch (error) {
        res.status(500).json({ error, message: "unexpected error!" });
    };
};

exports.removeUserFromGroup = async (req, res, next) => {
    const { userId, groupId } = req.body;
    try {
        if (!userId || !groupId) {
            return res.status(400).json({ message: 'no group id found' });
        }
        let row = await Usergroup.findOne({ where: { userId: req.user.id, groupId: groupId } });
        let isAdmin = row.isAdmin;
        if (!isAdmin) {
            return res.status(402).json({ message: 'not Admin!' });
        };
        let user = await User.findByPk(userId);
        let group = await Group.findByPk(groupId);
        if (!user || !group) {
            return res.status(404).json({ message: 'no group or user found' });
        }
        let result = await group.removeUser(user);
        if (!result) {
            return res.status(401).json({ message: 'unable to remove user' });
        }
        return res.status(200).json({ user, message: "user removed" });

    } catch (error) {
        res.status(500).json({ message: "some error occured", error });

    };
};

exports.makeAdmin = async (req, res, next) => {
    const { userId, groupId } = req.body;
    try {
        if (!userId || !groupId) {
            return res.status(400).json({ message: 'no group id found!' });
        };
        let row = await Usergroup.findOne({ where: { userId: req.user.id, groupId: groupId } });
        let isAdmin = row.isAdmin;
        console.log('isAdmin', isAdmin)
        if (!isAdmin) {
            console.log('Be a admin first')
            return res.status(402).json({ message: 'Not Admin/Authorized to make changes!' });
        };
        let user = await User.findByPk(userId);
        let group = await Group.findByPk(groupId);

        if (!user || !group) {
            return res.status(404).json({ message: "no group or user found!" });
        };
        let result = await group.addUser(user, { through: { isAdmin: true } });
        if (!result) {
            return res.status(401).json({ user, message: "Unable to make Admin" });
        }
        return res.status(200).json({ user, message: "User is Admin now!" });
    } catch (error) {
        res.status(500).json({ error, message: "some error occured" });
    };
};

exports.removeAdmin = async (req, res, next) => {
    const { userId, groupId } = req.body;
    try {
        if (!userId || !groupId) {
            return res.status(400).json({ message: 'no group id found' });
        }
        let row = await Usergroup.findOne({ where: { userId: req.user.id, groupId: groupId } })
        let isAdmin = row.isAdmin;
        if (!isAdmin) {
            return res.status(402).json({ message: 'not admin' });
        }

        let user = await User.findByPk(userId);
        let group = await Group.findByPk(groupId);

        if (!user || !group) {
            return res.status(404).json({ message: 'no group or user found' });
        }
        let result = await group.addUser(user, { through: { isAdmin: false } });
        if (!result) {
            return res.status(401).json({ message: 'Unable to make Admin!' });
        }
        return res.status(200).json({ user, message: "User is Admin now!" });

    } catch (err) {
        res.status(500).json({ err, message: "Some error occured!" });
    };
};