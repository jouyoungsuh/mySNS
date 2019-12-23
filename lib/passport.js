const db = require('../lib/db');
const bcrypt = require('bcryptjs');

module.exports = function (app) {
    var passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        //for debugging purposes
        //console.log('serializeUser', user);
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        db.query(`SELECT * FROM user WHERE user.id = ?`,[id], function (err, result) {
            if (err) throw err;
            else {
                var user = result[0];
                //for debugging purposes
                //console.log('deserializeUser', id, user);
                done(null, user);
            }
        });
    });

    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function (email, password, done) {
            //for debugging purposes
            //console.log('LocalStrategy', email, password);
            db.query(`SELECT * FROM user WHERE user.email = ?`,[email], function (err, result) {
                if (err) throw err;
                else {
                    var user = result[0];
                    if (!user) {
                        return done(null, false, { message: 'Incorrect email, or email does not exist.' });
                    }
                    bcrypt.compare(password, user.password, function(err, result) {
                        if(!result) {
                            return done(null, false, { message: 'Password is not correct.'});
                        }
                        else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    ));
    return passport;
}