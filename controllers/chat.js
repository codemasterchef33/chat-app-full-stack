const Chat = require("../models/chats");
const User = require("../models/user");
const fs = require('fs');
require('dotenv').config()

// const S3Services = require("../services/S3services");
const s3 = require("../services/S3services");
const uploadData = require('../models/uploaddata');

exports.postMessage = async (req, res, next) => {
  const { message } = req.body;
  const groupId = req.params.groupId;
  try {
    if (!message || !groupId) {
      return res.status(400).json({
        message: "nothing entered!",
      });
    }
    const data = await req.user.createChat({
      message,
      groupId,
    });
    const arr = [];
    const details = {
      id: data.id,
      groupId: data.groupId,
      name: req.user.name,
      message: data.message,
      createdAt: data.createdAt,
    };
    arr.push(details);
    res.status(201).json({
      arr,
      message: "Message added to db!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to send messages!",
    });
  }
};

exports.getMessage = async (req, res, next) => {
  let msgId = req.query.lastmsgid;
  const groupId = req.params.groupId;

  try {
    const data = await Chat.findAll({
      where: {
        groupId
      },
    });
    let index = data.findIndex((chat) => chat.id == msgId);
    let msgtosend = data.slice(index + 1);
    let arr = [];
    for (let i = 0; i < msgtosend.length; i++) {
      const user = await User.findByPk(msgtosend[i].userId);
      const details = {
        id: msgtosend[i].id,
        groupId: msgtosend[i].groupId,
        name: user.name,
        message: msgtosend[i].message,
        createdAt: msgtosend[i].createdAt,
      };
      arr.push(details);
    }
    res.status(200).json({
      arr,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve chats!",
    });
  }
};
exports.postFile = async (req, res) => {
  try {
    if (req.file != undefined) {
      let type = (req.file.mimetype.split('/'))[1];
      console.log('type', type)
      let file = req.file.buffer
      const filename = `GroupChat/${new Date()}.${type}`;
      const fileUrl = await s3.updloadToS3(file, filename);
      let msg = fileUrl
      await uploadData.create({
        name: req.user.name,
        fileName: filename,
        fileUrl: fileUrl,
        userId: req.user.id,
        groupId: req.params.groupId
      });

      res.status(201).json({
        name: req.user.name,
        success: true,
        message: msg,
        fileName: filename,
        userId: req.user.id,
        groupId: req.params.groupId
      })
    };

  } catch (error) {
    res.status(400).json({ success: false, message: error });
  }
}

exports.getAllFIles = async (req, res, next) => {
  try {
    console.log('gid', req.query.groupId)
    let data = await uploadData.findAll({ where: { groupId: req.query.groupId } })
    let urls = data
    console.log('data', data)
    if (!urls) {
      res.status(404).json({ message: 'No URLs found!', success: false });
    }
    res.status(200).json({ urls, success: true });
  } catch (error) {
    res.status(500).json({ error });
  }
}