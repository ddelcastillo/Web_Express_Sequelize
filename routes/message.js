const express = require("express");
const router = express.Router();
const ws = require("../wslib");
const Joi = require("joi");
const { Message } = require("../models/message");

const validateMessage = (msg) => {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    ts: Joi.number().integer(),
    author: Joi.string()
      .pattern(new RegExp("(^[a-zA-Z]+[ ][a-zA-Z]+)"))
      .required(),
  });
  return schema.validate(msg);
};

router.get("/", function (req, res, next) {
  Message.findAll().then((result) => {
    res.send(result);
  });
});

router.get("/:ts", function (req, res, next) {
  Message.findOne({ where: { ts: req.params.ts } }).then((result) => {
    if (result === null) return res.status(404).send("No message found.");
    else res.send(result);
  });
});

router.post("/", function (req, res, next) {
  const { error } = validateMessage(req.body);
  if (error) {
    return res.status(400).send("Invalid message.");
  }
  Message.create({
    message: req.body.message,
    ts: req.body.ts,
    author: req.body.author,
  }).then((result) => {
    console.log(result);
    res.send(result);
  });
  ws.sendMessages();
});

router.put("/:ts", function (req, res, next) {
  let msg = req.body;
  const { error } = validateMessage(msg);
  if (error) {
    return res.status(400).send("Invalid message.");
  }
  Message.update(msg, { where: { ts: req.params.ts } }).then((result) => {
    if (result[0] === 0) return req.status(404).send("No message found.");
    res.send(msg);
    ws.sendMessages();
  });
});

router.delete("/:ts", function (req, res, next) {
  Message.destroy({ where: { ts: req.params.ts } }).then((result) => {
    if (response === 0) {
      res.status(404).send("No message found.");
      return;
    }
    res.status(200).send("Message deleted.");
    ws.sendMessages();
  });
});

module.exports = router;
