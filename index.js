var http = require("http");

const upload=require("express-fileupload")

const express = require("express")

var path = require("path");

var formidable= require("formidable")

var fs = require('fs');

var bodyParser = require("body-parser");

var mysql = require('mysql2');

const { text } = require("body-parser");

var bodyParser = require('body-parser');

const { type } = require("os");

const app = express()

app.use(bodyParser()); // lấy thông tin từ html forms

app.set("views", path.resolve(__dirname, "views"));

app.set("view engine", "ejs");

var publicPath = path.resolve(__dirname, "public");

app.use("/public", express.static(publicPath));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));

var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var logger = require("morgan");

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');

require('./config/passport.js')(passport); // pass passport for configuration
// cài đặt ứng dùng express
// app.use(morgan('dev')); // log tất cả request ra console log
app.use(cookieParser()); // đọc cookie (cần cho xác thực)
app.use(bodyParser()); // lấy thông tin từ html forms
app.use(session({ secret: 'ilovescodetheworld' })); // chuối bí mật đã mã hóa coookie
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
// routes ======================================================================

require('./app/fm.js')(app, passport); // Load routes truyền vào app và passport đã config ở trên
require('./app/ecf.js')(app, passport); // Load routes truyền vào app và passport đã config ở trên
var entries = [];
app.locals.entries = entries;
const port = process.env.PORT || 80;
app.use(logger("dev"));

// app.use(bodyParser.urlencoded({ extended: false }));


var server = require("http").Server(app);
server.listen(port,'10.113.90.198')

var conn = mysql.createPool({

    connectionLimit: 30,

    host: "pbvweb01v",

    user: "intern",

    password: "intern21",

    database: "fm"

});
module.exports = conn;

// app.get('/', function(req, res) {
//     res.render('home.ejs')
// });
app.get('/loading_data', function(req, res) {

    conn.getConnection(function(err, connection) {

        if (err) throw err;

        console.log("Connected!");

        var sql_book = 'SELECT * FROM spare ;';
        console.log(sql_book);

        connection.query(sql_book, function(err, jsonObject, fields) {

            if (err) throw err;

            connection.release();

            res.send(jsonObject);

            res.end();

        });
    });
});

app.post('/spare/update', function(req, res) {

    var id = req.body.id;
    var category = req.body.category;
    var quanity = req.body.quanity;
    var limit = req.body.limit;
    var unit = req.body.unit;
    var brand = req.body.brand;
    var desc = req.body.desc;
    var pos = req.body.pos;
    var status = req.body.status;
    var expired =req.body.expired;
    var image = req.body.image;
    imagee= "./public/img_spare/"+image;

    conn.getConnection(function(err, conupline) {
        if (err) throw err;
        if (imagee == "./public/img_spare/undefined")
        {
            var sql_spare = 'update spare set category="' + category + '",qty="' + quanity + '",limitt="' + limit + '",unit="' + unit + '",brand="' + brand + '",descc="' + desc + '",pos="' + pos + '",statuss="' + status + '",expired="' + expired + '" where id="' + id+ '";'
        }
        else
        {
            var sql_spare = 'update spare set image="'+ imagee +'", category="' + category + '",qty="' + quanity + '",limitt="' + limit + '",unit="' + unit + '",brand="' + brand + '",descc="' + desc + '",pos="' + pos + '",statuss="' + status + '",expired="' + expired + '" where id="' + id+ '";'
        }
        console.log(sql_spare)
        conupline.query(sql_spare, function(err, fields) {

            conupline.release();

            if (err) {

                res.send("no")

                res.end();

                throw err;

            }

            res.send("ok")
            res.end();
        })


    })

});

app.post('/spare/imgupload', function(req, res) {
    console.log("j");
    var form = new formidable.IncomingForm();
    imgfile = '';
    form.parse(req);
    form.on('fileBegin', function(name, file) {
        imgfile = file.name;
        console.log(imgfile);
        file.path = './public/img_spare/' + imgfile;
        console.log(file.path);
        res.send(file.path);
    });
    
    
});

app.post('/spare/insert', function(req, res) {

    var id = req.body.id;
    var category = req.body.category;
    var name= req.body.name;
    var quanity = req.body.quanity;
    var limit = req.body.limit;
    var unit = req.body.unit;
    var brand = req.body.brand;
    var desc = req.body.desc;
    var pos = req.body.pos;
    var status = req.body.status;
    var expired =req.body.expired;
    var image = req.body.image;
    imagee= "./public/img_spare/"+image;

    conn.getConnection(function(err, conupline) {
        if (err) throw err;       
        if (imagee == "./public/img_spare/undefined")
        {
            var sql_spare = 'insert into spare (id, category,namee,qty, limitt, unit, brand, descc, pos,statuss,expired,image) values ("' + id + '","' + category + '","' + name + '","' + quanity + '","' + limit+ '","' + unit + '","' + brand + '","' + desc + '","' + pos + '","' + status + '","' + expired + '","./public/img_spare/noimg.png");'
        }
        else
        {
            var sql_spare = 'insert into spare (id, category,namee,qty, limitt, unit, brand, descc, pos,statuss,expired,image) values ("' + id + '","' + category + '","' + name + '","' + quanity + '","' + limit+ '","' + unit + '","' + brand + '","' + desc + '","' + pos + '","' + status + '","' + expired + '","' + imagee+ '");'
        }
        console.log(sql_spare)
        conupline.query(sql_spare, function(err, fields) {

            conupline.release();

            if (err) {

                res.send("no")

                res.end();

                throw err;

            }

            res.send("ok")
            res.end();
        })

    })

});
app.post('/spare/delete', function(req, res) {
    var id = req.body.id;

    conn.getConnection(function(err, conupline) {

        if (err) throw err;
        var sql_upline = 'delete from spare where id="' +id + '";'
       // console.log(sql_upline);
        conupline.query(sql_upline, function(err, fields) {
            conupline.release();

            if (err) {

                res.send("no")

                res.end();

                throw err;

            }

            res.send("ok")

            res.end();

        })

    })

});
