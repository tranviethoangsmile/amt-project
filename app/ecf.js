var mysql = require('mysql');
var express = require("express");
var upload = require ('express-fileupload');
var app = express();
app.use(upload());
var formidable= require("formidable")

var fs = require('fs');

const multer = require("multer");

const { PythonShell } = require('python-shell');

var bodyParser = require("body-parser");
const e = require('connect-flash');
const { strict } = require('assert');
var conn = mysql.createPool({

    connectionLimit: 30,

    host: "pbvweb01v",

    user: "intern",

    password: "intern21",

    database: "fm"

});
var con = mysql.createPool({

    connectionLimit: 30,

    host: "pbvweb01v",

    user: "root",

    password: "123456",

    database: "erpsystem"

});
module.exports = con;
module.exports = conn;
module.exports = function (app, passport) {

    //---------------------------PASSPORT----------------------------
    

    app.get('/ecf',isLoggedIn,function (req, res) {
        res.render('ecf/temp.ejs', {
            user: req.user[0].user, // Lấy thông tin user trong session và truyền nó qua template
            note: req.user[0].note
        });
    })

    app.get('/ecf2',isLoggedIn,function(req,res){
        res.render('ecf/temp.ejs',{
            user: req.user[0].user, // Lấy thông tin user trong session và truyền nó qua template
            note: req.user[0].note
        });
        res.end();
    })

    app.get('/xp',function (req, res) {
        res.render('ecf/xp.ejs', {
            user: " Hi Bro", // Lấy thông tin user trong session và truyền nó qua template
            note: "demo"
        });
    })


    app.post('/ecf/load_ecf_data',function(req,res){
        con.getConnection(function(err, emp) {

            if (err) throw err;
    
            console.log("Connected!");
    
            var sql_emp = 'select * from hrsystem.emp_ecf;';
           
            console.log(sql_emp);
    
            emp.query(sql_emp, function(err, list_emp) {
                emp.release()
                if (err){
                    res.send("false");
                    res.end();
                    throw err;
                } 
                res.send(list_emp);
                res.end();
                
            })
        })

    })
 
    app.post('/ecf/idnv',function(req,res){
        var msnv=req.body.idnv;
        con.getConnection(function(err, emp) {

            if (err) throw err;
    
            console.log("Connected!");
    
            var sql_emp = 'select name,dept,position,type from erpsystem.setup_emplist where id="'+msnv+'";';
           
            console.log(sql_emp);
    
            emp.query(sql_emp, function(err, list_emp) {
                emp.release()
                if (err){
                    res.send("false");
                    res.end();
                    throw err;
                } 
                res.send(list_emp);
                res.end();
                
            })
        })

    })
    
    app.post('/ecf/Upload_New_ecf',function(request,response){
        let ts = Date.now();
        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        var dsubmit=year+"-"+ month+"-" + date
        // prints date & time in YYYY-MM-DD format
        console.log(dsubmit);
        var user=request.user[0].user;
        var formData = new formidable.IncomingForm();
        var docfile=''
        formData.parse(request, function (error, fields, files) {
            console.log(fields)
            var extension = files.file.name.substr(files.file.name.lastIndexOf("."));
            docfile=fields.idnv_ecf+"_"+dsubmit
            var newPath = "public/doc_ecf/" + docfile+ extension;
            console.log(newPath)
            fs.rename(files.file.path, newPath, function (errorRename) {
                // result.send("File saved = " + newPath);
                console.log("file have been save")
                console.log("run python")
                let options = {
                    mode: 'text',
                    pythonPath: 'python',
                    pythonOptions: ['-u'], // get print results in real-time
                    scriptPath: './python/ecf/', //If you are having python_test.py script in same folder, then it's optional.
                    args:[docfile]
                };
               // console.log("hi")
                PythonShell.run('doc_To_png.py', options, function(err, result) {
                    if (err) throw err;
                    // result is an array consisting of messages collected 
                    //during execution of script.
                    //console.log('result: ', result.toString());
                    con.getConnection(function(err, ecf) {
                        if (err) throw err;
                        console.log("Connected!");
                        var sql_ecf =('replace into hrsystem.emp_ecf (key_ecf,idnv,name,submit_date,user_submit,from_dept,to_dept,doc_file,img_file,type_submit) values '
                                    + '("'+docfile+'","'+fields.idnv_ecf+'","'+fields.nv_ecf+'",date(now()),"'+user+'","'+fields.dept1_sel+'","'+fields.dept2_sel+'","'+docfile+'","ECF-'+docfile+'.jpg","'+fields.type_sel+'");');
                        console.log(sql_ecf);
                        ecf.query(sql_ecf, function(err, list_emp) {
                            ecf.release()
                            if (err){
                                response.send("false");
                                response.end();
                                throw err;
                            } 
                            response.send(result.toString())
                            response.end();
                            
                        })
                    })
                });
            });
        });
    });



    app.post('/ecf/imgupload', function(req, res) {
        console.log("j");
        var form = new formidable.IncomingForm();
        imgfile = '';
        form.parse(req);
        form.on('fileBegin', function(name, file) {
            imgfile = file.name;
            console.log(imgfile);
            file.path = './public/img_spare/' + imgfile;
            console.log(file.path);
            // res.send(file.path);
        });       
    })



    function change_time(time){
        return (new Date(time)).toLocaleString("en-US", {timeZone: "Asia/Bangkok"});
    }
    
    function change_time3(time){
        return (new Date(time)).toLocaleDateString('en-US');
    } 

 


   
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
        cb(null, './public')
        },
        filename: function (req, file, cb) {
        cb(null, file.originalname)
        }
    })
    
    var upload = multer({ storage: storage })
    app.post('/ecf/profile-upload-multiple', upload.array('profile-files', 12), function (req, res, next) {      
   
    })



    app.post('/ecf/imgupload', function(req, res) {
        parseReqBody: false;
        var form = new formidable.IncomingForm();
        imgfile = '';
        form.parse(req);
        form.on('fileBegin', function(name, file) {
            imgfile = file.name;
            console.log(imgfile);
            file.path = './public/img_mac/' + imgfile;
            console.log(file.path);
            // res.send(file.path);
        });            
    })



    
};
function isLoggedIn(req, res, next) {
    // Nếu một user đã xác thực, cho đi tiếp
    if (req.isAuthenticated())
        return next();
    // Nếu chưa, đưa về trang chủ
    res.redirect('/login');
}