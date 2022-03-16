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

    day = int(now.strftime("%d")) - 1
    if day < 0 :
        day = day + 1
    if day < 10 :
        day = '0' +  str(day) 
    
    print("day:", day)
    sql_up="""SELECT tb10.ID,tb10.NAME, tb10.Shift,tb10.GROUP_LINE, tb10.START_DATE, tb10.OPERATION_NAME, tb10.CODE_TRAINING, tb10.DATE,tb10.OPERATION_NAME_REAL,tb10.DAY_TRAINING,tb10.TECHNICIAN, tb10.WORK_HRS, ROUND((((SUM(tb.EARNED_HOURS)/60)/WORK_HRS)* 100),2)AS EFF 
    FROM (SELECT tb8.ID,tb8.NAME, tb8.Shift,tb8.GROUP_LINE, tb8.START_DATE, tb8.OPERATION_NAME, tb8.CODE_TRAINING, tb8.DATE,tb8.OPERATION_NAME_REAL,tb8.DAY_TRAINING,tb8.TECHNICIAN, tb9.WORK_HRS
    FROM (SELECT tb6.ID,tb6.NAME, tb6.Shift,tb7.groupName AS GROUP_LINE, tb6.START_DATE, tb6.OPERATION_NAME, tb6.CODE_TRAINING, tb6.DATE,tb6.OPERATION_NAME_REAL,tb6.DAY_TRAINING,tb6.TECHNICIAN 
    FROM (SELECT tb4.ID,tb4.NAME, tb4.Shift,tb4.Line, tb4.START_DATE, tb4.OPERATION_NAME, tb4.CODE_TRAINING, tb4.DATE,tb4.OPERATION_NAME_REAL,COUNT(tb5.DATE) AS DAY_TRAINING,tb4.TECHNICIAN 
    FROM (SELECT tb2.ID,tb2.NAME, tb2.Shift, tb2.START_DATE, tb2.OPERATION_NAME,tb2.Line,tb2.CODE_TRAINING,tb2.TECHNICIAN, tb3.DATE, tb3.OPERATION_NAME AS OPERATION_NAME_REAL 
    FROM (SELECT tb1.ID, tb1.NAME, tb1.Shift, tb1.Line,tb.START_DATE, tb.OPERATION_NAME, tb.CODE_TRAINING,tb.TECHNICIAN FROM (SELECT * FROM amt.amt_tracking b
    WHERE b.ID NOT IN (SELECT ID FROM amt.employee_stop_working))tb
    INNER JOIN (SELECT a.ID,a.NAME, a.Shift, a.Line FROM erpsystem.setup_emplist AS a)tb1
    ON tb1.ID = tb.ID)tb2
    INNER JOIN (SELECT * FROM linebalancing.bundle_group_by_employee_detail b WHERE b.DATE = '{year}{month}{day}')tb3
    ON RIGHT(tb2.ID,5)=tb3.EMPLOYEE)tb4
    INNER JOIN (SELECT * FROM pr2k.employee_timesheet p WHERE DATE <= '{year}-{month}-{day}')tb5
    ON tb5.EMPLOYEE = tb4.ID
    GROUP BY tb4.ID)tb6
    INNER JOIN (SELECT groupName, Line FROM linebalancing.web_ie_location li)tb7
    WHERE tb6.Line = tb7.line)tb8
    INNER JOIN (SELECT WORK_HRS, EMPLOYEE FROM pr2k.employee_timesheet p WHERE DATE = '{year}-{month}-{day}') tb9
    ON tb8.ID = tb9.EMPLOYEE)tb10
    LEFT JOIN (SELECT d.EMPLOYEE,d.EARNED_HOURS FROM pr2k.employee_scanticket d WHERE d.DATE = '{year}{month}{day}')tb
    ON RIGHT(tb10.ID,5) = tb.EMPLOYEE
    GROUP BY tb10.ID;""".format(year = year, month = month, day = day)
    print(sql_up)
    myCursor.execute(sql_up)
    result= myCursor.fetchall()
    print(result)
        
    for x in result:
   
        sql_up='INSERT INTO employee_profile (ID, NAME,SHIFT,GROUP_LINE,START_DATE,OPERATION_NAME,CODE_TRAINING,DAY_TRACKING,OPERATION_NAME_REAL,DAY_TRAINING,TECHNICIANS,WORK_HRS, EARNED_HOURS) VALUES ("'+ str(x[0]) + '", "'+ str(x[1]) + '","'+ str(x[2]) + '","'+ str(x[3]) + '", "'+ str(x[4]) + '","'+ str(x[5]) + '","'+ str(x[6]) + '", "'+ str(x[7]) + '","'+ str(x[8]) + '","'+ str(x[9]) + '","'+ str(x[10]) + '","'+ str(x[11]) + '","'+ str(x[12]) + '")'
       
        print(sql_up)
        myCursor.execute('INSERT INTO employee_profile (ID, NAME,SHIFT,GROUP_LINE,START_DATE,OPERATION_NAME,CODE_TRAINING,DAY_TRACKING,OPERATION_NAME_REAL,DAY_TRAINING,TECHNICIANS,WORK_HRS, EARNED_HOURS) VALUES ("'+ str(x[0]) + '", "'+ str(x[1]) + '","'+ str(x[2]) + '","'+ str(x[3]) + '", "'+ str(x[4]) + '","'+ str(x[5]) + '","'+ str(x[6]) + '", "'+ str(x[7]) + '","'+ str(x[8]) + '","'+ str(x[9]) + '","'+ str(x[10]) + '","'+ str(x[11]) + '","'+ str(x[12]) + '")')
          
        mydb.commit()

    print(result)
update_employee_info()
# schedule.every().saturday.at("11:59").do(update_employee_info)
# schedule.every().day.at("12:30").do(update_employee_info)
# schedule.every(5).minutes.do(update_employee_info)
# print(datetime.datetime.now())
# print('shedule start')
# while True:
#     schedule.run_pending()
#     time.sleep(1)        
