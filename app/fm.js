var mysql = require('mysql');

var formidable = require("formidable")

var fs = require('fs');

var multer = require('multer')
const { PythonShell } = require('python-shell');
var bodyParser = require("body-parser");
const e = require('connect-flash');
const { strict } = require('assert');
const { format } = require('path/posix');
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

    user: "intern",

    password: "intern21",

    database: "erpsystem"

});

// create app AMT start  
var connect_pr2k = mysql.createPool({
    connectionLimit: 30,

    host: "pbvweb01v",

    user: "intern",

    password: "intern21",

    database: "pr2k"
})

var connect_linebalancing = mysql.createPool({
    connectionLimit: 30,

    host: "pbvweb01v",

    user: "intern",

    password: "intern21",

    database: "linebalancing"
})

var connect_mms = mysql.createPool({
    connectionLimit: 30,

    host: "pbvweb01v",

    user: "intern",

    password: "intern21",

    database: "mms"
})

var connect_hrsystem = mysql.createPool({
    connectionLimit: 30,

    host: "pbvweb01v",

    user: "intern",

    password: "intern21",

    database: "hrsystem"
})

var connect_amt = mysql.createPool({
    connectionLimit: 30,

    host: "pbvweb01v",

    user: "intern",

    password: "intern21",

    database: "amt"
})



// end AMT

