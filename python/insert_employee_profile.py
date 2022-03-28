import math

import sys

import os

import time

import pandas as pd
pd.__version__

import string

import getpass

import mysql.connector

import datetime

from sqlalchemy import create_engine

import numpy as np

import calendar

import schedule

import time
 
engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/amt', echo=False)

mydb=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="amt")

myCursor=mydb.cursor()


from datetime import datetime

def update_employee_info():
    print("auto update employee info")
    now = datetime.now()

    year = now.strftime("%Y")
    print("year:", year)

    month = now.strftime("%m")
    print("month:", month)
    day = int(now.strftime("%d")) - 22
    if day < 0 :
        day = day + 1
    if day < 10 :
        day = '0' +  str(day) 
    DAY_TRACKING = str(year) + '-' + str(month) + '-' + str(day)

    # handle employee profile data
    sql_employee_profile="""SELECT tb5.ID, tb5.NAME, tb5.SHIFT, tb5.SHIFT_REAL,tb5.START_DATE, tb5.OPERATION_NAME, tb6.OPERATION_NAME AS OPERATION_NAME_REAL, tb5.CODE_TRAINING,tb5.DAY_TRACKING, tb5.TECHNICIAN, tb5.WORK_HRS,tb5.EFF
    FROM (SELECT tb4.ID, tb4.NAME, tb4.SHIFT, tb4.OPERATION_NAME, tb4.CODE_TRAINING, tb4.START_DATE, tb4.TECHNICIAN, tb4.SHIFT_REAL, tb4.WORK_HRS,tb4.DAY_TRACKING, ROUND((((SUM(tb.EARNED_HOURS)/60)/WORK_HRS)* 100),2)AS EFF 
    FROM (SELECT tb2.ID, tb2.NAME, tb2.SHIFT, tb2.OPERATION_NAME, tb2.CODE_TRAINING, tb2.START_DATE, tb2.TECHNICIAN, tb3.SHIFT AS SHIFT_REAL, tb3.WORK_HRS,tb3.DATE AS DAY_TRACKING 
    FROM (SELECT * FROM amt.amt_tracking b WHERE b.ID NOT IN (SELECT ID FROM amt.employee_stop_working))tb2
    INNER JOIN (SELECT * FROM pr2k.employee_timesheet b WHERE b.DATE = '{year}-{month}-{day}')tb3
    ON tb2.ID=tb3.EMPLOYEE)tb4
    LEFT JOIN (SELECT d.EMPLOYEE,d.EARNED_HOURS FROM pr2k.employee_scanticket d WHERE d.DATE = '{year}{month}{day}')tb
    ON RIGHT(tb4.ID,5) = tb.EMPLOYEE
    GROUP BY tb4.ID)tb5
    LEFT JOIN (SELECT EMPLOYEE, DATE, OPERATION_NAME FROM linebalancing.bundle_group_by_employee_detail b WHERE b.DATE = '{year}{month}{day}')tb6
    ON RIGHT(tb5.ID,5) = tb6.EMPLOYEE;""".format(year = year, month = month, day = day)
    print(sql_employee_profile)
    myCursor.execute(sql_employee_profile)
    result_employee_profile= myCursor.fetchall()
    print(result_employee_profile)
    for x in result_employee_profile:
        sql_employee_profile="""INSERT INTO employee_profile (ID, NAME,SHIFT,SHIFT_REAL,START_DATE,OPERATION_NAME,OPERATION_NAME_REAL,CODE_TRAINING,DAY_TRACKING,TECHNICIANS,WORK_HRS, EFF)
         VALUES ('{ID}','{NAME}','{SHIFT}','{SHIFT_REAL}','{START_DATE}','{OPERATION_NAME}', '{OPERATION_NAME_REAL}','{CODE_TRAINING}','{DAY_TRACKING}','{TECHNICIANS}','{WORK_HRS}','{EARNED_HOURS}')
         """.format(ID = str(x[0]), NAME = str(x[1]), SHIFT = str(x[2]), SHIFT_REAL = str(x[3]), START_DATE = str(x[4]), OPERATION_NAME = str(x[5]), OPERATION_NAME_REAL = str(x[6]), CODE_TRAINING = str(x[7]), DAY_TRACKING = str(x[8]), TECHNICIANS = str(x[9]), WORK_HRS = str(x[10]), EARNED_HOURS = str(x[11]))
        print(sql_employee_profile)
        myCursor.execute(sql_employee_profile)
        mydb.commit()

    # handle group line
    sql_group_line="""SELECT tb2.ID, tb3.groupName AS GROUP_LINE FROM (SELECT tb1.ID, tb1.Line
    FROM (SELECT * FROM amt.amt_tracking b
    WHERE b.ID NOT IN (SELECT ID FROM amt.employee_stop_working))tb
    INNER JOIN (SELECT a.ID,a.NAME, a.Shift, a.Line FROM erpsystem.setup_emplist AS a)tb1
    ON tb1.ID = tb.ID)tb2
    LEFT JOIN (SELECT groupName, Line FROM linebalancing.web_ie_location li)tb3
    ON tb3.Line = tb2.Line;"""
    print(sql_group_line)
    myCursor.execute(sql_group_line)
    result_group_line= myCursor.fetchall()
    print(result_group_line)
    for x in result_group_line:
        sql_group_line="""UPDATE amt.employee_profile SET GROUP_LINE = '{GROUP_LINE}' WHERE ID = '{ID}' AND DAY_TRACKING = '{DAY_TRACKING}'
        """.format(GROUP_LINE = str(x[1]), ID = str(x[0]), DAY_TRACKING = DAY_TRACKING )
        print(sql_group_line)
        myCursor.execute(sql_group_line)
        mydb.commit()
    #handle span time 
    sql_span_time= """SELECT tb2.*, tb3.StartTime, ROUND(SUM(tb3.SpanTime),2) 
    FROM (SELECT tb1.* FROM (SELECT * FROM amt.amt_tracking b
    WHERE b.ID NOT IN (SELECT ID FROM amt.employee_stop_working))tb
    INNER JOIN (SELECT a.ID,a.NAME, a.Shift, a.Line FROM erpsystem.setup_emplist AS a)tb1
    ON tb1.ID = tb.ID) tb2
    INNER JOIN (SELECT a.ID, a.StartTime, a.SpanTime FROM linebalancing.operation_offstandard_tracking a 
    WHERE LEFT(a.Code,2) NOT IN (SELECT b.CODE FROM amt.code_reduce_day_success b))tb3
    ON tb3.ID = tb2.ID AND LEFT(tb3.StartTime, 10) = '{year}-{month}-{day}'
    GROUP BY tb2.ID;""".format(year = year, month = month, day = day)
    print(sql_span_time)
    myCursor.execute(sql_span_time)
    result_span_time= myCursor.fetchall()
    print(result_span_time)
    for x in result_span_time:
        txt = str(x[4])
        time = txt.split()
        split_time = time[0].split('-')
        year_tracking = split_time[0]
        month_tracking = split_time[1]
        day_tracking = split_time[2]
        day_month_year = year_tracking + '-' + month_tracking + '-' + day_tracking
        print(day_tracking)
        sql_span_time="""UPDATE amt.employee_profile a SET a.SPAN_TIME = '{x5}' WHERE a.ID = '{x0}' AND DAY_TRACKING = '{x4}'
        """.format(x0 = str(x[0]), x5 = str(x[5]), x4 = day_month_year )
        print(sql_span_time)
        myCursor.execute(sql_span_time)
        mydb.commit()
    # handle dowtime
    sql_dowtime= """SELECT tb2.*,b.starttime, ROUND((TIME_TO_SEC(TIME(SUM(TIMEDIFF(b.finish,b.starttime))))/60)/60,2) AS DOWTIME FROM (SELECT tb1.* FROM (SELECT * FROM amt.amt_tracking b
    WHERE b.ID NOT IN (SELECT ID FROM amt.employee_stop_working))tb
    INNER JOIN (SELECT a.ID,a.NAME, a.Shift, a.Line FROM erpsystem.setup_emplist AS a)tb1
    ON tb1.ID = tb.ID)tb2
    INNER JOIN mms.down_time b
    ON tb2.ID=b.idnv
    WHERE LEFT(b.starttime,10)='{year}-{month}-{day}'
    GROUP BY tb2.ID;""".format(year = year, month = month, day = day)
    print(sql_dowtime)
    myCursor.execute(sql_dowtime)
    result_dowtime= myCursor.fetchall()
    print(result_dowtime)
    for x in result_dowtime:
        txt = str(x[4])
        time = txt.split()
        split_time = time[0].split('-')
        year_tracking = split_time[0]
        month_tracking = split_time[1]
        day_tracking = split_time[2]
        day_month_year = year_tracking + '-' + month_tracking + '-' + day_tracking
        print(day_tracking)
        sql_dowtime="""UPDATE amt.employee_profile a SET a.DOWTIME = '{x5}' WHERE a.ID = '{x0}' AND DAY_TRACKING = '{x4}'
        """.format(x0 = str(x[0]), x5 = str(x[5]), x4 = day_month_year )
        print(sql_dowtime)
        myCursor.execute(sql_dowtime)   
        mydb.commit()
    # handle day_training
    sql_day_training="""SELECT tb.ID, COUNT(tb3.DATE) AS DAY_TRAINING FROM (SELECT * FROM amt.amt_tracking b 
    WHERE b.ID NOT IN (SELECT ID FROM amt.employee_stop_working)) tb
    LEFT JOIN (SELECT a.EMPLOYEE, a.DATE FROM pr2k.employee_timesheet a WHERE a.DATE <= '{year}-{month}-{day}')tb3
    ON tb3.EMPLOYEE = tb.ID
    GROUP BY tb.ID;
    """.format(year = year, month = month, day = day )
    print(sql_day_training)
    myCursor.execute(sql_day_training)
    result_day_training= myCursor.fetchall()
    print(result_day_training)
    for x in result_day_training:
        sql_day_training="""UPDATE amt.employee_profile SET DAY_TRAINING = '{DAY_TRAINING}' WHERE ID = '{ID}' AND DAY_TRACKING = '{DAY_TRACKING}'
        """.format(DAY_TRAINING = str(x[1]), ID = str(x[0]), DAY_TRACKING = DAY_TRACKING )
        print(sql_day_training)
        myCursor.execute(sql_day_training)
        mydb.commit()
    # handle reduce_day
    sql_reduce_day= """SELECT ID, DAY_TRAINING, ROUND(SUM(DOWTIME) + SUM(SPAN_TIME),2) AS STAND_OFF,floor(((ROUND(SUM(DOWTIME)+ SUM(SPAN_TIME),2) - 2.5)/7.39) + 1) AS REDUCE_DAY 
    FROM amt.employee_profile WHERE DAY_TRACKING <= '{year}-{month}-{day}'
    GROUP BY ID;""".format(year = year, month = month, day = day)
    print(sql_reduce_day)
    myCursor.execute(sql_reduce_day)
    result_reduce_day= myCursor.fetchall()
    print(result_reduce_day)
    for x in result_reduce_day:
        print(str(x[3]))
        sql_reduce_day="""UPDATE amt.employee_profile a SET a.REDUCE_DAY = '{REDUCE_DAY}' WHERE a.ID = '{ID}' AND DAY_TRACKING = '{year}-{month}-{day}'""".format(REDUCE_DAY = str(x[3]), ID = str(x[0]),year = year, month = month, day = day )
        print(sql_reduce_day)
        myCursor.execute(sql_reduce_day)
        mydb.commit()
    # handle irr
    sql_irr_tracking= """SELECT tb6.ID, tb6.DATE, tb7.ID AS IRR, COUNT(tb7.IRR_NAME) AS QUANTITY, tb7.IRR_NAME AS IRR_NAME  FROM (SELECT * FROM (SELECT * FROM (SELECT * FROM (SELECT *  FROM amt.amt_tracking b
    WHERE b.ID NOT IN (SELECT ID AS IDD FROM amt.employee_stop_working))tb
    INNER JOIN (SELECT a.ID AS IDD,a.NAME AS NAMEE, a.Shift AS Shiftt, a.Line FROM erpsystem.setup_emplist AS a)tb1
    ON tb1.IDD = tb.ID)tb2
    INNER JOIN (SELECT a.TICKET, a.EMPLOYEE, a.DATE FROM pr2k.employee_scanticket a)tb3
    ON tb3.EMPLOYEE = RIGHT(tb2.ID,5) AND tb3.DATE = '{year}{month}{day}')tb4
    INNER JOIN (SELECT a.TICKET AS TICKEET, a.IRR FROM pr2k.qc_endline_record a)tb5
    ON tb5.TICKEET = tb4.TICKET)tb6 
    INNER JOIN (SELECT a.ID, a.IRR_NAME FROM pr2k.qc_irr_code a)tb7
    ON tb7.ID = tb6.IRR
    GROUP BY ID, IRR_NAME;""".format(year = year, month = month, day = day)
    print(sql_irr_tracking)
    myCursor.execute(sql_irr_tracking)
    result_irr= myCursor.fetchall()
    print(result_irr)
    for x in result_irr:
        print(str(x[3]))
        sql_irr_tracking="""INSERT INTO amt.amt_irr_tracking (ID, DATE, IRR,QUANTITY, IRR_NAME)
         VALUES('{ID}','{DATE}','{IRR}','{QUANTITY}','{IRR_NAME}')
         """.format(ID = str(x[0]), DATE = str(x[1]), IRR = str(x[2]), QUANTITY = str(x[3]), IRR_NAME = str(x[4]))
        print(sql_irr_tracking)
        myCursor.execute(sql_irr_tracking)
        mydb.commit()
update_employee_info()
# schedule.every().saturday.at("11:59").do(update_employee_info)
schedule.every().day.at("09:30").do(update_employee_info)
# schedule.every(5).minutes.do(update_employee_info)
# print(datetime.datetime.now())
# print('shedule start')
while True:
    schedule.run_pending()
    time.sleep(1)        
