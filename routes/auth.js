const express = require('express');
const router = express.Router();
const topUI = require('../lib/topUI');
const shortid = require('shortid');
const db = require('../lib/db');
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
  router.get('/login', function (req, res) {
    //error message popup control
    var msg = '';
    var fmessage = req.flash();
    if (fmessage.error) {
      msg = fmessage.error[0];
    }

    var title = 'Login Page';
    var list = req.list;
    res.render('login', {title: title, topUIstatus: topUI.status(req, res), list:list, msg:msg});
  });

  router.post('/login_process',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/auth/login',
      failureFlash: true,
      successFlash: true
  }));

  router.get('/register', function (req, res) {
    var msg = '';
    var fmessage = req.flash();
    if (fmessage.error) {
      msg = fmessage.error[0];
    }
    var title = 'SignUp Page';
    var list = req.list;
    res.render('signUp', {title: title, topUIstatus: topUI.status(req, res), list:list, msg:msg});
  });

  router.post('/register_process', function (req, res) {
    var post = req.body;
    var email = post.email;
    var password = post.password1;
    var p2 = post.password2;
    var nickname = post.nickname;

    db.query(`SELECT * FROM user WHERE user.email = ?`,[email], function (err, result) {
      if (err) throw err;
      else {
        var existingEmail = result[0];
        if ((existingEmail == !null) || (existingEmail.email == email)) {
          req.flash('error', 'Email already exists');
          res.redirect('/auth/register');
        }
        else if (password !== p2) {
          req.flash('error', 'Please check your two passwords for verification');
          res.redirect('/auth/register');
        } else {
          bcrypt.hash(password, 10, function (err, hash) {
            var user = {
              id: shortid.generate(),
              email: email,
              password: hash,
              nickname: nickname
            };
            db.query(
            `
              INSERT INTO user (id, email, password, nickname) VALUES(?, ?, ?, ?)
            `,
              [user.id, user.email, user.password, user.nickname]
            );
    
            req.login(user, function (err) {
              console.log('redirect');
              return res.redirect('/');
            })
          });
        }
      }
    });
  });

  router.get('/logout', function (req, res) {
    req.logout();
    req.session.save(function () {
      res.redirect('/');
    });
  });

  return router;
}