module.exports = con;
module.exports = conn;
module.exports = function (app, passport) {

    //---------------------------PASSPORT----------------------------



    // ============================================AMT START=======================================//


    var amt_storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/amt')
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname)
        }
    })

    var amt_upload = multer({ storage: amt_storage })





    app.get('/api/amt/check', (req, res) => {
        let datenow = new Date(Date.now());
        var date = new Date(datenow);
        let day_get_data = new Date(date.setDate(date.getDate() - 6)).toLocaleDateString('fr-CA');
        console.log(day_get_data);
    })


    // get name tachnician
    app.get('/api/amt/get_name_technician/:tagID', (req, res) => {
        let tech_id = req.params.tagID;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT TECHNICIAN FROM amt.amt_tracking 
            WHERE TECH_ID = '${tech_id}' group by TECHNICIAN`;
            console.log(sql_data);
            data.query(sql_data, (err, TECHNICIAN) => {
                if (err) throw err;
                data.release();
                res.send(TECHNICIAN);
            })
        })
    })

    // get reason of group line in week
    app.post('/api/amt/get_reason_of_group_line_in_week', (req, res) => {
        let { GROUP_LINE, SHIFT, week } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT GROUP_LINE, REASON, COUNT(REASON) AS SL 
            FROM amt.employee_profile 
            WHERE WEEK(DAY_TRACKING) = '${week}' AND REASON IS NOT NULL AND GROUP_LINE = '${GROUP_LINE}' AND  LEFT(SHIFT,3) = '${SHIFT}'
            GROUP BY REASON;            
            `;
            console.log(sql_data);
            data.query(sql_data, (err, reason_list) => {
                if (err) throw err;
                data.release();
                res.send(reason_list);
            })
        })
    })

    // get reason in week
    app.get('/api/amt/get_reason_in_week/:tagWeek', (req, res) => {
        let week = req.params.tagWeek;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT REASON, COUNT(REASON) AS SL 
            FROM amt.employee_profile 
            WHERE WEEK(DAY_TRACKING) = '${week}' AND REASON IS NOT NULL
            GROUP BY REASON;            
            `;
            console.log(sql_data);
            data.query(sql_data, (err, reason_list) => {
                if (err) throw err;
                data.release();
                res.send(reason_list);
            })
        })
    })

    // get data irr of group_line in week
    app.post('/api/amt/get_irr_of_group_line_in_week', (req, res) => {
        let { GROUP_LINE, week } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `
            SELECT a.ID, a.SHIFT,a.GROUP_LINE, SUM(b.QUANTITY)AS QUANTITY 
            FROM (SELECT ID,LEFT(SHIFT,3) AS SHIFT, GROUP_LINE 
            FROM amt.employee_profile WHERE WEEK(DAY_TRACKING) = '${week}' AND GROUP_LINE = '${GROUP_LINE}'
            GROUP BY ID)a
            LEFT JOIN (SELECT * FROM amt.amt_irr_tracking WHERE WEEK(DATE) = '${week}')b
            ON a.ID = b.ID
            GROUP BY a.ID;            
            `;
            console.log(sql_data);
            data.query(sql_data, (err, irr_list) => {
                if (err) throw err;
                data.release();
                res.send(irr_list);
            })
        })
    })


    // get data of group line in week
    app.post('/api/amt/get_data_of_group_line_in_week', (req, res) => {
        let { GROUP_LINE, week } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT GROUP_LINE,SHIFT,DES, COUNT(ID)AS SL FROM 
            (SELECT tb1.ID,tb1.SHIFT, tb1.GROUP_LINE, ROUND(SUM(tb1.EFF)/COUNT(tb1.EFF),2) AS EFF,
            ROUND(SUM(tb2.TAGETS)/COUNT(tb2.TAGETS),2) AS TAGETS, IF( EFF>TAGETS, 'ĐẠT', 'KHÔNG') AS DES
            FROM (SELECT ID, GROUP_LINE,CODE_TRAINING,LEFT(SHIFT,3) AS SHIFT,
            DAY_TRACKING,DAY_TRAINING, REDUCE_DAY, EFF, (DAY_TRAINING - REDUCE_DAY) AS DAY_TRAINING_REAL 
            FROM amt.employee_profile WHERE WEEK(DAY_TRACKING) = '${week}' AND GROUP_LINE = '${GROUP_LINE}')tb1
            LEFT JOIN (SELECT * FROM amt.tagets_training_tracking)tb2
            ON tb1.CODE_TRAINING = tb2.CODE_TRAINING AND (tb1.DAY_TRAINING - tb1.REDUCE_DAY) = tb2.DAY
            GROUP BY tb1.ID)abc
            GROUP BY SHIFT, GROUP_LINE, DES ORDER BY GROUP_LINE, SHIFT, DES;`;
            console.log(sql_data);
            data.query(sql_data, (err, group_line_list) => {
                if (err) throw err;
                data.release();
                res.send(group_line_list);
            })
        })
    })

    // get group_line_of_week
    app.get('/api/amt/get_group_line_of_week/:tagWeek', (req, res) => {
        let week = req.params.tagWeek;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT GROUP_LINE FROM amt.employee_profile WHERE WEEK(DAY_TRACKING) = '${week}'
            GROUP BY GROUP_LINE;`;
            console.log(sql_data);
            data.query(sql_data, (err, group_line_list) => {
                if (err) throw err;
                data.release();
                res.send(group_line_list);
            })
        })
    })

    // get data irr of week
    app.get('/api/amt/get_irr_of_week/:tagWeek', (req, res) => {
        let week = req.params.tagWeek;
        console.log(week);
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT a.ID, a.SHIFT, SUM(b.QUANTITY)AS QUANTITY 
            FROM (SELECT ID,LEFT(SHIFT,3) AS SHIFT FROM amt.employee_profile WHERE WEEK(DAY_TRACKING) = '${week}'
            GROUP BY ID)a
            LEFT JOIN (SELECT * FROM amt.amt_irr_tracking WHERE WEEK(DATE) = '${week}')b
            ON a.ID = b.ID
            GROUP BY a.ID;`;
            console.log(sql_data);
            data.query(sql_data, (err, irr_list) => {
                if (err) throw err;
                data.release();
                res.send(irr_list);
            })
        })
    })



    // get data of week
    app.get('/api/amt/get_data_of_week/:tagWeek', (req, res) => {
        let week = req.params.tagWeek;
        console.log(week);
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT SHIFT, DES, COUNT(ID) AS QUANTITY FROM (SELECT tb1.ID,tb1.SHIFT,tb1.GROUP_LINE, ROUND(SUM(tb1.EFF)/COUNT(tb1.EFF),2) AS EFF,
            ROUND(SUM(tb2.TAGETS)/COUNT(tb2.TAGETS),2) AS TAGETS, IF(EFF>TAGETS, 'ĐẠT','KHÔNG') AS DES
            FROM (SELECT ID, GROUP_LINE,LEFT(SHIFT,3)AS SHIFT,CODE_TRAINING, DAY_TRACKING,DAY_TRAINING, REDUCE_DAY, EFF, (DAY_TRAINING - REDUCE_DAY) AS DAY_TRAINING_REAL 
            FROM amt.employee_profile WHERE WEEK(DAY_TRACKING) = '${week}')tb1
            LEFT JOIN (SELECT * FROM amt.tagets_training_tracking)tb2
            ON tb1.CODE_TRAINING = tb2.CODE_TRAINING AND (tb1.DAY_TRAINING - tb1.REDUCE_DAY) = tb2.DAY
            GROUP BY tb1.ID)abc
            GROUP BY SHIFT, DES;`;
            console.log(sql_data);
            data.query(sql_data, (err, group_line_info_list) => {
                if (err) throw err;
                data.release();
                res.send(group_line_info_list);
            })
        })
    })

    // go to system page 
    var counter = 0;
    app.get('/system', function (req, res) {
        counter++;
        res.render('system.ejs', { counter });
    })


    // go to amt detail
    app.get('/profile', isLoggedIn, (req, res) => {
        res.render('profile.ejs', {
            user: req.user[0].user, // Lấy thông tin user trong session và truyền nó qua template
            note: req.user[0].note
        });
    })

    // get description code

    app.post('/api/amt/get_description_code', (req, res) => {
        let code_old = req.body.Code
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT Description FROM linebalancing.setup_operation_standard_code WHERE Code = '${code_old}';`;
            console.log(sql_data);
            data.query(sql_data, (err, Description) => {
                if (err) throw err;
                data.release();
                res.send(Description);
            })
        })

    })

    // delete code standard success

    app.post('/api/amt/delete_code_standard_success', (req, res) => {
        let CODE_SUCCESS = req.body.CODE
        if (CODE_SUCCESS < 10) {
            CODE_SUCCESS = '0' + CODE_SUCCESS
        }
        console.log(CODE_SUCCESS)
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `DELETE FROM amt.code_reduce_day_success WHERE CODE = '${CODE_SUCCESS}';`;
            console.log(sql_data);
            data.query(sql_data, (err, code_list) => {
                if (err) {
                    res.send({
                        status: 500,
                        message: 'Lỗi hệ thống'
                    })
                }
                data.release();
                res.send({
                    status: 200,
                    message: 'Xóa thành công'
                });
            })
        })
    })

    // insert conde standard 
    app.post('/api/amt/insert_code_success', (req, res) => {
        let { CODE, DESCRIPTION } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql = `SELECT * FROM amt.code_reduce_day_success WHERE CODE = '${CODE}'`;
            console.log(sql)
            data.query(sql, (err, code_info) => {
                if (err) throw err;
                data.release();
                console.log(code_info.length)
                if (code_info.length >= 1) {
                    res.send({
                        status: 500,
                        message: 'Lỗi hệ thống'
                    })
                } else {
                    console.log('next')
                    connect_amt.getConnection((err, data) => {
                        if (err) {
                            res.send({
                                status: 500,
                                message: 'Lỗi hệ thống'
                            })
                        }
                        console.log('connected');
                        let sql_data = `INSERT INTO amt.code_reduce_day_success (CODE, DESCRIPTION) 
                        VALUES('${CODE}','${DESCRIPTION}')`;
                        console.log(sql_data);
                        data.query(sql_data, (err, code_list) => {
                            if (err) throw err;
                            data.release();
                            res.send({
                                status: 200,
                                message: 'thêm thành công'
                            });
                        })
                    })
                }
            })
        })

    })

    // get code standard success

    app.get('/api/amt/get_code_standard_success', (req, res) => {
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT * FROM amt.code_reduce_day_success`;
            console.log(sql_data);
            data.query(sql_data, (err, code_list) => {
                if (err) throw err;
                data.release();
                res.send(code_list);
            })
        })
    })


    // get code standard list
    app.get('/api/amt/get_code_standard', (req, res) => {
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT Code FROM linebalancing.setup_operation_standard_code`;
            console.log(sql_data);
            data.query(sql_data, (err, code_list) => {
                if (err) throw err;
                data.release();
                res.send(code_list);
            })
        })
    })

    // go to amt action page
    app.get('/action', isLoggedIn, (req, res) => {
        counter++;
        res.render('action.ejs', {
            user: req.user[0].user, // Lấy thông tin user trong session và truyền nó qua template
            note: req.user[0].note,
            counter
        });
    })

    // upload file
    app.post('/api/amt/upload_file_tagets', function (req, res) {
        console.log("Uploadfile_machine");
        var form = new formidable.IncomingForm();
        excelFile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            excelFile = file.name;
            file.path = './public/amt/' + excelFile;
        });
        form.on('file', function (name, file) {
            let options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                args: [excelFile]
            };
            console.log("hi ")
            PythonShell.run('upload_tagets_training_tracking.py', options, function (err, result) {
                if (err) throw err;
                res.send(result.toString())
            });
        })
    });


    // get tech of employee 
    app.get('/api/amt/get_tech_of_employee/:tagId', (req, res) => {
        let id = req.params.tagId;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT ID, NAME, TECH_ID, TECHNICIAN FROM amt.amt_tracking WHERE ID = '${id}'`;
            console.log(sql_data);
            data.query(sql_data, (err, employee) => {
                if (err) throw err;
                data.release();
                res.send(employee);
            })
        })
    })


    // get reason detail by id 
    app.post('/api/amt/get_reason_detail', (req, res) => {
        let datenow = new Date(Date.now());
        var date = new Date(datenow);
        let time_get_data = new Date(date.setDate(date.getDate() - 7)).toLocaleDateString('fr-CA');
        let { ID, DAY_TRACKING } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT DAY_TRACKING, REASON, TECHNICIANS_NOTE FROM amt.employee_profile
            WHERE ID = '${ID}' AND REASON IS NOT NULL AND DAY_TRACKING <= '${DAY_TRACKING}' AND  DAY_TRACKING >= '${time_get_data}'`;
            console.log(sql_data);
            data.query(sql_data, (err, reason_list) => {
                if (err) throw err;
                data.release();
                res.send(reason_list);
            })
        })
    })


    // get irr detail by id
    app.post('/api/amt/get_irr_detail', (req, res) => {
        let { ID, DAY_TRACKING } = req.body;
        let day_end_tracking = DAY_TRACKING.split('-');
        let year = day_end_tracking[0];
        let month = day_end_tracking[1];
        let day_start = day_end_tracking[2]
        let datenow = new Date(Date.now());
        var date = new Date(datenow);
        let time_get_data = new Date(date.setDate(date.getDate() - 7)).toLocaleDateString('fr-CA');
        console.log(time_get_data);
        let day_tracking_end = time_get_data.split('-');
        let month_end = day_tracking_end[1];
        let day_end = day_tracking_end[2];

        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT DATE, QUANTITY, IRR_NAME FROM amt.amt_irr_tracking
            WHERE ID = '${ID}' AND DATE <= '${year}${month}${day_start}' AND  DATE >= '${year}${month_end}${day_end}'`;
            data.query(sql_data, (err, irr_list) => {
                if (err) throw err
                data.release();
                res.send(irr_list);
            })
        })
    })

    // save season not pass
    app.post('/api/amt/save_reason_not_pass', (req, res) => {
        let { ID, REASON, CYCLE_TIME, DAY_TRACKING, TECHNICIANS_NOTE } = req.body;
        // validate dữ liệu
        // if (ID === ' ' || REASON === '--Chọn--' || DAY_TRACKING === ' ' || TECHNICIANS_NOTE === ' ' || TECHNICIANS_NOTE.length < 10) {
        //     res.send({
        //         status: '500',
        //         message: 'fail'
        //     })
        // }
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `UPDATE amt.employee_profile SET REASON = '${REASON}',
            TECHNICIANS_NOTE = '${TECHNICIANS_NOTE}', CYCLE_TIME = '${CYCLE_TIME}'
            WHERE ID = '${ID}' AND DAY_TRACKING = '${DAY_TRACKING}'`;
            console.log(sql_data);
            data.query(sql_data, (err, respond) => {
                if (err) {
                    res.send({
                        status: '500',
                        message: 'fail'
                    })
                }
                data.release();
                res.send({
                    status: '200',
                    message: 'success'
                })
            })
        })
    })

    // get percent irr training of employee by id
    app.post('/api/amt/get_reason', (req, res) => {
        let { ID, DAY_TRACKING } = req.body;
        let day_end_tracking = DAY_TRACKING.split('-');
        let year = day_end_tracking[0];
        let month = day_end_tracking[1];
        let day_start = day_end_tracking[2]
        let datenow = new Date(Date.now());
        var date = new Date(datenow);
        let time_get_data = new Date(date.setDate(date.getDate() - 7)).toLocaleDateString('fr-CA');
        console.log(time_get_data);
        let day_tracking_end = time_get_data.split('-');
        let month_end = day_tracking_end[1];
        let day_end = day_tracking_end[2];
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT REASON, COUNT(REASON) AS QUANTITY FROM amt.employee_profile
             WHERE ID = '${ID}' AND REASON IS NOT NULL AND DAY_TRACKING <= '${year}-${month}-${day_start}' AND DAY_TRACKING >= '${year}-${month_end}-${day_end}'
            GROUP BY REASON;`;
            console.log(sql_data);
            data.query(sql_data, (err, reason_list) => {
                if (err) throw err;
                data.release();
                res.send(
                    reason_list
                );
            })
        })
    })


    // get employee name
    app.get('/api/amt/get_name_employee/:tagID', (req, res) => {
        let id = req.params.tagID
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT ID,NAME,SHIFT,OPERATION_NAME, TECHNICIAN FROM amt.amt_tracking WHERE ID = '${id}'`;
            data.query(sql_data, (err, employee) => {
                if (err) throw err;
                data.release();
                res.send(employee);
            })
        })
    })

    app.get('/api/amt/get_em_profile/:tagId', (req, res) => {
        let id = req.params.tagId;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let search_employee_profile = `SELECT tb1.ID,tb1.NAME, tb1.SHIFT, tb1.GROUP_LINE, tb1.OPERATION_NAME, tb1.DAY_TRACKING, tb1.TECH_ID, tb1.TECHNICIANS, tb1.EFF, 
            tb1.REASON,tb1.CYCLE_TIME,tb1.TECHNICIANS_NOTE,tb2.TAGETS   
            FROM (SELECT * FROM amt.employee_profile a WHERE a.ID = '${id}')tb1
            LEFT JOIN (SELECT * FROM amt.tagets_training_tracking)tb2
            ON tb1.DAY_TRAINING = tb2.DAY AND tb1.CODE_TRAINING = tb2.CODE_TRAINING`;
            console.log('tech_id', search_employee_profile)
            data.query(search_employee_profile, (err, employee_profile) => {
                if (err) throw err;
                data.release();
                if (employee_profile != 0) {
                    res.send({
                        status: 200,
                        employee_profile
                    });
                } else {
                    res.send({
                        status: 500,
                        message: 'does not exist'
                    })
                }
            })
        })
    })

    // send report sys
    app.post('/api/amt/send_report_sys', (req, res) => {
        let { DATE, NOTE, STAFF } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) {
                res.send({
                    status: 500
                })
            }
            let sql_data = `INSERT INTO amt.sys_error (DATE,NOTE, STAFF) values ('${DATE}','${NOTE}','${STAFF}')`;
            console.log(sql_data);
            data.query(sql_data, (err, eff_list) => {
                if (err) {
                    res.send({
                        status: 500
                    })
                } else {
                    data.release();
                    res.send({
                        status: 200
                    });
                }
            })
        })
    })

    // get data eff detail by ID
    app.post('/api/amt/get_eff_detail', (req, res) => {
        let { ID, DAY_TRACKING } = req.body;
        let day_end_tracking = DAY_TRACKING.split('-');
        let year = day_end_tracking[0];
        let month = day_end_tracking[1];
        let day_start = day_end_tracking[2]
        let datenow = new Date(Date.now());
        var date = new Date(datenow);
        let time_get_data = new Date(date.setDate(date.getDate() - 7)).toLocaleDateString('fr-CA');
        console.log(time_get_data);
        let day_tracking_end = time_get_data.split('-');
        let month_end = day_tracking_end[1];
        let day_end = day_tracking_end[2];
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT tb1.ID, tb1.EFF,tb1.DAY_TRACKING, tb2.TAGETS, tb1.SPAN_TIME, tb1.DOWTIME, tb1.WORK_HRS FROM (SELECT ID,EFF,DAY_TRACKING,WORK_HRS, DAY_TRAINING,CODE_TRAINING, SPAN_TIME, DOWTIME FROM amt.employee_profile 
                WHERE ID = '${ID}' AND DAY_TRACKING <= '${year}-${month}-${day_start}' AND DAY_TRACKING >= '${year}-${month_end}-${day_end}')tb1
                INNER JOIN (SELECT * FROM amt.tagets_training_tracking)tb2
                ON tb1.DAY_TRAINING = tb2.DAY AND tb1.CODE_TRAINING = tb2.CODE_TRAINING`;
            data.query(sql_data, (err, eff_list) => {
                if (err) throw err;
                data.release();
                res.send(eff_list);
            })
        })
    })

    // get id and name of employee
    app.post('/api/amt/get_employee_id_and_name', (req, res) => {
        let { ID, DAY_TRACKING } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT ID, NAME, CODE_TRAINING, OPERATION_NAME 
            FROM amt.employee_profile WHERE ID = '${ID}' 
            AND DAY_TRACKING = '${DAY_TRACKING}' GROUP BY ID`;
            console.log(sql_data);
            data.query(sql_data, (err, employee) => {
                if (err) throw err;
                data.release();
                res.send(employee);
            })
        })
    })

    // get data eff training of employee by id
    app.post('/api/amt/get_data_eff_training', (req, res) => {
        let { ID, DAY_TRACKING } = req.body;
        let day_end_tracking = DAY_TRACKING.split('-');
        let year = day_end_tracking[0];
        let month = day_end_tracking[1];
        let day_start = day_end_tracking[2]
        let datenow = new Date(Date.now());
        var date = new Date(datenow);
        let time_get_data = new Date(date.setDate(date.getDate() - 7)).toLocaleDateString('fr-CA');
        console.log(time_get_data);
        let day_tracking_end = time_get_data.split('-');
        let month_end = day_tracking_end[1];
        let day_end = day_tracking_end[2];
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT tb1.EFF,tb1.DAY_TRACKING, tb2.TAGETS FROM (SELECT EFF,DAY_TRACKING, DAY_TRAINING,CODE_TRAINING FROM amt.employee_profile 
                WHERE ID = '${ID}' AND DAY_TRACKING <= '${year}-${month}-${day_start}' AND DAY_TRACKING >= '${year}-${month_end}-${day_end}')tb1
                INNER JOIN (SELECT * FROM amt.tagets_training_tracking)tb2
                ON tb1.DAY_TRAINING = tb2.DAY AND tb1.CODE_TRAINING = tb2.CODE_TRAINING`;
            console.log(sql_data);
            data.query(sql_data, (err, data_list) => {
                if (err) throw err;
                data.release();
                res.send(data_list);
            })
        })
    })


    // get data irr training of employee by id
    app.post('/api/amt/get_data_irr_training/', (req, res) => {
        let { ID, DAY_TRACKING } = req.body;
        let day_end_tracking = DAY_TRACKING.split('-');
        let year = day_end_tracking[0];
        let month = day_end_tracking[1];
        let day_start = day_end_tracking[2]
        let datenow = new Date(Date.now());
        var date = new Date(datenow);
        let time_get_data = new Date(date.setDate(date.getDate() - 7)).toLocaleDateString('fr-CA');
        console.log(time_get_data);
        let day_tracking_end = time_get_data.split('-');
        let month_end = day_tracking_end[1];
        let day_end = day_tracking_end[2];
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT SUM(QUANTITY) AS QUANTITY, IRR_NAME,DATE FROM amt.amt_irr_tracking 
            WHERE ID = '${ID}' AND DATE <= '${year}${month}${day_start}' AND  DATE >= '${year}${month_end}${day_end}' 
            GROUP BY DATE`;
            data.query(sql_data, (err, irr_list) => {
                if (err) throw err;
                data.release();
                res.send(irr_list);
            })
        })
    })

    // get irr list by day_tracking
    app.post('/api/amt/get_irr_by_day_tracking', (req, res) => {
        let { GROUP_LINE, DAY_TRACKING, SHIFT } = req.body;
        let time = DAY_TRACKING.split('-');
        let year = time[0];
        let month = time[1];
        let day = time[2];
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT SUM(b.QUANTITY) AS QUANTITY, b.IRR_NAME FROM (SELECT ID FROM amt.employee_profile 
                WHERE GROUP_LINE = '${GROUP_LINE}'  AND LEFT(SHIFT,3) = '${SHIFT}' GROUP BY ID)a 
                INNER JOIN (SELECT * FROM amt.amt_irr_tracking)b
                ON a.ID = b.ID AND b.DATE = '${year}${month}${day}'
                GROUP BY b.IRR_NAME;`;
            console.log(sql_data);
            data.query(sql_data, (err, irr_list) => {
                if (err) throw err;
                data.release();
                res.send(irr_list);
            })
        })
    })

    // add new tech second
    app.post('/api/amt/add_tech_second', (req, res) => {
        let { ID, TECH_ID_SECOND, TECH_NAME_SECOND } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `UPDATE amt.amt_tracking set TECH_ID_SECOND = '${TECH_ID_SECOND}', TECH_NAME_SECOND = '${TECH_NAME_SECOND}' WHERE ID = '${ID}'`;
            console.log(sql_data);
            data.query(sql_data, (err, tech) => {
                if (err) {
                    res.send({
                        status: 500
                    })
                }
                data.release();
                res.send({
                    status: 200
                })
            })
        })
    })

    // change technician
    app.post('/api/amt/change_tech', (req, res) => {
        let { ID, TECH_ID, TECHNICIAN } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `UPDATE amt.amt_tracking set TECH_ID = '${TECH_ID}', TECHNICIAN = '${TECHNICIAN}' WHERE ID = '${ID}'`;
            console.log(sql_data);
            data.query(sql_data, (err, tech) => {
                if (err) {
                    res.send({
                        status: 500
                    })
                }
                data.release();
                res.send({
                    status: 200
                })
            })
        })
    })
    // get name tech new
    app.get('/api/amt/get_new_tech_name/:tagId', (req, res) => {
        let id = req.params.tagId;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT * FROM amt.technicians WHERE ID = '${id}'`;
            console.log(sql_data);
            data.query(sql_data, (err, tech) => {
                if (err) throw err;
                data.release();
                res.send(tech);
            })
        })

    })


    // get irr list of employee profile 
    app.get('/api/amt/get_irr_of_employee_profile/:tagId', (req, res) => {
        let id = req.params.tagId;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT QUANTITY FROM amt.amt_irr_tracking WHERE ID = '${id}'`;
            console.log(sql_data);
            data.query(sql_data, (err, irr_list) => {
                if (err) throw err;
                data.release();
                res.send(irr_list);
            })
        })

    })
    // modify amt_tracking

    app.post('/api/amt/modifiy_amt_tracking', (req, res) => {
        let { ID, CODE_TRAINING, OPERATION_NAME } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) {
                res.send({
                    status: 500
                })
            }
            let search_code = `SELECT CODE_TRAINING FROM amt.tagets_training_tracking WHERE CODE_TRAINING = '${CODE_TRAINING}' GROUP BY CODE_TRAINING`;
            console.log(search_code);
            data.query(search_code, (err, code) => {
                if (err) {
                    res.send({
                        status: 500
                    })
                }
                data.release();
                console.log(code);
                if (code.length != 0) {
                    connect_amt.getConnection((err, data) => {
                        if (err) {
                            res.send({
                                status: 500
                            })
                        }
                        let sql_data = `UPDATE amt.amt_tracking SET OPERATION_NAME = '${OPERATION_NAME}', CODE_TRAINING = '${CODE_TRAINING}' WHERE ID = '${ID}'`;
                        console.log(sql_data);
                        data.query(sql_data, (err, employee) => {
                            if (err) {
                                res.send({
                                    status: 500
                                })
                            }
                            data.release();
                            res.send({
                                status: 200
                            })

                        })
                    })
                } else {
                    res.send({
                        status: 500
                    })
                }

            })
        })

    })

    // modify employee profile
    app.post('/api/amt/modifiy_employee_profile', (req, res) => {
        let { ID, CODE_TRAINING, OPERATION_NAME } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) {
                res.send({
                    status: 500
                })
            }
            let search_code = `SELECT CODE_TRAINING FROM amt.tagets_training_tracking WHERE CODE_TRAINING = '${CODE_TRAINING}' GROUP BY CODE_TRAINING`;
            console.log(search_code);
            data.query(search_code, (err, code) => {
                if (err) {
                    res.send({
                        status: 500
                    })
                }
                data.release();
                console.log(code);
                if (code.length != 0) {
                    connect_amt.getConnection((err, data) => {
                        if (err) {
                            res.send({
                                status: 500
                            })
                        }
                        let sql_data = `UPDATE amt.employee_profile SET OPERATION_NAME = '${OPERATION_NAME}', CODE_TRAINING = '${CODE_TRAINING}' WHERE ID = '${ID}'`;
                        console.log(sql_data);
                        data.query(sql_data, (err, employee) => {
                            if (err) {
                                res.send({
                                    status: 500
                                })
                            }
                            data.release();

                            res.send({
                                status: 200
                            })

                        })
                    })
                } else {
                    res.send({
                        status: 500
                    })
                }
            })
        })
    })

    //FIND EMPLOYEE INFO
    app.get('/api/amt/find_employee_info/:tagId', (req, res) => {
        let id = req.params.tagId;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT ID,NAME, CODE_TRAINING, OPERATION_NAME FROM amt.amt_tracking WHERE ID = '${id}'`;
            console.log(sql_data);
            data.query(sql_data, (err, employee) => {
                if (err) throw err;
                data.release();
                res.send(employee);
            })
        })
    })

    // get empployee list by TECH_ID
    app.post('/api/amt/get_employee_detail_by_tech_id', (req, res) => {
        let { TECH_ID, DAY_TRACKING } = req.body;
        if (TECH_ID == '') {
            res.send({
                status: 500,
                message: 'does not exist'
            })
        } else {
            connect_amt.getConnection((err, data) => {
                if (err) {
                    res.send({
                        status: 500,
                        message: 'does not exist'
                    })
                }
                let search_tech = `SELECT TECH_ID, TECHNICIAN FROM amt.amt_tracking WHERE TECH_ID = ${TECH_ID} GROUP BY TECH_ID`;
                console.log('tech_id', search_tech)
                data.query(search_tech, (err, tech) => {
                    if (err) {
                        res.send({
                            status: 500,
                            message: 'does not exist'
                        })
                    }
                    data.release();
                    if (tech.length != 0) {
                        connect_amt.getConnection((err, data) => {
                            if (err) throw err;
                            let sql_data = `SELECT * FROM (SELECT ID, NAME,OPERATION_NAME, OPERATION_NAME_REAL, SPAN_TIME, DOWTIME, WORK_HRS, SHIFT, START_DATE, CODE_TRAINING,EFF, DAY_TRAINING,DAY_TRACKING, 
                                REDUCE_DAY, (DAY_TRAINING - REDUCE_DAY) AS DAY_TRAINING_REAL, REASON
                                FROM amt.employee_profile WHERE TECH_ID = '${TECH_ID}' AND DAY_TRACKING = '${DAY_TRACKING}')b
                                LEFT JOIN (SELECT * FROM amt.tagets_training_tracking)tb
                                ON tb.CODE_TRAINING = b.CODE_TRAINING AND tb.DAY = b.DAY_TRAINING_REAL;`;
                            console.log('tech_id', sql_data)
                            data.query(sql_data, (err, employee_profile_list) => {
                                if (err) throw err;
                                data.release();
                                res.send({
                                    status: 201,
                                    employee_profile_list
                                }
                                );
                            })
                        })
                    } else {
                        connect_amt.getConnection((err, data) => {
                            if (err) throw err;
                            let search_employee_profile = `SELECT tb1.ID,tb1.NAME, tb1.SHIFT, tb1.GROUP_LINE, tb1.OPERATION_NAME, tb1.DAY_TRACKING, tb1.TECH_ID, tb1.TECHNICIANS, tb1.EFF, 
                            tb1.REASON,tb1.CYCLE_TIME,tb1.TECHNICIANS_NOTE,tb2.TAGETS   
                            FROM (SELECT * FROM amt.employee_profile a WHERE a.ID = '${TECH_ID}')tb1
                            LEFT JOIN (SELECT * FROM amt.tagets_training_tracking)tb2
                            ON tb1.DAY_TRAINING = tb2.DAY AND tb1.CODE_TRAINING = tb2.CODE_TRAINING`;
                            console.log('tech_id', search_employee_profile)
                            data.query(search_employee_profile, (err, employee_profile) => {
                                if (err) throw err;
                                data.release();
                                if (employee_profile != 0) {
                                    res.send({
                                        status: 200,
                                        employee_profile
                                    });
                                } else {
                                    res.send({
                                        status: 500,
                                        message: 'does not exist'
                                    })
                                }
                            })
                        })
                    }
                })
            })
        }
    })

    // get employee_profile by start_date and day_tracking
    app.post('/api/amt/get_info_employee_by_group_line', (req, res) => {
        let { GROUP_LINE, DAY_TRACKING, SHIFT } = req.body;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT * FROM (SELECT ID,SHIFT, NAME,OPERATION_NAME_REAL, OPERATION_NAME,SPAN_TIME, DOWTIME, WORK_HRS, START_DATE, CODE_TRAINING,EFF, DAY_TRAINING,DAY_TRACKING, 
                REDUCE_DAY, (DAY_TRAINING - REDUCE_DAY) AS DAY_TRAINING_REAL, REASON
                FROM amt.employee_profile WHERE GROUP_LINE = '${GROUP_LINE}' AND DAY_TRACKING = '${DAY_TRACKING}' AND LEFT(SHIFT,3) = '${SHIFT}')b
                LEFT JOIN (SELECT * FROM amt.tagets_training_tracking)tb
                ON tb.CODE_TRAINING = b.CODE_TRAINING AND tb.DAY = b.DAY_TRAINING_REAL;`;
            data.query(sql_data, (err, employee_profile_list) => {
                if (err) throw err;
                data.release();
                res.send(employee_profile_list);
            })
        })
    })

    // get start_date list

    app.get('/api/amt/get_start_date_list', (req, res) => {
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT GROUP_LINE FROM amt.employee_profile 
            GROUP BY GROUP_LINE`;
            data.query(sql_data, (err, group_line_list) => {
                if (err) throw err;
                data.release();
                res.send(group_line_list);
            })
        })
    })


    // get employee quantity
    app.get('/api/amt/get_employee_quantity', (req, res) => {
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT * FROM amt.amt_tracking`;
            data.query(sql_data, (err, employee_list) => {
                if (err) throw err;
                data.release();
                res.send(employee_list);
            })
        })
    })


    // get employee stoped
    app.get('/api/amt/get_employee_stoped', (req, res) => {
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT * FROM amt.employee_stop_working`;
            data.query(sql_data, (err, employee_list) => {
                if (err) throw err;
                data.release();
                res.send(employee_list);
            })
        })
    })

    // get irr
    app.get('/api/amt/get_irr', (req, res) => {
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT * FROM amt.amt_irr_tracking`;
            data.query(sql_data, (err, irr_list) => {
                if (err) throw err;
                data.release();
                res.send(irr_list);
            })
        })
    })




    // go to amt detail
    app.get('/detail', isLoggedIn, (req, res) => {
        counter++;
        res.render('detail.ejs', {
            user: req.user[0].user, // Lấy thông tin user trong session và truyền nó qua template
            note: req.user[0].note,
            counter
        });
    })

    // go to amt page
    app.get('/amt', isLoggedIn, (req, res) => {
        res.render('amt.ejs', {
            user: req.user[0].user, // Lấy thông tin user trong session và truyền nó qua template
            note: req.user[0].note
        });
    })


    format_time = (time) => {
        let arr = time.split("-");
        let string = `${arr[0]}${arr[1]}${arr[2]}`
        return string;
    }

    // get style detail
    app.get('/api/amt/getstyledetail', (req, res) => {
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT DISTINCT STYLE_DETAIL FROM linebalancing.bundle_group_by_employee_detail b WHERE b.STYLE_DETAIL != 'NULL'`;
            data.query(sql_data, (err, employee_list) => {
                if (err) throw err;
                data.release();
                res.send(employee_list);
            })
        })
    })






    // upload file Employee info (home page)

    app.post('/api/amt/uploadfileemployeeinfo', (req, res) => {
        console.log("Uploadfile_machine");
        var form = new formidable.IncomingForm();
        excelFile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            excelFile = file.name;
            file.path = './public/home/' + excelFile;
        });
        form.on('file', function (name, file) {
            console.log("uploading...")
            let options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                args: [excelFile]
            };
            console.log("hi")
            PythonShell.run('upload_employee_info.py', options, function (err, result) {
                if (err) {
                    res.send('unsuccess')
                } else {
                    res.send('success')
                }
            });
        })
    })

    // upload file technician
    app.post('/api/amt/upload_file_technician', function (req, res) {
        // var dt = datetime.create();
        // var format_date = dt.format("YmdHMS");
        console.log("Uploadfile_machine");
        var form = new formidable.IncomingForm();
        excelFile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            excelFile = file.name;
            file.path = './public/amt/' + excelFile;
        });
        form.on('file', function (name, file) {
            console.log("nay")
            let options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                args: [excelFile]
            };
            // console.log("hi")
            PythonShell.run('update_technician_file.py', options, function (err, result) {
                if (err) {
                    res.send('unsuccess')
                } else {
                    res.send('success')
                }
            });
        })
    });

    // upload file
    app.post('/api/amt/uploadfiletagetstrainingtracking', function (req, res) {
        // var dt = datetime.create();
        // var format_date = dt.format("YmdHMS");
        console.log("Uploadfile_machine");
        var form = new formidable.IncomingForm();
        excelFile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            excelFile = file.name;
            file.path = './public/amt/' + excelFile;
        });
        form.on('file', function (name, file) {
            console.log("nay")
            let options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                args: [excelFile]
            };
            // console.log("hi")
            PythonShell.run('upload_tagets_training_tracking.py', options, function (err, result) {
                if (err) {
                    res.send('unsuccess')
                } else {
                    res.send('success')
                }
            });
        })
    });

    // go to tutorials page 
    app.get('/tutorials', isLoggedIn, (req, res) => {
        res.render('tutorials.ejs', {
            user: req.user[0].user, // Lấy thông tin user trong session và truyền nó qua template
            note: req.user[0].note
        });
    })


    // upload file video
    app.post('/api/amt/uploadvideofile', (req, res) => {
        console.log("Uploadfile_machine");
        var form = new formidable.IncomingForm();
        video_file = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            video_file = file.name;
            file.path = './public/amt_video/' + video_file;
            console.log(file.name)
        });
        console.log('file: ', video_file);
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `INSERT INTO amt.amt_video_tutorials(name) value('${video_file}')`
            data.query(sql_data, (err, result) => {
                if (err) {
                    res.send({
                        message: 'fail',
                        status: '404'
                    })
                }
                res.send({
                    message: 'successfully',
                    status: 200
                })
            })
        })
    })

    // GET ALL VIDEO
    app.get('/api/amt/getallvideoamt', (req, res) => {
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT * FROM amt.amt_video_tutorials`
            data.query(sql_data, (err, videoList) => {
                if (err) throw err;
                data.release();
                res.send(videoList);
            })
        })
    })

    // GET VIDEO BY ID
    app.get('/api/amt/getinfovideo/:tagId', (req, res) => {
        let id = req.params.tagId;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `SELECT * FROM amt.amt_video_tutorials WHERE id = ${id}`;
            data.query(sql_data, (err, video) => {
                if (err) throw err;
                data.release();
                res.send(video);
            })
        })
    })

    // UPDATE VIDEO INFO
    app.post('/api/amt/updatevideoinfo/', (req, res) => {
        let { id, name, description, update_at, upload_by } = req.body
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `UPDATE amt_video_tutorials SET name = '${name}', description = '${description}', update_at = '${update_at}', upload_by = '${upload_by}' WHERE id = '${id}'`
            data.query(sql_data, (err, result) => {
                if (err) {
                    res.send({
                        status: 505,
                        message: 'update fail'
                    })
                } else {
                    res.send({
                        status: 200,
                        message: 'updated'
                    })
                }

            })
        })

    })

    // DELETE VIDEO BY ID
    app.post('/api/amt/deletevideo/:tagId', (req, res) => {
        let id = req.params.tagId;
        connect_amt.getConnection((err, data) => {
            if (err) throw err;
            let sql_data = `DELETE FROM amt_video_tutorials WHERE id = '${id}'`
            data.query(sql_data, (err, result) => {
                if (err) {
                    res.send({
                        status: 505,
                        message: 'delete fail'
                    })
                } else {
                    res.send({
                        status: 200,
                        message: 'delete success'
                    })
                }
            })
        })
    })

    // SEARCH 
    app.post('/api/amt/search', (req, res) => {
        let data_seach = req.body.data;
        connect_amt.getConnection((err, search) => {
            if (err) throw err;
            let sql_search = `SELECT * FROM amt.amt_video_tutorials WHERE name LIKE '%${data_seach}%' OR upload_by LIKE '%${data_seach}%' OR description LIKE '%${data_seach}%'`;
            search.query(sql_search, (err, data) => {
                search.release();
                if (err) {
                    res.send({
                        status: 505,
                        message: 'search fail'
                    })
                } else {
                    res.send(data);
                }
            })
        })
    })






    // ============================================AMT END=======================================//

    app.get('/login', function (req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    })

    app.post('/login', passport.authenticate("local-login", {
        failureRedirect: '/login',
        failureFlash: true
    }), function (req, res) {
        var depart = req.user[0].Department;
        if (req.user[0].Department == "F&M") {
            res.redirect('/detail')
        }
        else {
            if (req.user[0].Department == "HR") {
                res.redirect('/detail')
            }
            else {
                res.redirect('/action')
                res.end();
            }

        }

    })

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/login');
    })



    app.get('/spare', isLoggedIn, function (req, res) {
        res.render('spare.ejs', {
            note: req.user[0].note,
            user: req.user[0].user // Lấy thông tin user trong session và truyền nó qua template
        });
    })

    app.get('/work_order', isLoggedIn, function (req, res) {
        res.render('work_order.ejs', {
            user: req.user[0].user,
            note: req.user[0].note
            // Lấy thông tin user trong session và truyền nó qua template
        });
    })

    app.get('/issue', isLoggedIn, function (req, res) {
        conn.getConnection(function (err, name_sp) {

            if (err) throw err;

            console.log("Connected!");

            var sql_namesp = 'SELECT Name FROM spare_new;';

            console.log(sql_namesp);

            name_sp.query(sql_namesp, function (err, listnamesp) {
                name_sp.release()
                nameesp = ""
                if (listnamesp.length > 0) {
                    for (i = 0; i < listnamesp.length; i++) {
                        nameesp += "<option>" + listnamesp[i].Name + "</option>"
                    }
                }
                res.render('issue.ejs', { user: req.user[0].user, note: req.user[0].note, nameesp: nameesp });
                // console.log(pos);


            })
        })
        // res.render('issue.ejs', {
        //     user: req.user[0].user,
        //     note: req.user[0].note
        // Lấy thông tin user trong session và truyền nó qua template
        // });
    })

    app.get('/wo', isLoggedIn, function (req, res) {
        conn.getConnection(function (err, name_co) {

            if (err) throw err;

            console.log("Connected!");

            var sql_name = 'SELECT  name FROM fm_staff GROUP BY stt DESC;';

            console.log(sql_name);

            name_co.query(sql_name, function (err, listname) {
                name_co.release()
                namee = ""
                if (listname.length > 0) {
                    for (i = 0; i < listname.length; i++) {
                        namee += "<option>" + listname[i].name + "</option>"
                    }
                }
                // res.render('wo.ejs', {user: req.user[0].user,note: req.user[0].note, namee: namee});
                // console.log(pos);
                conn.getConnection(function (err, name_sp) {

                    if (err) throw err;

                    console.log("Connected!");

                    var sql_namesp = 'SELECT Name FROM spare_new;';

                    console.log(sql_namesp);

                    name_sp.query(sql_namesp, function (err, listnamesp) {
                        name_sp.release()
                        nameesp = ""
                        if (listnamesp.length > 0) {
                            for (i = 0; i < listnamesp.length; i++) {
                                nameesp += "<option>" + listnamesp[i].Name + "</option>"
                            }
                        }
                        res.render('wo.ejs', { user: req.user[0].user, note: req.user[0].note, namee: namee, nameesp: nameesp });
                        // console.log(pos);


                    })
                })


            })
        })

    })

    app.get('/machine', isLoggedIn, function (req, res) {

        conn.getConnection(function (err, pos_co) {

            if (err) throw err;

            console.log("Connected!");

            var sql_pos = 'SELECT  sub_pos FROM mc_in_u GROUP BY sub_pos;';

            console.log(sql_pos);

            pos_co.query(sql_pos, function (err, listpos) {
                pos_co.release()
                pos = ""
                if (listpos.length > 0) {
                    for (i = 0; i < listpos.length; i++) {
                        pos += "<option>" + listpos[i].sub_pos + "</option>"
                    }
                }
                // console.log(pos);
                conn.getConnection(function (err, sys_co) {

                    if (err) throw err;

                    console.log("Connected!");

                    var sql_sys = 'SELECT  machine FROM mc_in_u GROUP BY machine;';

                    console.log(sql_sys);

                    sys_co.query(sql_sys, function (err, listsys) {
                        sys_co.release()
                        sys = ""
                        if (listsys.length > 0) {
                            for (i = 0; i < listsys.length; i++) {
                                sys += "<option>" + listsys[i].machine + "</option>"
                            }
                        }
                        // console.log(sys);
                        res.render('machine.ejs', { user: req.user[0].user, note: req.user[0].note, po: pos, sy: sys });
                        // res.end();

                    })
                })
            })
        })
    })

    app.get('/schedule', isLoggedIn, function (req, res) {
        res.render('sche.ejs', {
            user: req.user[0].user, // Lấy thông tin user trong session và truyền nó qua template
            note: req.user[0].note
        });
    })

    app.get('/staff', isLoggedIn, function (req, res) {
        res.render('staff.ejs', {
            user: req.user[0].user, // Lấy thông tin user trong session và truyền nó qua template
            note: req.user[0].note
        });
    })

    app.get('/work', isLoggedIn, function (req, res) {
        conn.getConnection(function (err, name_co) {

            if (err) throw err;

            console.log("Connected!");

            var sql_name = 'SELECT  name,user FROM fm_staff GROUP BY stt ASC;';

            console.log(sql_name);

            name_co.query(sql_name, function (err, listname) {
                name_co.release()
                name1 = ""
                name2 = ""
                name3 = ""
                if (listname.length > 0) {
                    for (i = 0; i < listname.length; i++) {
                        if (listname[i].user != "") { name1 += "<button class='btnnn' onclick='search1(this.id)' id=" + listname[i].user.replace(/\s/g, "_") + ">" + listname[i].name + "</button>" }
                        name2 += "<button class='btnnn' onclick='search2(this.id)' id=" + listname[i].name.replace(/\s/g, "_") + ">" + listname[i].name + "</button>"
                        name3 += "<option>" + listname[i].name + "</option>"
                    }
                }
                conn.getConnection(function (err, name_sp) {

                    if (err) throw err;

                    console.log("Connected!");

                    var sql_namesp = 'SELECT Name FROM spare_new;';

                    console.log(sql_namesp);

                    name_sp.query(sql_namesp, function (err, listnamesp) {
                        name_sp.release()
                        nameesp = ""
                        if (listnamesp.length > 0) {
                            for (i = 0; i < listnamesp.length; i++) {
                                nameesp += "<option>" + listnamesp[i].Name + "</option>"
                            }
                        }
                        res.render('work.ejs', { user: req.user[0].user, note: req.user[0].note, name1: name1, name2: name2, nameesp: nameesp });
                    })
                })
            })
        })

    })


    app.get('/SE/:tagId', function (req, res) {
        console.log("aa")
        console.log(req.params.tagId);
        // res.send(req.params.tagId);
        res.render('commet.ejs', { id: req.params.tagId })
    });

    app.get('/erp', isLoggedIn, function (req, res) {
        var username = req.user[0].user;
        conn.getConnection(function (err, name_co) {

            if (err) throw err;

            console.log("Connected!");

            var sql_name = 'SELECT  name FROM fm_staff GROUP BY stt DESC;';

            console.log(sql_name);

            name_co.query(sql_name, function (err, listname) {
                name_co.release()
                namee = ""
                if (listname.length > 0) {
                    for (i = 0; i < listname.length; i++) {
                        namee += "<option>" + listname[i].name + "</option>"
                    }
                }
                // res.render('wo.ejs', {user: req.user[0].user,note: req.user[0].note, namee: namee});
                // console.log(pos);
                conn.getConnection(function (err, name_sp) {

                    if (err) throw err;

                    console.log("Connected!");

                    var sql_namesp = 'SELECT NAMEE FROM spare;';

                    console.log(sql_namesp);

                    name_sp.query(sql_namesp, function (err, listnamesp) {
                        name_sp.release()
                        nameesp = ""
                        if (listnamesp.length > 0) {
                            for (i = 0; i < listnamesp.length; i++) {
                                nameesp += "<option>" + listnamesp[i].NAMEE + "</option>"
                            }
                        }
                        con.getConnection(function (err, inforuser) {

                            if (err) throw err;

                            console.log("Connected!");

                            var sql_user = 'SELECT Email, Department FROM setup_user where User="' + username + '";';

                            console.log(sql_user);

                            inforuser.query(sql_user, function (err, inforuserr) {
                                inforuser.release()
                                // console.log(inforuserr[0].)
                                // console.log(inforuserr[0][1])
                                res.render('fmservice.ejs', { mail: inforuserr[0].Email, depart: inforuserr[0].Department, user: req.user[0].user, note: req.user[0].note, namee: namee, nameesp: nameesp });
                                // console.log(pos);
                            })
                        })
                    })
                })
            })
        })
    })


    //---------------------------SPARE----------------------------

    app.get('/spare/loading_data', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT * FROM spare ;';
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    app.post('/spare/update', function (req, res) {

        var user = req.user[0].user;
        var id = req.body.id;
        var category = req.body.category;
        var name = req.body.name;
        var quanity = req.body.quanity;
        var limit = req.body.limit;
        var unit = req.body.unit;
        var brand = req.body.brand;
        var desc = req.body.desc;
        var pos = req.body.pos;
        var status = req.body.status;
        var expired = req.body.expired;
        var image = req.body.image;
        var reason = req.body.reason;
        imagee = "./public/img_spare/" + image;

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'select * from spare where id="' + id + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fieldss) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                if (fieldss.length > 0) {
                    var category1 = fieldss[0].CATEGORY;
                    var namee1 = fieldss[0].NAMEE;
                    var qty1 = fieldss[0].QTY;
                    var limit1 = fieldss[0].LIMITT;
                    var descc1 = fieldss[0].DESCC;
                    var pos1 = fieldss[0].POS;
                    var statuss1 = fieldss[0].STATUSS;
                    var expired1 = fieldss[0].EXPIRED;
                    // console.log(fieldss);

                    conn.getConnection(function (err, conupline) {
                        if (err) throw err;
                        if (imagee == "./public/img_spare/undefined") {
                            var sql_spare = 'update spare set category="' + category + '",qty="' + quanity + '",limitt="' + limit + '",unit="' + unit + '",brand="' + brand + '",descc="' + desc + '",pos="' + pos + '",statuss="' + status + '",expired="' + expired + '",user="' + user + '", timeupdate=now() where id="' + id + '";'
                        }
                        else {
                            var sql_spare = 'update spare set image="' + imagee + '", category="' + category + '",qty="' + quanity + '",limitt="' + limit + '",unit="' + unit + '",brand="' + brand + '",descc="' + desc + '",pos="' + pos + '",statuss="' + status + '",expired="' + expired + '",user="' + user + '", timeupdate=now() where id="' + id + '";'
                        }
                        console.log(sql_spare)
                        conupline.query(sql_spare, function (err, fields) {

                            conupline.release();

                            if (err) {

                                res.send("no")

                                res.end();

                                throw err;

                            }
                            conn.getConnection(function (err, conupline) {
                                if (err) throw err;
                                var sql_spare = 'insert into his_spare (user, time, objs, reason, qty_old,limit_old,expried_old,position_old,status_old, name_old, qty_new,limit_new,expried_new,position_new,status_new, name_new ) values ("' + user + '",now(),"' + id + '","' + reason + '","' + qty1 + '","' + limit1 + '","' + expired1 + '","' + pos1 + '","' + statuss1 + '","' + namee1 + '","' + quanity + '","' + limit + '","' + expired + '","' + pos + '","' + status + '","' + name + '");'
                                console.log(sql_spare)
                                conupline.query(sql_spare, function (err, fields) {

                                    conupline.release();

                                    if (err) {

                                        res.send("no")

                                        res.end();

                                        throw err;

                                    }

                                    // conn.getConnection(function(err, conupline) {
                                    //     if (err) throw err;
                                    //     var sql_spare = 'insert into his_spare (reason, useredit, timeedit, id, category,namee,qty, limitt, descc, pos,statuss,expired) values ("' + reason + '","' + user + '",now(),"' + id + '","' + category + '","' + name + '","' + quanity + '","' + limit+ '","' + desc + '","' + pos + '","' + status + '","' + expired + '");'
                                    //     console.log(sql_spare)
                                    //     conupline.query(sql_spare, function(err, fields) {

                                    //     conupline.release();

                                    //     if (err) {

                                    //         res.send("no")

                                    //         res.end();

                                    //         throw err;

                                    //     }

                                    res.send("ok")
                                    res.end();
                                    // })                            
                                    // })
                                })
                            })
                        })
                    })
                }
            })
        })
    })

    app.post('/sparen/imgupload', function (req, res) {
        console.log("j");
        var form = new formidable.IncomingForm();
        imgfile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            imgfile = file.name;
            console.log(imgfile);
            file.path = './public/img_spare/' + imgfile;
            console.log(file.path);
            // res.send(file.path);
        });
    })

    app.post('/spare/loadif', function (req, res) {

        var id = req.body.id;
        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM spare WHERE ID="' + id + '" ;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, qi) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(qi);
                res.send(qi)
                res.end();
            })

        })

    })

    app.post('/spare/insert', function (req, res) {

        var user = req.user[0].user;
        var id = req.body.id;
        var category = req.body.category;
        var name = req.body.name;
        var quanity = req.body.quanity;
        var limit = req.body.limit;
        var unit = req.body.unit;
        var brand = req.body.brand;
        var desc = req.body.desc;
        var pos = req.body.pos;
        var status = req.body.status;
        var expired = req.body.expired;
        var image = req.body.image;
        imagee = "./public/img_spare/" + image;

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            if (imagee == "./public/img_spare/undefined") {
                var sql_spare = 'insert into spare (id, category,namee,qty, limitt, unit, brand, descc, pos,statuss,expired,image,user,timeupdate) values ("' + id + '","' + category + '","' + name + '","' + quanity + '","' + limit + '","' + unit + '","' + brand + '","' + desc + '","' + pos + '","' + status + '","' + expired + '","./public/img_spare/noimg.png","' + user + '",now());'
            }
            else {
                var sql_spare = 'insert into spare (id, category,namee,qty, limitt, unit, brand, descc, pos,statuss,expired,image,user,timeupdate) values ("' + id + '","' + category + '","' + name + '","' + quanity + '","' + limit + '","' + unit + '","' + brand + '","' + desc + '","' + pos + '","' + status + '","' + expired + '","' + imagee + '","' + user + '",now());'
            }
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

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

    })

    app.post('/spare/delete', function (req, res) {
        var id = req.body.id;

        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            var sql_upline = 'delete from spare where id="' + id + '";'
            // console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
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

    })

    app.post('/spare/download_excel_File', function (req, res) {
        console.log("heeee")
        let options = {
            mode: 'text',
            pythonPath: 'python',
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
            // args:[excelFile]
        };
        // console.log("hi")
        PythonShell.run('exportspare.py', options, function (err, result) {
            if (err) throw err;
            console.log("download")
            // result is an array consisting of messages collected 
            //during execution of script.
            //console.log('result: ', result.toString());
            res.send(result.toString())
        });
    })

    app.post('/spare/Upload_multi_img', function (req, res) {
        // var dt = datetime.create();
        // var format_date = dt.format("YmdHMS");
        console.log("eee");
        var form = new formidable.IncomingForm();
        excelFile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            excelFile = file.name;
            file.path = './public/img_spare/' + excelFile;
        });
        res.send("ok")
        res.end()
    })
    //---------------------------SPARE_NEW-----------------------------

    app.get('/sparen/loading_data', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT Stt,Id,Name,Image,Location,Qty,Qty_min,Unit,Mc FROM spare_new ORDER BY Stt ASC ;';
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    app.post('/sparen/update', function (req, res) {

        var user = req.user[0].user;
        var id = req.body.id;
        var name = req.body.name;
        var mc = req.body.mc;
        var qty = req.body.qty;
        var qtymax = req.body.qtymax;
        var qtymin = req.body.qtymin;
        var unit = req.body.unit;
        var pos = req.body.pos;
        var image = req.body.image;
        var reason = req.body.reason;
        var price = req.body.price;
        var number = req.body.number;
        var fre = req.body.fre;
        var note = req.body.note;
        var qtyim = req.body.qtyim;
        var qtyex = req.body.qtyex;
        imagee = "./public/img_spare/" + image;

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'select * from spare_new where id="' + id + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fieldss) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                if (fieldss.length > 0) {
                    var name1 = fieldss[0].Name;
                    var qty1 = fieldss[0].Qty;
                    var qtymin1 = fieldss[0].Qty_min;
                    var qtymax1 = fieldss[0].Qty_max;
                    var pos1 = fieldss[0].Location;
                    var price1 = fieldss[0].Price;
                    var fre1 = fieldss[0].Fre_order;
                    if (reason == 'Nhập') {
                        qty = qty - (-qtyim)
                    } else if (reason == 'Xuất') {
                        qty = qty - (qtyex)
                    }
                    // console.log(fieldss);

                    conn.getConnection(function (err, conupline) {
                        if (err) throw err;
                        if (imagee == "./public/img_spare/undefined") {
                            var sql_spare = 'update spare_new set Id="' + id + '",Name="' + name + '",Location="' + pos + '",Price="' + price + '",Mc="' + mc + '",Part_number="' + number + '",Unit="' + unit + '",Qty_min="' + qtymin + '",Qty_max="' + qtymax + '",Note="' + note + '", Fre_order="' + fre + '", User_update="' + user + '", Time_update=now(),Qty="' + qty + '" where id="' + id + '";'
                        }
                        else {
                            // var sql_spare = 'update spare set image="'+ imagee +'", category="' + category + '",qty="' + quanity + '",limitt="' + limit + '",unit="' + unit + '",brand="' + brand + '",descc="' + desc + '",pos="' + pos + '",statuss="' + status + '",expired="' + expired + '",user="'+user+'", timeupdate=now() where id="' + id+ '";'
                            var sql_spare = 'update spare_new set Image="' + imagee + '",Id="' + id + '",Name="' + name + '",Location="' + pos + '",Price="' + price + '",Mc="' + mc + '",Part_number="' + number + '",Unit="' + unit + '",Qty_min="' + qtymin + '",Qty_max="' + qtymax + '",Note="' + note + '", Fre_order="' + fre + '", User_update="' + user + '", Time_update=now(),Qty="' + qty + '" where id="' + id + '";'
                        }
                        console.log(sql_spare)
                        conupline.query(sql_spare, function (err, fields) {

                            conupline.release();

                            if (err) {

                                res.send("no")

                                res.end();

                                throw err;

                            }
                            if (reason != "") {
                                conn.getConnection(function (err, conupline) {
                                    if (err) throw err;
                                    var sql_spare = 'insert into his_spare (user, time, objs, reason, qty_old,name_old,limit_old,max_old,price_old,position_old, fre_old, qty_new,name_new,limit_new,max_new,price_new,position_new, fre_new) values ("' + user + '",now(),"' + id + '","' + reason + '","' + qty1 + '","' + name1 + '","' + qtymin1 + '","' + qtymax1 + '","' + price1 + '","' + pos1 + '","' + fre1 + '","' + qty + '","' + name + '","' + qtymin + '","' + qtymax + '","' + price + '","' + pos + '","' + fre + '");'
                                    console.log(sql_spare)
                                    conupline.query(sql_spare, function (err, fields) {

                                        conupline.release();

                                        if (err) {

                                            res.send("no")

                                            res.end();

                                            throw err;

                                        }


                                        res.send("ok")
                                        res.end();
                                        // })                            
                                        // })
                                    })
                                })
                            } else {
                                res.send("ok")
                                res.end();
                            }
                        })
                    })
                }
            })
        })
    })

    app.post('/spare/imgupload', function (req, res) {
        console.log("j");
        var form = new formidable.IncomingForm();
        imgfile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            imgfile = file.name;
            console.log(imgfile);
            file.path = './public/img_spare/' + imgfile;
            console.log(file.path);
            // res.send(file.path);
        });
    })

    app.post('/sparen/loadif', function (req, res) {

        var id = req.body.id;
        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM spare_new WHERE ID="' + id + '" ;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, qi) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(qi);
                res.send(qi)
                res.end();
            })

        })

    })

    app.post('/sparen/insert', function (req, res) {

        var user = req.user[0].user;
        var id = req.body.id;
        var name = req.body.name;
        var mc = req.body.mc;
        var qty = req.body.qty;
        var qtymax = req.body.qtymax;
        var qtymin = req.body.qtymin;
        var unit = req.body.unit;
        var pos = req.body.pos;
        var image = req.body.image;
        var reason = req.body.reason;
        var price = req.body.price;
        var number = req.body.number;
        var fre = req.body.fre;
        var note = req.body.note;
        imagee = "./public/img_spare/" + image;

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            if (imagee == "./public/img_spare/undefined") {
                var sql_spare = 'insert into spare_new (Id,Name,Location,Price,Mc,Part_number,Unit,Qty_min,Qty_max,Note, Fre_order, User_update, Time_update,Qty,Image) values ("' + id + '","' + name + '","' + pos + '","' + price + '","' + mc + '","' + number + '","' + unit + '","' + qtymin + '","' + qtymax + '","' + note + '","' + fre + '","' + user + '",now(),"' + qty + '","./public/img_spare/noimg.png");'
            }
            else {
                var sql_spare = 'insert into spare_new (Id,Name,Location,Price,Mc,Part_number,Unit,Qty_min,Qty_max,Note, Fre_order, User_update, Time_update,Qty,Image) values ("' + id + '","' + name + '","' + pos + '","' + price + '","' + mc + '","' + number + '","' + unit + '","' + qtymin + '","' + qtymax + '","' + note + '","' + fre + '","' + user + '",now(),"' + qty + '","' + imagee + '");'
            }
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

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

    })

    app.post('/sparen/delete', function (req, res) {
        var id = req.body.id;

        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            var sql_upline = 'delete from spare_new where id="' + id + '";'
            console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
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

    })

    app.post('/spare/download_excel_File', function (req, res) {
        console.log("heeee")
        let options = {
            mode: 'text',
            pythonPath: 'python',
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
            // args:[excelFile]
        };
        // console.log("hi")
        PythonShell.run('exportspare.py', options, function (err, result) {
            if (err) throw err;
            console.log("download")
            // result is an array consisting of messages collected 
            //during execution of script.
            //console.log('result: ', result.toString());
            res.send(result.toString())
        });
    })

    app.post('/spare/Upload_multi_img', function (req, res) {
        // var dt = datetime.create();
        // var format_date = dt.format("YmdHMS");
        console.log("eee");
        var form = new formidable.IncomingForm();
        excelFile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            excelFile = file.name;
            file.path = './public/img_spare/' + excelFile;
        });
        res.send("ok")
        res.end()
    })

    app.post('/spare/Upload_excel_File', function (req, res) {
        // var dt = datetime.create();
        // var format_date = dt.format("YmdHMS");
        console.log("Uploadfile_machine");
        var form = new formidable.IncomingForm();
        excelFile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            excelFile = req.user[0].user + file.name;
            file.path = './public/spare/' + excelFile;
        });
        form.on('file', function (name, file) {
            console.log("nay")
            let options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                args: [excelFile]
            };
            // console.log("hi")
            PythonShell.run('uploadspare.py', options, function (err, result) {
                if (err) throw err;
                // result is an array consisting of messages collected 
                //during execution of script.
                //console.log('result: ', result.toString());
                res.send(result.toString())
            });
        })
    })

    app.post('/spare/Upload_excel_Fileic', function (req, res) {
        // var dt = datetime.create();
        // var format_date = dt.format("YmdHMS");
        console.log("Uploadfile_spare_ic238");
        var form = new formidable.IncomingForm();
        excelFile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            excelFile = req.user[0].user + file.name;
            file.path = './public/spare/' + excelFile;
        });
        form.on('file', function (name, file) {
            console.log("nay")
            let options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                args: [excelFile]
            };
            // console.log("hi")
            PythonShell.run('uploadspareic.py', options, function (err, result) {
                if (err) throw err;
                // result is an array consisting of messages collected 
                //during execution of script.
                //console.log('result: ', result.toString());
                res.send(result.toString())
            });
        })
    })
    //---------------------------WORK_ORDER----------------------------

    app.post('/wo/send_wo_to_staff', function (req, res) {
        var id = req.body.id;
        var staff = req.body.staff;
        var date = new Date();
        date = change_time(date);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'select user_req,id,user_rec,place_req,leve_rec,FM_staff from work_order where id="' + id + '" ;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fieldss) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                conn.getConnection(function (err, conupline) {
                    if (err) throw err;
                    var sql_spare = 'select email from fm_staff where name="' + staff + '" ;'
                    console.log(sql_spare)
                    conupline.query(sql_spare, function (err, fields) {

                        conupline.release();

                        if (err) {

                            res.send("no")

                            res.end();

                            throw err;

                        }
                        let options = {
                            mode: 'text',
                            pythonPath: 'python',
                            pythonOptions: ['-u'], // get print results in real-time
                            scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                            args: [id, fieldss[0].user_req, date, fieldss[0].id, fieldss[0].user_rec, fieldss[0].place_req, fieldss[0].leve_rec, fields[0].email, fields[0].FM_staff]
                        };
                        PythonShell.run('send_mms.py', options, function (err, result) {
                            if (err) throw err;
                            res.send(result.toString())
                        })
                    })
                })
            })
        })
    })

    app.post('/wo/search', function (req, res) {
        var name = req.body.name;
        var level = req.body.level;
        var day1 = req.body.day1;
        var day2 = req.body.day2;
        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM work_order WHERE id LIKE "' + name + '" AND leve_req LIKE "' + level + '" AND time_req>"' + day1 + '" AND time_req<"' + day2 + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, search) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(search);
                res.send(search)
                res.end();
            })

        })

    });

    app.get('/work_oder/loading_dataPM', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            // var sql_book = 'SELECT * FROM work_order where id like "PM%" ;';
            var sql_book = 'SELECT * FROM work_order where id like "PM%" AND time_req > DATE_ADD(NOW(),INTERVAL -7 DAY) AND time_req < DATE_ADD(NOW(),INTERVAL 7 DAY)UNION SELECT * FROM work_order WHERE (id like "PM%" AND status_work="Đang thực hiện") OR (id like "PM%" AND status_work="Chưa xử lý") ORDER BY id;'
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    });

    app.get('/work_oder/loading_dataCM', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            // var sql_book = 'SELECT * FROM work_order where id like "CM%" ;';
            var sql_book = 'SELECT * FROM work_order where id like "CM%" AND time_req > DATE_ADD(NOW(),INTERVAL -7 DAY) AND time_req < DATE_ADD(NOW(),INTERVAL 7 DAY)UNION SELECT * FROM work_order WHERE (id like "CM%" AND status_work="Đang thực hiện") OR (id like "CM%" AND status_work="Chưa xử lý") ORDER BY time_req DESC;'
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    });

    app.get('/work_oder/loading_dataSE', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            // var sql_book = 'SELECT * FROM work_order where id like "SE%" ;';
            var sql_book = 'SELECT * FROM work_order where id like "SE%" AND time_req > DATE_ADD(NOW(),INTERVAL -7 DAY) AND time_req < DATE_ADD(NOW(),INTERVAL 7 DAY)UNION SELECT * FROM work_order WHERE (id like "SE%" AND status_work="Đang thực hiện") OR (id like "SE%" AND status_work="Chưa xử lý") ORDER BY time_req DESC;'
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    });

    app.get('/work_oder/loading_dataSEerp', function (req, res) {
        var user = req.user[0].user;

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            // var sql_book = 'SELECT * FROM work_order where id like "SE%" ;';
            var sql_book = 'SELECT * FROM work_order where id like "SE%" AND user= "' + user + '" ORDER BY time_req DESC;'
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    });

    function change_time(time) {
        return (new Date(time)).toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
    }

    function change_time3(time) {
        return (new Date(time)).toLocaleDateString('en-US');

    }

    app.post('/w_order/insert', function (req, res) {

        var departreq = req.body.departreq;
        var userreq = req.body.staffreq;
        var typereq = req.body.typereq;
        var typeeq = req.body.typeeq;
        var contentreq = req.body.contentreq;
        var placereq = req.body.placereq;
        var levereq = req.body.levereq;
        var timereq = req.body.timereq;
        var timeendreq = req.body.timeendreq;
        var email = req.body.email;
        var phone = req.body.phone;
        var user = req.user[0].user;
        console.log(userreq);
        if (userreq.length < 1) { userreq = user; }
        var now = new Date();
        now = change_time(now)
        var timeendreqq = change_time3(timeendreq);

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            if (typereq == "Sửa chữa" || typereq == "Dịch vụ") { var sql_spare = 'SELECT id FROM work_order WHERE id LIKE "SE%" ORDER BY id DESC LIMIT 1;' }
            else if (typereq == "Bảo dưỡng định kỳ") { var sql_spare = 'SELECT id FROM work_order WHERE id LIKE "PM%" ORDER BY id DESC LIMIT 1;' }
            else { var sql_spare = 'SELECT id FROM work_order WHERE id LIKE "CM%" ORDER BY id DESC LIMIT 1;' }
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                if (fields.length > 0) {
                    console.log(fields)
                    var num = fields[0].id;
                    num = parseInt(num.substr(num.length - 6, num.length)) + 1;
                    num = "000000" + num
                    num = num.substr(num.length - 6, num.length);
                    console.log(num)

                } else { num = "000001" }

                if (typereq == "Sửa chữa" || typereq == "Dịch vụ") { num = "SE" + num; }
                else if (typereq == "Bảo dưỡng định kỳ") { num = "PM" + num; }
                else { num = "CM" + num; }
                // console.log(num)
                // var namee1=fieldss[0].NAMEE;
                // var qty1=fieldss[0].QTY;
                // var limit1=fieldss[0].LIMITT;
                conn.getConnection(function (err, conupline) {
                    if (err) throw err;
                    var sql_spare = 'insert into work_order (depart_req,type_req,req,place_req,user_req,time_req,timeend_req,leve_req,id,status_work,emailreq,phonenum,user) values ("' + departreq + '","' + typereq + '","' + contentreq + '","' + placereq + '","' + userreq + '",now(),"' + timeendreq + '","' + levereq + '","' + num + '","Chưa phân công","' + email + '","' + phone + '","' + user + '");'
                    console.log(sql_spare)
                    conupline.query(sql_spare, function (err, fields) {

                        conupline.release();

                        if (err) {

                            res.send("no")

                            res.end();

                            throw err;

                        }
                        res.send("ok")
                        res.end()
                        let options = {
                            mode: 'text',
                            pythonPath: 'python',
                            pythonOptions: ['-u'], // get print results in real-time
                            scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                            args: [now, num, userreq, placereq, contentreq, timeendreqq]
                        };
                        //  console.log("guwir mail")
                        PythonShell.run('mail_to_fm.py', options, function (err, result) {
                            if (err) throw err;
                            console.log("mail to FM")
                            // res.send(result.toString())
                            // res.end();
                        })
                    })

                })
            })

        })
    })

    app.post('/w_order/loading_req', function (req, res) {

        var id = req.body.id;

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_spare = 'SELECT * FROM work_order WHERE id="' + id + '" ';
            console.log(sql_spare)
            connection.query(sql_spare, function (err, data) {

                connection.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(data);
                res.send(data)
                res.end();
            })
        })
    })

    app.post('/w_order/delete_req', function (req, res) {
        console.log("hi");
        var id = req.body.id;

        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            var sql_upline = 'delete from work_order where id="' + id + '";'
            // console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
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

    })

    app.post('/w_order/delete_req', function (req, res) {
        console.log("hi");
        var id = req.body.id;

        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            var sql_upline = 'delete from work_order where id="' + id + '";'
            // console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
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

    })

    app.post('/work_oder/numrow', function (req, res) {

        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            // var sql_upline = 'SELECT id FROM work_order ORDER BY time_req DESC LIMIT 1;'
            var sql_upline = 'SELECT COUNT(*) as aa FROM work_order;'
            // console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
                conupline.release();
                console.log(fields)

                if (err) {

                    // res.send("no")

                    res.end();

                    throw err;

                }

                res.send(fields)

                res.end();

            })

        })

    })

    app.post('/w_order/update', function (req, res) {

        var departreq = req.body.departreq;
        var userreq = req.body.staffreq;
        var typereq = req.body.typereq;
        var typeeq = req.body.typeeq;
        var contentreq = req.body.contentreq;
        var placereq = req.body.placereq;
        // var procer = req.body.procer;
        var levereq = req.body.levereq;
        // var statusreq = req.body.statusreq;
        var id = req.body.id;
        var user = req.user[0].user;

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'update work_order set depart_req="' + departreq + '",type_req="' + typereq + '",type_eq="' + typeeq + '",req="' + contentreq + '",place_req="' + placereq + '", user_req="' + userreq + '",time_req=now(),leve_req="' + levereq + '",time_rec=now(),time_exe=now(), time_confirm=now() where id="' + id + '";'
            // var sql_spare = 'insert into work_order (depart_req,type_req,type_eq,req,place_req,user_req,time_req,leve_req,status_req,procer,time_rec,time_exe, time_confirm,id) values ("' + departreq + '","' + typereq + '","' + typeeq + '","' + contentreq + '","' + placereq+ '","' + userreq + '",now(),"' + levereq + '","' + statusreq + '","' + procer + '",now(),now(),now(),"' + id + '");'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

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
    })

    app.post('/w_order/infordis', function (req, res) {

        var idreqq = req.body.idreqq;
        var typework = req.body.typework;
        var statuswork = req.body.statuswork;
        var namework = req.body.namework;
        // var process = req.body.process;
        var datestart = req.body.datestart;
        var durawork = req.body.durawork;
        // var contentwork = req.body.contentwork;
        var staffwork = req.body.staffwork;
        var leverec = req.body.leverec;
        var solution = req.body.solution;
        var reason = req.body.reason;
        var user = req.user[0].user;
        var timereq = req.body.timereq;
        var eq = req.body.eq;
        var cycle = req.body.cycle;
        // if (str(datestart))

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'update work_order set status_work="Đang thực hiện",user_rec="' + user + '",time_rec=now(), type_work="' + typework + '",name_work="' + namework + '",time_exe="' + datestart + '", time_commit="' + durawork + '",FM_staff="' + staffwork + '",leve_rec="' + leverec + '",reason="' + reason + '",solution="' + solution + '", progress="0" where id="' + idreqq + '";'
            // var sql_spare = 'insert into work_order (depart_req,type_req,type_eq,req,place_req,user_req,time_req,leve_req,status_req,procer,time_rec,time_exe, time_confirm,id) values ("' + departreq + '","' + typereq + '","' + typeeq + '","' + contentreq + '","' + placereq+ '","' + userreq + '",now(),"' + levereq + '","' + statusreq + '","' + procer + '",now(),now(),now(),"' + id + '");'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }


                conn.getConnection(function (err, conuplinee) {
                    if (err) throw err;
                    var sql = 'update work_schedule_detail set Staff="' + staffwork + '" where Objs="' + eq + '" AND Date="' + timereq + '" AND Cycle="' + cycle + '";'
                    // var sql_spare = 'insert into work_order (depart_req,type_req,type_eq,req,place_req,user_req,time_req,leve_req,status_req,procer,time_rec,time_exe, time_confirm,id) values ("' + departreq + '","' + typereq + '","' + typeeq + '","' + contentreq + '","' + placereq+ '","' + userreq + '",now(),"' + levereq + '","' + statusreq + '","' + procer + '",now(),now(),now(),"' + id + '");'
                    console.log(sql)
                    conuplinee.query(sql, function (err, fields) {

                        conuplinee.release();

                        if (err) {

                            res.send("no")

                            res.end();

                            throw err;

                        }

                        res.send("ok")
                        res.end();
                    })

                })
            })

        })
    })

    app.post('/w_order/comment', function (req, res) {

        var idreqq = req.body.idreqq;
        var progress = req.body.progress;
        var quality = req.body.quality;
        var comment = req.body.comment;


        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'update work_order set progress="' + progress + '",quality="' + quality + '",comment="' + comment + '" where id="' + idreqq + '";'
            // var sql_spare = 'insert into work_order (depart_req,type_req,type_eq,req,place_req,user_req,time_req,leve_req,status_req,procer,time_rec,time_exe, time_confirm,id) values ("' + departreq + '","' + typereq + '","' + typeeq + '","' + contentreq + '","' + placereq+ '","' + userreq + '",now(),"' + levereq + '","' + statusreq + '","' + procer + '",now(),now(),now(),"' + id + '");'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

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
    })

    app.post('/wo/loadsp', function (req, res) {

        var idreq = req.body.idreq;

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_spare = 'SELECT * from temtable WHERE wo="' + idreq + '";'
            console.log(sql_spare)
            connection.query(sql_spare, function (err, data) {

                connection.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(data);
                res.send(data)
                res.end();
            })
        })
    })

    app.post('/wo/deletesp', function (req, res) {
        var i = req.body.idreq;
        var id = req.body.idspare;
        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            var sql_upline = 'delete from temtable where wo="' + i + '" and idpart="' + id + '";'
            console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
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

    })

    //---------------------------PART_LOG----------------------------

    app.post('/part_log/download_excel_File', function (req, res) {
        var date1 = req.body.date1;
        var date2 = req.body.date2;
        console.log(date1);
        console.log(date2);
        console.log("download_excel_File")
        let options = {
            mode: 'text',
            pythonPath: 'python',
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
            args: [date1, date2]
        };
        // console.log("hi")
        PythonShell.run('exportissue.py', options, function (err, result) {
            if (err) throw err;
            console.log("download")
            // result is an array consisting of messages collected 
            //during execution of script.
            //console.log('result: ', result.toString());
            res.send(result.toString())
        });
    })

    app.get('/part_log/loading_data', function (req, res) {

        var user = req.user[0].user;

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT * FROM part_log WHERE user_req="' + user + '" ORDER BY time_req DESC ;';
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    app.get('/part_log/loading_dataa', function (req, res) {

        var user = req.user[0].user;

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT * FROM part_log ORDER BY time_req DESC ;';
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    app.get('/spare/loading_dataid', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT * FROM spare;';
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    app.post('/part_log/insertreq', function (req, res) {

        var name = req.body.name;
        var depart_req = req.body.depart_req;
        var idpart = req.body.idpart;
        var work_req = req.body.work_req;
        var qty_req = req.body.qty_req;
        var note = req.body.note;
        var user = req.user[0].user;
        console.log("hiiiiii");
        // var key= idpart + now();

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            // if (idp)      
            var sql_spare = 'insert into part_log (namepart,idpart, fm_staff,ty_req,wo, time_req,qty_req,note,status,time_issue,keyy) values ("' + name + '","' + idpart + '","' + user + '","' + work_req + '","' + depart_req + '",now(),"' + qty_req + '","' + note + '","Chờ xử lý",now(),CONCAT("' + depart_req + idpart + '",NOW()));'

            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

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

    })

    app.post('/part_log/insertreqq', function (req, res) {

        var userr = req.user[0].user;
        var name = req.body.name;
        var idpart = req.body.idpart;
        var qty_req = req.body.qty_req;
        var work_req = req.body.wo;
        var note = req.body.note;
        var user = req.body.user;
        var email = req.body.email;
        var phone = req.body.phone;
        var departreq = req.body.departreq;
        console.log("hiiiiii");
        console.log(user);
        console.log("hii");
        if (user == "") { var user = req.user[0].user; }

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT Id FROM part_log ORDER BY Id DESC LIMIT 1;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                if (fields.length > 0) {
                    console.log(fields)
                    var num = String(fields[0].Id);
                    console.log(num)
                    num = parseInt(num.substr(num.length - 6, num.length)) + 1;
                    num = "000000" + num
                    console.log(num)
                    num = num.substr(num.length - 6, num.length);
                    console.log(num)

                } else { num = "000001" }

                num = "VT" + num;

                conn.getConnection(function (err, conupline) {
                    if (err) throw err;
                    // if (idp)      
                    var sql_spare = 'insert into part_log (user_req,Id,namepart,idpart, fm_staff,wo, time_req,qty_req,note,status,keyy,depart_req,phon_num,email) values ("' + userr + '","' + num + '","' + name + '","' + idpart + '","' + user + '","' + work_req + '",now(),"' + qty_req + '","' + note + '","Chờ xử lý",CONCAT("' + userr + idpart + '",NOW()),"' + departreq + '","' + phone + '","' + email + '");'

                    console.log(sql_spare)
                    conupline.query(sql_spare, function (err, field) {

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
            })
        })

    })

    app.post('/part_log/insertissue', function (req, res) {

        var note = req.body.note;
        var qty_issue = req.body.qty_issue;
        var user = req.user[0].user;
        var idpart = req.body.idpart;
        var listmc = req.body.listmc;
        var time = req.body.time;
        var id = req.body.id;
        var idreq = req.body.idreq;
        var keyy = req.body.keyy;
        console.log(id);
        console.log(qty_issue);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT Qty,Qty_ex FROM spare_new where id="' + idpart + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields1) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                if (fields1.length > 0) {
                    var qty = fields1[0].Qty;
                    var ex = fields1[0].Qty_ex;

                    var qty1 = qty - qty_issue;
                    var qty2 = ex - (-qty_issue);
                    console.log(qty1);
                    console.log(qty2);


                    conn.getConnection(function (err, conupline) {
                        if (err) throw err;
                        // if (idreq=='')
                        // {}
                        // else{
                        var sql_spare = 'update part_log set user_issue="' + user + '",time_issue=now(),qty_issue="' + qty_issue + '",note="' + note + '",status="Đã cấp" where keyy="' + keyy + '"';
                        // }
                        console.log(sql_spare)
                        conupline.query(sql_spare, function (err, fields) {

                            conupline.release();

                            if (err) {

                                res.send("no")

                                res.end();

                                throw err;

                            }
                            conn.getConnection(function (err, conupline) {
                                if (err) throw err;
                                var sql_spare = 'update spare_new set Qty="' + qty1 + '",Qty_ex="' + qty2 + '" where id="' + idpart + '";'
                                console.log(sql_spare)
                                conupline.query(sql_spare, function (err, fields) {

                                    conupline.release();

                                    if (err) {

                                        res.send("no")

                                        res.end();

                                        throw err;

                                    }
                                    conn.getConnection(function (err, conupline) {
                                        if (err) throw err;
                                        var sql_spare = 'insert into his_spare (reason,user, time,qty_old,qty_new,objs) values ("' + "Issue_" + idreq + "_" + time + '","' + user + '",now(),"' + qty + '","' + qty1 + '","' + idpart + '");'
                                        console.log(sql_spare)
                                        conupline.query(sql_spare, function (err, fields) {

                                            conupline.release();

                                            if (err) {

                                                res.send("no")

                                                res.end();

                                                throw err;

                                            }

                                            // conn.getConnection(function(err, conupline) {
                                            //     if (err) throw err;
                                            //     var sql_spare = 'insert into his_spare (reason, useredit, timeedit, qty) values ("' +"Issue_"+idreq+"_"+time+ '","' + user + '",now(),"' + qty1 + '");'
                                            //     console.log(sql_spare)
                                            //     conupline.query(sql_spare, function(err, fields) {

                                            //     conupline.release();

                                            //     if (err) {

                                            //         res.send("no")

                                            //         res.end();

                                            //         throw err;

                                            //     }

                                            res.send("ok")
                                            res.end();
                                            // })                            
                                            // })
                                        })
                                    })
                                })
                            })
                        })
                    })
                }

            })
        })

    })

    app.post('/part_log/loadidpart', function (req, res) {

        var listipart = req.body.listipart;


        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT ID FROM SPARE WHERE NAMEE="' + listipart + '" ;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, idpart) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(idpart);
                res.send(idpart)
                res.end();
            })

        })

    })

    app.post('/part_log/updatereq', function (req, res) {

        var listmc = req.body.listmc;
        var work_order = req.body.work_order;
        var qty_req = req.body.qty_req;
        var note = req.body.note;
        var user = req.user[0].user;
        var time = req.body.time;

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'update part_log set mc_code="' + listmc + '",qty_req="' + qty_req + '",note="' + note + '" where time_req="' + time + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

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

    })

    app.post('/part_log/loadqty', function (req, res) {
        console.log("hi");

        var listipart = req.body.listipart;
        console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT QTY FROM SPARE WHERE NAMEE="' + listipart + '" ;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, qty) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(qty);
                res.send(qty)
                res.end();
            })

        })

    })

    app.post('/part_log/loadqtyy', function (req, res) {
        console.log("hi");

        var listipart = req.body.listipart;
        console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT Qty,Name FROM spare_new WHERE ID="' + listipart + '" ;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, qty) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(qty);
                res.send(qty)
                res.end();
            })

        })

    })

    app.post('/part_log/loadinf', function (req, res) {
        console.log("hi");

        var listipart = req.body.listipart;
        console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT Qty,Id FROM spare_new WHERE Name="' + listipart + '" ;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, qi) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(qi);
                res.send(qi)
                res.end();
            })

        })

    })

    app.post('/part_log/loadsp', function (req, res) {

        var idreq = req.body.idreq;

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_spare = 'SELECT * from part_log WHERE wo="' + idreq + '";'
            console.log(sql_spare)
            connection.query(sql_spare, function (err, data) {

                connection.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(data);
                res.send(data)
                res.end();
            })
        })
    })

    app.post('/part_log/insertreqwo', function (req, res) {

        var stt = req.body.stt;
        var name = req.body.name;
        var idpart = req.body.idpart;
        var typework = req.body.typework;
        var qty_req = req.body.qty_req;
        var idreq = req.body.idreq,
            user = req.user[0].user;
        console.log(stt);
        // var now= now();
        // console.log(now)
        if (stt == 'Chưa cấp') {
            conn.getConnection(function (err, conupline) {
                if (err) throw err;
                var sql_spare = 'SELECT Id FROM part_log ORDER BY Id DESC LIMIT 1;'
                console.log(sql_spare)
                conupline.query(sql_spare, function (err, fields) {

                    conupline.release();

                    if (err) {

                        res.send("no")

                        res.end();

                        throw err;

                    }
                    if (fields.length > 0) {
                        console.log(fields)
                        var num = String(fields[0].Id);
                        console.log(num)
                        num = parseInt(num.substr(num.length - 6, num.length)) + 1;
                        num = "000000" + num
                        console.log(num)
                        num = num.substr(num.length - 6, num.length);
                        console.log(num)

                    } else { num = "000001" }

                    num = "VT" + num;

                    conn.getConnection(function (err, conupline) {
                        if (err) throw err;

                        var sql_spare = 'replace into part_log (Id, namepart,idpart, fm_staff,ty_req,wo, time_req,qty_req,status,keyy) values ("' + num + '","' + name + '","' + idpart + '","' + user + '","' + typework + '","' + idreq + '",now(),"' + qty_req + '","Chờ xử lý",CONCAT("' + idreq + idpart + '",NOW()));'
                        // var sql_spare = 'replace into part_log (namepart,idpart, fm_staff,ty_req,wo, time_req,qty_req,status,time_issue,keyy) values ("' + name + '","' + idpart + '","' + user + '","' +typework + '","' + idreq + '","'+now+'","' + qty_req + '","Chờ xử lý","'+now()+'","' +idreq+idpart+now'");'
                        console.log(sql_spare)
                        conupline.query(sql_spare, function (err, fields) {

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
                })

            })
        }


    })

    //---------------------------SCHEDULE----------------------------

    app.post('/schedule/search', function (req, res) {
        console.log("hi");

        var name = req.body.name;
        // var pos =req.body.pos;
        var priority = req.body.priority;
        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM work_schedule WHERE objs LIKE "' + name + '" AND priority LIKE "' + priority + '" ;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, search) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(search);
                res.send(search)
                res.end();
            })

        })

    })

    app.post('/schedule/delete', function (req, res) {
        var name = req.body.name;

        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            var sql_upline = 'delete from work_schedule where objs="' + name + '" ;'
            console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
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

    })

    app.post('/sche/loadinforsche', function (req, res) {

        var name = req.body.name;
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM work_schedule WHERE  objs= "' + name + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, inforsche) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(inforsche);
                res.send(inforsche)
                res.end();
            })

        })

    })

    app.get('/sche/loading_dataa', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT * FROM work_schedulee ORDER BY timeupdate DESC;';
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    app.post('/sche/loadinforschee', function (req, res) {

        var name = req.body.name;
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM work_schedulee WHERE  objs= "' + name + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, inforsche) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(inforsche);
                res.send(inforsche)
                res.end();
            })

        })

    })

    app.post('/schedule/deletee', function (req, res) {
        var name = req.body.name;

        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            var sql_upline = 'delete from work_schedulee where objs="' + name + '" ;'
            console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
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

    })

    app.post('/sche/insertt', function (req, res) {

        var user = req.body.user;
        var level = req.body.level;
        var staff = req.body.staff;
        var note = req.body.note;
        var nameold = req.body.nameold;
        var c1 = '' + req.body.c1;
        var c2 = '' + req.body.c2;
        var c3 = '' + req.body.c3;
        var d1 = '' + req.body.d1;
        var d2 = '' + req.body.d2;
        var d3 = '' + req.body.d3;
        // var user = req.user[0].user;
        cd = [c1, c2, c3, d1, d2, d3];
        for (var i = 0; i < cd.length; i++) {
            if (cd[i] == 'undefined') { cd[i] = ''; console.log(cd[i]); }
        }


        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            if (cd[1] == '') { var sql_spare = 'insert into work_schedulee (objs,' + cd[0] + ',priority,note,respond,user,timeupdate)  values ("' + nameold + '","' + cd[3] + '","' + level + '","' + note + '","' + staff + '","' + user + '",now());' }
            else if (cd[2] == '') { var sql_spare = 'insert into work_schedulee (objs,' + cd[0] + ',' + cd[1] + ',priority,note,respond,user,timeupdate)  values ("' + nameold + '","' + cd[3] + '","' + cd[4] + '","' + level + '","' + note + '","' + staff + '","' + user + '",now());' }
            else { var sql_spare = 'insert into work_schedulee (objs,' + cd[0] + ',' + cd[1] + ',' + cd[2] + ',priority,note,respond,user,timeupdate)  values ("' + nameold + '","' + cd[3] + '","' + cd[4] + '","' + cd[5] + '","' + level + '","' + note + '","' + staff + '","' + user + '",now());' }
            // var sql_spare = 'insert into work_schedulee (objs,' +cd[0]+ ',' +cd[1]+ ',' +cd[2]+ ',priority,note,respond,user,timeupdate)  values ("' +nameold+ '","' + cd[3] + '","' + cd[4] + '","' + cd[5] + '","' + level+ '","' + note + '","' + staff + '","'+user+'",now());'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

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
    })

    app.post('/sche/updatee', function (req, res) {

        var user = req.body.user;
        var level = req.body.level;
        var staff = req.body.staff;
        var note = req.body.note;
        var nameold = req.body.nameold;
        var c1 = '' + req.body.c1;
        var c2 = '' + req.body.c2;
        var c3 = '' + req.body.c3;
        var d1 = '' + req.body.d1;
        var d2 = '' + req.body.d2;
        var d3 = '' + req.body.d3;
        // var user = req.user[0].user;
        cd = [c1, c2, c3, d1, d2, d3];
        for (var i = 0; i < cd.length; i++) {
            if (cd[i] == 'undefined') { cd[i] = ''; console.log(cd[i]); }
        }

        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            var sql_upline = 'delete from work_schedulee where objs="' + nameold + '" ;'
            console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }

                conn.getConnection(function (err, conupline) {
                    if (err) throw err;
                    if (cd[1] == '') { var sql_spare = 'insert into work_schedulee (objs,' + cd[0] + ',priority,note,respond,user,timeupdate)  values ("' + nameold + '","' + cd[3] + '","' + level + '","' + note + '","' + staff + '","' + user + '",now());' }
                    else if (cd[2] == '') { var sql_spare = 'insert into work_schedulee (objs,' + cd[0] + ',' + cd[1] + ',priority,note,respond,user,timeupdate)  values ("' + nameold + '","' + cd[3] + '","' + cd[4] + '","' + level + '","' + note + '","' + staff + '","' + user + '",now());' }
                    else { var sql_spare = 'insert into work_schedulee (objs,' + cd[0] + ',' + cd[1] + ',' + cd[2] + ',priority,note,respond,user,timeupdate)  values ("' + nameold + '","' + cd[3] + '","' + cd[4] + '","' + cd[5] + '","' + level + '","' + note + '","' + staff + '","' + user + '",now());' }
                    // var sql_spare = 'insert into work_schedulee (objs,' +cd[0]+ ',' +cd[1]+ ',' +cd[2]+ ',priority,note,respond,user,timeupdate)  values ("' +nameold+ '","' + cd[3] + '","' + cd[4] + '","' + cd[5] + '","' + level+ '","' + note + '","' + staff + '","'+user+'",now());'
                    // var sql_spare = 'insert into work_schedulee (objs,cylcle1,cylcle2,cylcle3,priority,leadtime1, leadtime2, leadtime3,note,respond,user,timeupdate)  values ("' +nameold+ '","' + cd[0] + '","' + cd[1] + '","' + cd[2] + '","' + level+ '","' + cd[3] + '","' + cd[4] + '","' + cd[5] + '","' + note + '","' + staff + '","'+user+'",now());'
                    // var sql_spare ='update work_schedulee set priority="'+level+'",note="'+note+'",timeupdate=now(), user="'+user+'",'+cd[0]+'="'+cd[3]+'",'+cd[1]+'="'+cd[4]+'",'+cd[2]+'="'+cd[5]+'",respond="'+staff+'",user="'+user+'" where objs="'+nameold+'";' 
                    // var sql_spare = 'insert into work_schedulee (objs,' +cd[0]+ ',' +cd[1]+ ',' +cd[2]+ ',priority,note,respond,user,timeupdate)  values ("' +nameold+ '","' + cd[3] + '","' + cd[4] + '","' + cd[5] + '","' + level+ '","' + note + '","' + staff + '","'+user+'",now());'
                    console.log(sql_spare)
                    conupline.query(sql_spare, function (err, fields) {

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
            })
        })
    })

    app.get('/sche/loading_data', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT * FROM work_schedule ORDER BY timeupdate DESC;';
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    app.post('/sche/update', function (req, res) {

        var user = req.body.user;
        var level = req.body.level;
        var staff = req.body.staff;
        var note = req.body.note;
        var nameold = req.body.nameold;
        var c1 = '' + req.body.c1;
        var c2 = '' + req.body.c2;
        var c3 = '' + req.body.c3;
        var d1 = '"' + req.body.d1 + '"';
        var d2 = '"' + req.body.d2 + '"';
        var d3 = '"' + req.body.d3 + '"';
        // var user = req.user[0].user;
        cd = [c1, c2, c3, d1, d2, d3];
        for (var i = 0; i < cd.length; i++) {
            if (cd[i] == 'undefined') { cd[i] = ""; console.log(cd[i]); }
        }
        if (cd[0] == '') {
            cd[3] = "null";
        }
        if (cd[1] == '') {
            cd[4] = "null";
        }
        if (cd[2] == '') {
            cd[5] = "null";
        }

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            // var sql_spare = 'insert into work_schedule (objs,cylcle1,cylcle2,cylcle3,priority,leadtime1, leadtime2, leadtime3,note,respond,user,timeupdate)  values ("' +nameold+ '","' + cd[0] + '","' + cd[1] + '","' + cd[2] + '","' + level+ '","' + cd[3] + '","' + cd[4] + '","' + cd[5] + '","' + note + '","' + staff + '","'+user+'",now());'
            var sql_spare = 'update work_schedule set cylcle1="' + cd[0] + '",cylcle2="' + cd[1] + '",cylcle3="' + cd[2] + '",priority="' + level + '",note="' + note + '",timeupdate=now(), user="' + user + '",leadtime1=' + cd[3] + ',leadtime2=' + cd[4] + ',leadtime3=' + cd[5] + ',respond="' + staff + '",user="' + user + '" where objs="' + nameold + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }

                //     let options = {
                //         mode: 'text',
                //         pythonPath: 'python',
                //         pythonOptions: ['-u'], // get print results in real-time
                //         scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                //         args:[nameold]
                //     };
                //    // console.log("hi")
                //     PythonShell.run('createlist.py', options, function(err, result) {
                //         if (err) throw err;
                //         console.log("download")
                //         // result is an array consisting of messages collected 
                //         //during execution of script.
                //         //console.log('result: ', result.toString());
                //         res.send(result.toString())
                //     });

                // res.send("ok")
                // res.end();
            })
            let options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                args: [nameold]
            };
            // console.log("hi")
            PythonShell.run('createlist.py', options, function (err, result) {
                if (err) throw err;
                console.log("download")
                res.send(result.toString())
                res.end();
            });

        })
    })

    app.post('/sche/insert', function (req, res) {

        var user = req.body.user;
        var level = req.body.level;
        var staff = req.body.staff;
        var note = req.body.note;
        var nameold = req.body.nameold;
        var c1 = '' + req.body.c1;
        var c2 = '' + req.body.c2;
        var c3 = '' + req.body.c3;
        var d1 = '' + req.body.d1;
        var d2 = '' + req.body.d2;
        var d3 = '' + req.body.d3;
        // var user = req.user[0].user;
        cd = [c1, c2, c3, d1, d2, d3];
        for (var i = 0; i < cd.length; i++) {
            if (cd[i] == 'undefined') { cd[i] = ''; console.log(cd[i]); }
        }


        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'insert into work_schedule (objs,cylcle1,cylcle2,cylcle3,priority,leadtime1, leadtime2, leadtime3,note,respond,user,timeupdate)  values ("' + nameold + '","' + cd[0] + '","' + cd[1] + '","' + cd[2] + '","' + level + '","' + cd[3] + '","' + cd[4] + '","' + cd[5] + '","' + note + '","' + staff + '","' + user + '",now());'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }


                // res.send("ok")

            })
            let options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                args: [nameold]
            };
            // console.log("hi")
            PythonShell.run('createlist.py', options, function (err, result) {
                if (err) throw err;
                console.log("download")
                res.send(result.toString())
                res.end();
            });

        })
    })

    app.post('/sche/delete', function (req, res) {
        var id = req.body.objs;

        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            var sql_upline = 'delete from work_schedule where objs="' + id + '";'
            // console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
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

    app.post('/schedis/loading_data', function (req, res) {
        console.log("hi");

        var time = req.body.time;
        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM work_schedule WHERE leadtime1="' + time + '" OR leadtime2="' + time + '" OR leadtime3="' + time + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, list) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(list);
                res.send(list)
                res.end();
            })

        })

    });

    //---------------------------STAFF----------------------------

    app.get('/staff/loading_data', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT idfm,name,expertise, levels,position,team FROM fm_staff ORDER BY stt ASC;';


            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    app.post('/staff/search', function (req, res) {
        console.log("hi");

        var name = req.body.name;
        var expert = req.body.expert;
        console.log(name);

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT idfm,name,expertise, levels,position,team FROM fm_staff WHERE  name LIKE "' + name + '" AND expertise LIKE "' + expert + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, search) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(search);
                res.send(search)
                res.end();
            })

        })

    });

    app.post('/staff/loadinfor', function (req, res) {
        console.log("hi");

        var id = req.body.id;
        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM fm_staff WHERE idfm="' + id + '" ;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, qi) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(qi);
                res.send(qi)
                res.end();
            })

        })

    });

    app.post('/staff/update', function (req, res) {

        var id = req.body.id;
        var name = req.body.name;
        var levels = req.body.levels;
        var leexpert = req.body.leexpert;
        var position = req.body.position;
        var team = req.body.team;
        var cer = req.body.cer;
        var address = req.body.address;
        var pnum = req.body.pnum;
        var cb = req.body.cb
        var user = req.user[0].user;
        var mail = req.body.mail;

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'update fm_staff set email="' + mail + '",name="' + name + '",levels="' + levels + '",le_expert="' + leexpert + '",position="' + position + '", team="' + team + '",certificate="' + cer + '", address="' + address + '",ph_num="' + pnum + '",expertise="' + cb + '",userupdate="' + user + '",timeupdate=now() where idfm="' + id + '";'
            // var sql_spare = 'insert into work_order (depart_req,type_req,type_eq,req,place_req,user_req,time_req,leve_req,status_req,procer,time_rec,time_exe, time_confirm,id) values ("' + departreq + '","' + typereq + '","' + typeeq + '","' + contentreq + '","' + placereq+ '","' + userreq + '",now(),"' + levereq + '","' + statusreq + '","' + procer + '",now(),now(),now(),"' + id + '");'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

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
    })

    app.post('/staff/insert', function (req, res) {

        var id = req.body.id;
        var name = req.body.name;
        var levels = req.body.levels;
        var leexpert = req.body.leexpert;
        var position = req.body.position;
        var team = req.body.team;
        var cer = req.body.cer;
        var address = req.body.address;
        var pnum = req.body.pnum;
        var cb = req.body.cb
        var user = req.user[0].user;
        var mail = req.body.mail;

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            // var sql_spare = 'update fm_staff set name="' + name + '",levels="'+levels+'",le_expert="'+leexpert+'",position="'+position+'", team="'+team+'",certificate="'+cer+'", address="'+address+'",ph_num="'+pnum+'",expertise="'+cb+'",userupdate="'+user+'",timeupdate=now() where idfm="'+id+'";'  
            var sql_spare = 'insert into fm_staff (email,name,levels,le_expert,position,team,certificate,address,ph_num,expertise,userupdate,timeupdate,idfm) values ("' + mail + '","' + name + '","' + levels + '","' + leexpert + '","' + position + '","' + team + '","' + cer + '","' + address + '","' + pnum + '","' + cb + '","' + user + '",now(),"' + id + '");'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

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
    })

    app.post('/staff/delete', function (req, res) {
        var id = req.body.id;

        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            var sql_upline = 'delete from fm_staff where idfm="' + id + '";'
            // console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
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

    //---------------------------HOME----------------------------

    app.post('/home/loadchart', function (req, res) {

        var date = req.body.date + "%";
        var last = req.body.lastday + "%";
        var tom = req.body.tomorrow + "%";

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            // var sql_spare = 'update fm_staff set name="' + name + '",levels="'+levels+'",le_expert="'+leexpert+'",position="'+position+'", team="'+team+'",certificate="'+cer+'", address="'+address+'",ph_num="'+pnum+'",expertise="'+cb+'",userupdate="'+user+'",timeupdate=now() where idfm="'+id+'";'  
            var sql_spare = 'SELECT COUNT(keyy) as Count FROM part_log WHERE time_req LIKE "' + last + '" UNION ALL SELECT COUNT(keyy) FROM part_log WHERE time_req LIKE "' + date + '" UNION ALL SELECT COUNT(keyy) FROM part_log WHERE time_req LIKE "' + tom + '"  UNION ALL SELECT COUNT(keyy) FROM part_log WHERE time_issue LIKE "' + last + '" AND STATUS="Đã cấp" UNION ALL SELECT COUNT(keyy) FROM part_log WHERE time_issue LIKE "' + date + '" AND STATUS="Đã cấp" UNION ALL SELECT COUNT(keyy) FROM part_log WHERE time_issue LIKE "' + tom + '" AND STATUS="Đã cấp";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {
                console.log(fields);

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }

                res.send(fields)
                res.end();
            })

        })
    })

    app.post('/home/loadpm', function (req, res) {

        var date = req.body.date;


        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            // var sql_spare = 'update fm_staff set name="' + name + '",levels="'+levels+'",le_expert="'+leexpert+'",position="'+position+'", team="'+team+'",certificate="'+cer+'", address="'+address+'",ph_num="'+pnum+'",expertise="'+cb+'",userupdate="'+user+'",timeupdate=now() where idfm="'+id+'";'  
            var sql_spare = 'SELECT * FROM work_schedule_detail Where Date="' + date + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {
                console.log(fields);

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }

                res.send(fields)
                res.end();
            })

        })
    })

    app.post('/home/loadwo', function (req, res) {

        var date1 = req.body.date1;
        var date2 = req.body.date2;


        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            // var sql_spare = 'update fm_staff set name="' + name + '",levels="'+levels+'",le_expert="'+leexpert+'",position="'+position+'", team="'+team+'",certificate="'+cer+'", address="'+address+'",ph_num="'+pnum+'",expertise="'+cb+'",userupdate="'+user+'",timeupdate=now() where idfm="'+id+'";'  
            // var sql_spare = 'SELECT COUNT(id) AS Count from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'" UNION SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'"AND id LIKE "PM%" UNION SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "SE%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date+'" AND timeend_req>="'+date+'" UNION All SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "SE%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'" UNION All SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "SE%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date+'" AND timeend_req>="'+date+'" UNION All SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date+'" AND timeend_req>="'+date+'"  AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date+'" AND timeend_req>="'+date+'"  AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date+'" AND timeend_req>="'+date+'"  AND id LIKE "SE%";'
            // var sql_spare='SELECT COUNT(id) AS Count from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "SE%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date2+'" AND time_req>="'+date1+'" UNION All SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "SE%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'" UNION All SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date+'" AND timeend_req>="'+date+'" AND id LIKE "SE%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date+'" AND timeend_req>="'+date+'" UNION All SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date+'" AND timeend_req>="'+date+'"  AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date+'" AND timeend_req>="'+date+'"  AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date+'" AND timeend_req>="'+date+'"  AND id LIKE "SE%"';
            // var sql_spare='SELECT COUNT(id) AS Count from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'"UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "SE%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date2+'" AND time_req>="'+date1+'" UNION All SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Hoàn thành" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "SE%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'" UNION All SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="'+date2+'" AND time_req>="'+date1+'" AND id LIKE "SE%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date2+'" AND time_req>="'+date1+'" UNION All SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date2+'" AND time_req>="'+date1+'"  AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date2+'" AND time_req>="'+date1+'"  AND id LIKE "CM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Chưa xử lý" AND time_req<="'+date2+'" AND time_req>="'+date1+'"  AND id LIKE "SE%";'
            var sql_spare = 'SELECT COUNT(id) AS Count from work_order WHERE status_work="Đang thực hiện" AND time_req<="' + date2 + '" AND time_req>="' + date1 + '" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="' + date2 + '" AND time_req>="' + date1 + '" AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Đang thực hiện" AND time_req<="' + date2 + '" AND time_req>="' + date1 + '" AND id LIKE "SE%"  UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Chưa phân công" UNION All SELECT COUNT(id) from work_order WHERE status_work="Chưa phân công"  AND id LIKE "PM%" UNION ALL SELECT COUNT(id) from work_order WHERE status_work="Chưa phân công"  AND id LIKE "SE%";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {
                console.log(fields);

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }

                res.send(fields)
                res.end();
            })

        })
    })

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })

    var upload = multer({ storage: storage })
    app.post('/profile-upload-multiple', upload.array('profile-files', 12), function (req, res, next) {

    })
    //---------------------------WORK----------------------------
    app.post('/work/infordis', function (req, res) {

        var typework = req.body.typework;
        var namework = req.body.namework;
        var statuswork = req.body.statuswork;
        var datestart = req.body.datestart;
        var durawork = req.body.durawork;
        var staffwork = req.body.staffwork;
        var leverec = req.body.leverec;
        var idreq = req.body.idreq;
        var solution = req.body.solution;
        var reason = req.body.reason;
        var note = req.body.note;
        var user = req.user[0].user;
        var progress = req.body.progress;
        var email = req.body.email;
        var cyclehide = req.body.cyclehide;
        var objshide = req.body.objshide;
        var datehide = req.body.datehide;
        console.log(email)
        console.log(staffwork)
        conn.getConnection(function (err, conupline) {
            var sql_spare = 'SELECT user FROM fm_staff WHERE name="' + staffwork + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, nameuser) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                user_staff = nameuser[0].user;
                conn.getConnection(function (err, conupline) {
                    if (err) throw err;
                    if (progress == 100) { var sql_spare = 'update work_order set user_staff="' + user_staff + '" ,note= "' + note + '",status_work="Hoàn thành",user_rec="' + user + '",time_rec=now(), type_work="' + typework + '",name_work="' + namework + '",time_exe="' + datestart + '", time_commit="' + durawork + '",FM_staff="' + staffwork + '",leve_rec="' + leverec + '",reason="' + reason + '",solution="' + solution + '", progress="' + progress + '",time_confirm=now() where id="' + idreq + '";' }
                    else { var sql_spare = 'update work_order set user_staff="' + user_staff + '" ,note= "' + note + '",status_work="Đang thực hiện",user_rec="' + user + '",time_rec=now(), type_work="' + typework + '",name_work="' + namework + '",time_exe="' + datestart + '", time_commit="' + durawork + '",FM_staff="' + staffwork + '",leve_rec="' + leverec + '",reason="' + reason + '",solution="' + solution + '", progress="' + progress + '" where id="' + idreq + '";' }
                    console.log(sql_spare)
                    conupline.query(sql_spare, function (err, fields) {

                        conupline.release();

                        if (err) {

                            res.send("no")

                            res.end();

                            throw err;

                        }

                        if (idreq.slice(0, 2) == "PM") {
                            conn.getConnection(function (err, conuplinee) {
                                if (err) throw err;
                                if (progress == 100) { var sql = 'update work_schedule_detail set Date_exe=NOW(),`Status`="' + progress + '" where Objs="' + objshide + '" AND Date="' + datehide + '" AND Cycle="' + cyclehide + '";' }
                                else { var sql = 'update work_schedule_detail set `Status`="' + progress + '" where Objs="' + objshide + '" AND Date="' + datehide + '" AND Cycle="' + cyclehide + '";' }
                                // var sql_spare = 'insert into work_order (depart_req,type_req,type_eq,req,place_req,user_req,time_req,leve_req,status_req,procer,time_rec,time_exe, time_confirm,id) values ("' + departreq + '","' + typereq + '","' + typeeq + '","' + contentreq + '","' + placereq+ '","' + userreq + '",now(),"' + levereq + '","' + statusreq + '","' + procer + '",now(),now(),now(),"' + id + '");'
                                console.log(sql)
                                conuplinee.query(sql, function (err, fields) {
                                    conuplinee.release();

                                    if (err) {
                                        res.send("no")
                                        res.end();
                                        throw err;
                                    }
                                    res.send("ok")
                                    res.end();
                                })
                            })
                        }
                        else if (progress == 100 && idreq.slice(0, 2) == "SE") {

                            let options = {
                                mode: 'text',
                                pythonPath: 'python',
                                pythonOptions: ['-u'], // get print results in real-time
                                scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                                args: [idreq, email]
                            };
                            //  console.log("guwir mail")
                            PythonShell.run('mail_to_userreq.py', options, function (err, result) {
                                if (err) throw err;
                                console.log("mail_to_userreq")
                                res.send(result.toString())
                                console.log(result.toString())
                                res.end();
                                console.log
                            })
                        }
                        else {
                            res.send("ok")
                            res.end();
                        }


                        // }


                        // conn.getConnection(function(err, conuplinee) {
                        //     if (err) throw err; 
                        //     var sql = 'update work_schedule_detail set Staff="'+staffwork+'" where Objs="'+eq+'" AND Date="'+timereq+'" AND Cycle="'+cycle+'";'  
                        //     // var sql_spare = 'insert into work_order (depart_req,type_req,type_eq,req,place_req,user_req,time_req,leve_req,status_req,procer,time_rec,time_exe, time_confirm,id) values ("' + departreq + '","' + typereq + '","' + typeeq + '","' + contentreq + '","' + placereq+ '","' + userreq + '",now(),"' + levereq + '","' + statusreq + '","' + procer + '",now(),now(),now(),"' + id + '");'
                        //     console.log(sql)
                        //     conuplinee.query(sql, function(err, fields) {

                        //         conuplinee.release();

                        //         if (err) {

                        //             res.send("no")

                        //             res.end();

                        //             throw err;

                        //         }

                        //         res.send("ok")
                        //         res.end();
                        //     })

                        // })
                    })

                })
            })

        })
    })

    app.post('/work/search', function (req, res) {

        var sttw = req.body.sttw;
        var typw = req.body.typw;
        var name1 = req.body.name1;
        var name2 = req.body.name2;
        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM work_order WHERE status_work LIKE "' + sttw + '" AND type_work LIKE "' + typw + '" AND user_rec LIKE "' + name1 + '" AND FM_staff LIKE "' + name2 + '" AND ((time_commit > DATE_ADD(NOW(),INTERVAL -7 DAY) AND time_exe < DATE_ADD(NOW(),INTERVAL 7 DAY))  OR progress=0);'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, search) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(search);
                res.send(search)
                res.end();
            })

        })

    })

    app.post('/work/searchh', function (req, res) {
        var level = req.body.level;
        var day1 = req.body.day1 + " 00:00:00";
        var day2 = req.body.day2 + " 23:59:59";
        console.log(day1)
        console.log(day2)
        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM work_order WHERE leve_rec LIKE "' + level + '" AND time_exe>="' + day1 + '" AND time_commit<="' + day2 + '"  AND ((time_commit > DATE_ADD(NOW(),INTERVAL -7 DAY) AND time_exe < DATE_ADD(NOW(),INTERVAL 7 DAY))  OR progress=0);'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, search) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(search);
                res.send(search)
                res.end();
            })

        })

    })

    app.post('/work/import_workex', function (req, res) {
        var print = req.body.print;
        console.log("import_workex")
        let options = {
            mode: 'text',
            pythonPath: 'python',
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
            args: [print]
        };
        // console.log("hi")
        PythonShell.run('printwork.py', options, function (err, result) {
            if (err) throw err;
            console.log("download")
            // result is an array consisting of messages collected 
            //during execution of script.
            //console.log('result: ', result.toString());
            res.send(result.toString())
        });
    })

    app.get('/work/loading_data', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT time_confirm,progress,user_rec,FM_staff,time_exe,time_commit,progress,id,req as name_work,status_work,leve_rec FROM work_order ORDER BY time_rec DESC;';
            // WHERE  (time_commit > DATE_ADD(NOW(),INTERVAL -7 DAY) AND time_exe < DATE_ADD(NOW(),INTERVAL 7 DAY)) OR progress=0  
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    app.post('/work/loading_dataa', function (req, res) {
        var typework = req.body.typework;

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT user_rec,FM_staff,time_exe,time_commit,id,name_work,status_work,leve_rec FROM work_order WHERE type_work="' + typework + '" ORDER BY time_rec DESC;';
            console.log(sql_book);

            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    //---------------------------MACHINE----------------------------

    app.post('/mc_in_u/loadopera', function (req, res) {
        console.log("aaaaaaaaaaaaaaaa")

        var name = req.body.name;
        var name = "%" + name + "%";
        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM work_order WHERE req LIKE "' + name + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, qi) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(qi);
                res.send(qi)
                res.end();
            })

        })

    })

    app.post('/mc_in_u/loadmaint', function (req, res) {
        // console.log("aaaaaaaaaaaaaaaa")

        var name = req.body.name;

        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM work_schedule_detail WHERE objs="' + name + '" ORDER BY Date ASC;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, sche) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                // console.log(sche);
                res.send(sche)
                res.end();
            })

        })

    })

    app.post('/machine/imgupload', function (req, res) {
        parseReqBody: false;
        var form = new formidable.IncomingForm();
        imgfile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            imgfile = file.name;
            console.log(imgfile);
            file.path = './public/img_mac/' + imgfile;
            console.log(file.path);
            // res.send(file.path);
        });
    })

    app.post('/mc_in_u/loadif', function (req, res) {
        console.log("hi");

        var name = req.body.name;
        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT finish,timeupdate, user,des,serialN,plant FROM mc_in_u WHERE mc_code="' + name + '" ;'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, qi) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(qi);
                res.send(qi)
                res.end();
            })
        })
    })

    app.get('/machine/loading_data', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT mc_code,code_old,machine,image,plant,sub_pos,status,Model,des,start FROM mc_in_u WHERE finish >= YEAR(NOW()) OR finish="" ORDER BY mc_code ASC;';


            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    app.get('/machine/loading_datadie', function (req, res) {

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_book = 'SELECT * FROM mc_in_u WHERE finish < YEAR(NOW()) AND finish <> "";';


            connection.query(sql_book, function (err, jsonObject, fields) {

                if (err) throw err;

                connection.release();

                res.send(jsonObject);

                res.end();

            });
        });
    })

    app.post('/machine/update', function (req, res) {

        var name = req.body.name;
        var codenew = req.body.codenew;
        var codeold = req.body.codeold;
        var plant = req.body.plant;
        var pos = req.body.pos;
        var start = req.body.start;
        var finish = req.body.finish;
        var model = req.body.model;
        var user = req.user[0].user;
        var seri = req.body.seri;
        var image = req.body.image;
        var status = req.body.status;
        var system = req.body.system;
        imagee = "./public/img_mac/" + image;
        var des = req.body.des;

        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            if (imagee == "./public/img_mac/undefined") {
                var sql_spare = 'update mc_in_u set system="' + system + '",status="' + status + '",mc_code="' + codenew + '",plant="' + plant + '",sub_pos="' + pos + '",model="' + model + '",serialN="' + seri + '", start="' + start + '",finish="' + finish + '",timeupdate=now(),user="' + user + '", des="' + des + '",machine="' + name + '" where code_old="' + codeold + '";'
            }
            else {
                var sql_spare = 'update mc_in_u set  system="' + system + '",status="' + status + '",image="' + imagee + '",mc_code="' + codenew + '",plant="' + plant + '",sub_pos="' + pos + '",model="' + model + '",serialN="' + seri + '", start="' + start + '",finish="' + finish + '",timeupdate=now(),user="' + user + '", des="' + des + '", machine="' + name + '" where code_old="' + codeold + '";'
            }
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

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

    })

    app.post('/machine/insert', function (req, res) {

        console.log("hi");
        var name = req.body.name;
        var codenew = req.body.codenew;
        var codeold = req.body.codeold;
        var plant = req.body.plant;
        var pos = req.body.pos;
        var start = req.body.start;
        var finish = req.body.finish;
        var model = req.body.model;
        var user = req.user[0].user;
        var seri = req.body.seri;
        var image = req.body.image;
        var status = req.body.status;
        imagee = "./public/img_mac/" + image;
        var des = req.body.des;
        var system = req.body.system;

        var staff = req.body.staff;
        var cy1 = req.body.cy1;
        var cy2 = req.body.cy2;
        var cy3 = req.body.cy3;
        var date1 = req.body.date1;
        var date2 = req.body.date2;
        var date3 = req.body.date3;
        var priority = req.body.priority;
        var notee = req.body.notee;
        // console.log(cy1);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM mc_in_u Where code_old="' + codeold + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, fields) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(fields)
                if (fields.length == 0) {

                    conn.getConnection(function (err, conupline) {
                        if (err) throw err;
                        if (imagee == "./public/img_mac/undefined") {
                            var sql_spare = 'insert into mc_in_u (mc_code,machine,code_old,plant,sub_pos,Model,SerialN,start,finish,status,timeupdate,user,image,des,system) values ("' + codenew + '","' + name + '","' + codeold + '","' + plant + '","' + pos + '","' + model + '","' + seri + '",now(),"' + finish + '","' + status + '",now(),"' + user + '","./public/img_mac/noimg.png","' + des + '","' + system + '");'
                        }
                        else {
                            var sql_spare = 'insert into mc_in_u (mc_code,machine,code_old,plant,sub_pos,Model,SerialN,start,finish,status,timeupdate,user,image,des,system) values ("' + codenew + '","' + name + '","' + codeold + '","' + plant + '","' + pos + '","' + model + '","' + seri + '",now(),"' + finish + '","' + status + '",now(),"' + user + '","' + imagee + '","' + des + '","' + system + '");'
                        }
                        // if (cy1 != "") {
                        //     var sql_sche = 'insert into work_schedule (objs,cylcle1,cylcle2,cylcle3,priority,leadtime1, leadtime2, leadtime3,note,respond,user,timeupdate) values ("' + codeold+ '","' + cy1 + '","' + cy2 + '","' + cy3 + '","' + priority+ '","' + date1 + '","' + date2 + '","' + date3 + '","' + notee + '","' + staff + '","'+user+'",now());'
                        // }
                        console.log(sql_spare)
                        conupline.query(sql_spare, function (err, fields) {

                            conupline.release();

                            if (err) {

                                res.send("no")

                                res.end();

                                throw err;

                            }

                            if (cy1 != "") {
                                conn.getConnection(function (err, conupline) {
                                    if (err) throw err;
                                    var sql_spare = 'insert into work_schedule (objs,cylcle1,cylcle2,cylcle3,priority,leadtime1, leadtime2, leadtime3,note,respond,user,timeupdate) values ("' + codeold + '","' + cy1 + '","' + cy2 + '","' + cy3 + '","' + priority + '","' + date1 + '","' + date2 + '","' + date3 + '","' + notee + '","' + staff + '","' + user + '",now());'
                                    console.log(sql_spare)
                                    conupline.query(sql_spare, function (err, fields) {

                                        conupline.release();

                                        if (err) {

                                            res.send("no")

                                            res.end();

                                            throw err;

                                        }

                                        let options = {
                                            mode: 'text',
                                            pythonPath: 'python',
                                            pythonOptions: ['-u'], // get print results in real-time
                                            scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                                            args: [codeold]
                                        };
                                        // console.log("hi")
                                        PythonShell.run('createlist.py', options, function (err, result) {
                                            if (err) throw err;
                                            console.log("download")
                                            res.send(result.toString())
                                            res.end();
                                        });
                                    })
                                })
                            } else {
                                res.send("okk")
                                res.end();
                            }

                        })
                    })
                } else {
                    res.send("code_old")
                }
            })

        })

    })

    app.post('/machine/delete', function (req, res) {
        var name = req.body.name;
        var codeold = req.body.codeold;

        conn.getConnection(function (err, conupline) {

            if (err) throw err;
            var sql_upline = 'delete from mc_in_u where machine="' + name + '" and code_old="' + codeold + '";'
            console.log(sql_upline);
            conupline.query(sql_upline, function (err, fields) {
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

    })

    app.post('/mac/Upload_excel_File', function (req, res) {
        // var dt = datetime.create();
        // var format_date = dt.format("YmdHMS");
        console.log("Uploadfile_machine");
        var form = new formidable.IncomingForm();
        excelFile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            excelFile = req.user[0].user + file.name;
            file.path = './public/mc/' + excelFile;
        });
        form.on('file', function (name, file) {
            console.log("nay")
            let options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                args: [excelFile]
            };
            // console.log("hi")
            PythonShell.run('uploadmacc.py', options, function (err, result) {
                if (err) throw err;
                // result is an array consisting of messages collected 
                //during execution of script.
                //console.log('result: ', result.toString());
                res.send(result.toString())
            });
        })
    })

    app.post('/sche/Upload_excel_File', function (req, res) {
        // var dt = datetime.create();
        // var format_date = dt.format("YmdHMS");
        console.log("Uploadfile_machine");
        var form = new formidable.IncomingForm();
        excelFile = '';
        form.parse(req);
        form.on('fileBegin', function (name, file) {
            excelFile = req.user[0].user + file.name;
            file.path = './public/sche/' + excelFile;
        });
        form.on('file', function (name, file) {
            console.log("nay")
            let options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
                args: [excelFile]
            };
            // console.log("hi")
            PythonShell.run('insertpm.py', options, function (err, result) {
                if (err) throw err;
                // result is an array consisting of messages collected 
                //during execution of script.
                //console.log('result: ', result.toString());
                res.send(result.toString())
            });
        })
    })


    app.post('/mac/download_excel_File', function (req, res) {
        console.log("download_excel_File")
        let options = {
            mode: 'text',
            pythonPath: 'python',
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: './python/', //If you are having python_test.py script in same folder, then it's optional.
            // args:[excelFile]
        };
        // console.log("hi")
        PythonShell.run('exportmac.py', options, function (err, result) {
            if (err) throw err;
            console.log("download")
            // result is an array consisting of messages collected 
            //during execution of script.
            //console.log('result: ', result.toString());
            res.send(result.toString())
        });
    })

    app.post('/machine/search', function (req, res) {
        console.log("hi");

        var name = req.body.name;
        var pos = req.body.pos;
        var type = req.body.type;
        // console.log(listipart);
        conn.getConnection(function (err, conupline) {
            if (err) throw err;
            var sql_spare = 'SELECT * FROM mc_in_u WHERE  mc_code LIKE "' + name + '" AND machine LIKE "' + type + '" AND sub_pos LIKE "' + pos + '";'
            console.log(sql_spare)
            conupline.query(sql_spare, function (err, search) {

                conupline.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(search);
                res.send(search)
                res.end();
            })

        })

    })

    //-----------------------------------
    app.post('/comment/load', function (req, res) {

        var id = req.body.id;

        conn.getConnection(function (err, connection) {

            if (err) throw err;

            console.log("Connected!");

            var sql_spare = 'SELECT * FROM work_order WHERE id="' + id + '" ';
            console.log(sql_spare)
            connection.query(sql_spare, function (err, data) {

                connection.release();

                if (err) {

                    res.send("no")

                    res.end();

                    throw err;

                }
                console.log(data);
                res.send(data)
                res.end();
            })
        })
    })

};
function isLoggedIn(req, res, next) {
    // Nếu một user đã xác thực, cho đi tiếp
    if (req.isAuthenticated())
        return next();
    // Nếu chưa, đưa về trang chủ
    res.redirect('/login');
}