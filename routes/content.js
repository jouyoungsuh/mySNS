const express = require('express');
const router = express.Router();
const topUI = require('../lib/topUI');
const db = require('../lib/db');
const shortid = require('shortid');

router.get('/create', function (req, res) {
  //check if it is verified user
  if (!topUI.checkUser(req, res)) {
    req.flash('error', 'only users can create a content')
    res.redirect('/');
    return false;
  }
  var title = 'Creating a new Content';
  var list = req.list;
  res.render('create', {title: title, topUIstatus: topUI.status(req, res), list:list});
});

router.post('/create_process', function (req, res) {
  //in case if the user is directly linked to the create_process (security issue) 
  if (!topUI.checkUser(req, res)) {
    req.flash('error', 'only users can create a content')
    res.redirect('/');
    return false;
  }
  //from post from create.jade, it allocates the values by assined name
  var post = req.body;
  var title = post.title;
  var description = post.description;
  var id = shortid.generate();
  var user_id = req.user.id;

  db.query(
    `
      INSERT INTO content (id, title, description, createdDate, creator_id) VALUES(?, ?, ?, NOW(), ?)
    `,
      [id, title, description, user_id]
  );
  res.redirect(`/content/${id}`);
});

router.get('/update/:pageId', function (req, res) {
  //check if it is verified user
  if (!topUI.checkUser(req, res)) {
    req.flash('error', 'only users can update a content')
    res.redirect('/');
    return false;
  }

  db.query(`SELECT * FROM content WHERE content.id = ?`,[req.params.pageId], function (err, result) {
    if (err) throw err;
    else {
      var content = result[0];
      if(content.creator_id !== req.user.id) {
        req.flash('error', 'only creators can update their own content');
        return res.redirect('/');
      }
      var title = content.title;
      var description = content.description;
      var list = req.list;

      res.render('update', {title: title, description: description, topUIstatus: topUI.status(req, res), 
                            list:list, contentid:content.id});
    }
  });
});

router.post('/update_process', function (req, res) {
  if (!topUI.checkUser(req, res)) {
    req.flash('error', 'only users can update a content');
    res.redirect('/');
    return false;
  }
  var post = req.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;

  db.query(`SELECT * FROM content WHERE content.id = ?`,[id], function (err, result) {
    if (err) throw err;
    else {
      var content = result[0];
      if(content.creator_id !== req.user.id) {
        req.flash('error', 'only creators can update their own content');
        return res.redirect('/');
      } 
      db.query(
        `
          UPDATE content SET content.title = ?, content.description = ? WHERE content.id = ?
        `,
        [title, description, id]
      );
      res.redirect(`/content/${content.id}`);
    }
  });
});

router.post('/delete_process', function (req, res) {
  if (!topUI.checkUser(req, res)) {
    req.flash('error', 'only users can delete a content');
    res.redirect('/');
    return false;
  }
  var post = req.body;
  var id = post.id;

  db.query(`SELECT * FROM content WHERE content.id = ?`,[id], function (err, result) {
    if (err) throw err;
    else {
      var content = result[0];
      if(content.creator_id !== req.user.id) {
        req.flash('error', 'only creators can delete their own content');
        return res.redirect('/');
      } 
      db.query(
        `
        DELETE FROM content WHERE content.id = ?
        `,
        [id]
      );
    res.redirect('/');
    }
  });
});

router.get('/:pageId', function (req, res, next) {
  db.query(`SELECT *, content.id AS 'content_id', user.id AS 'user_id'
            FROM content LEFT JOIN user ON content.creator_id = user.id 
            WHERE content.id = ?`,[req.params.pageId], 
            function (err, joinResult) {
    if (err) throw err;
    else {
      //error control
      var msg = '';
      var fmessage = req.flash();
      if (fmessage.error) {
        msg = fmessage.error[0];
      }
      var join = joinResult[0];
      var list = req.list;
      res.render('pageID', {title: join.title, description: join.description, topUIstatus: topUI.status(req, res), msg:msg,
                            list:list, content_id: join.content_id, nickname:join.nickname, createdDate: join.createdDate});
    }
  });
});
module.exports = router;