
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql2');

var connection = mysql.createPool({

    connectionLimit: 30,

    host: "pbvweb01v",

    user: "intern",

    password: "intern21",

    database: "erpsystem"

});
// var user = {user:'',password:''}
module.exports = function(passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the sessio
    console.log('passport')
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    // used to deserialize the user
    passport.deserializeUser(function (user, done) {
        // done(null, user);
        // console.log(user)
        connection.getConnection(function(err,auth_de){
            if (err) return done(err);
            auth_de.query('SELECT user,password,note from setup_user WHERE user="'+user[0].user+'";',function(err,user){	
                auth_de.release()
                if (err) return done(err);
                // console.log(user)
                done(err, user);
        });
        });
    });
    //=========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            
            function (req, username, password, done) { // callback với username và password từ html form
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                // tìm một user với email
                // chúng ta sẽ kiểm tra xem user có thể đăng nhập không
                console.log(username);
                connection.getConnection(function(err,auth_con){
                    if (err) return done(err);
                    console.log (username);
                    console.log (password);
                    sql_auth='SELECT user,password,note,Department from setup_user WHERE user="'+username+'";'
                    console.log(sql_auth)
                    auth_con.query(sql_auth,function(err,user){
                        auth_con.release();
                        if (err) return done(err);
                        console.log(user)
                        if (user.length>0){
                            if (password==user[0].password){
                                console.log('User login succes')
                                return done(null, user);
                            } else{
                                return done(null, false);
                            }
                        } else {
                            return done(null, false);
                        }
                    })
                })
            })
        );
};
