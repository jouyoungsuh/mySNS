const express = require('express');
const router = express.Router();
const topUI = require('../lib/topUI');

router.get('/', function (req, res) {
  var title = 'Welcome to mySNS';
  var description = 'Please enjoy my very first personal project';
  var list = req.list;

  //error control
  var msg = '';
  var fmessage = req.flash();
  if (fmessage.error) {
    msg = fmessage.error[0];
  }

  res.render('index', {title: title, description:description, topUIstatus: topUI.status(req, res), list:list, msg:msg});
});

module.exports = router;