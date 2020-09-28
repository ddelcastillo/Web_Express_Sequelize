const express = require("express");
const router = express.Router();
const ws = require("../wslib");
const Joi = require("joi");
const { Message } = require("../models/message");

const validate = (message) => {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    ts: Joi.number().integer(),
    author: Joi.string()
      .pattern(new RegExp("(^[a-zA-Z]+[ ][a-zA-Z]+)"))
      .required(),
  });
  let { error } = schema.validate(message);
  if (error) return error.message;
  else return undefined;
};

router.get("/chat/api/messages", function (req, res, next) {
  Message.findAll().then((result) => {
    res.send(result);
  });
});

router.get("/chat/api/messages/:ts", function (req, res, next) {
  Message.findOne({ where: { ts: req.params.ts } }).then((result) => {
    if (result === null) return res.status(404).send("No message found.");
    else res.send(result);
  });
});

router.post("/chat/api/messages", function (req, res, next) {
  let msg = req.body;
  let val = validate(msg);
  if (val) {
    res.status(400).send(val);
    return;
  } else {
    Message.create({
      message: req.body.message,
      ts: req.body.ts,
      author: req.body.author,
    }).then((result) => {
      console.log(result);
      res.send(result);
    });
  }
  ws.sendMessages();
});

router.put("/chat/api/messages/:ts", function (req, res, next) {
  let msg = req.body;
  let val = validate(msg);
  if (val) {
    res.status(400).send(val);
    return;
  }
  Message.update(msg, { where: { ts: req.params.ts } }).then((result) => {
    if (result[0] === 0) return req.status(404).send("No message found.");
    res.send(msg);
    ws.sendMessages();
  });
});

router.delete("/chat/api/messages/:ts", function (req, res, next) {
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
