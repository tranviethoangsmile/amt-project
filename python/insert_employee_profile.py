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

    day = int(now.strftime("%d")) + 11
    if day < 0 :
        day = day + 1
    if day < 10 :
        day = '0' +  str(day) 
    print("day:", day)
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
        sql_employee_profile="""INSERT INTO employee_profile (ID, NAME,SHIFT,SHIFT_REAL,START_DATE,OPERATION_NAME,OPERATION_NAME_REAL,CODE_TRAINING,DAY_TRACKING,TECHNICIANS,WORK_HRS, EARNED_HOURS)
         VALUES ('{ID}','{NAME}','{SHIFT}','{SHIFT_REAL}','{START_DATE}','{OPERATION_NAME}', '{OPERATION_NAME_REAL}','{CODE_TRAINING}','{DAY_TRACKING}','{TECHNICIANS}','{WORK_HRS}','{EARNED_HOURS}')
         """.format(ID = str(x[0]), NAME = str(x[1]), SHIFT = str(x[2]), SHIFT_REAL = str(x[3]), START_DATE = str(x[4]), OPERATION_NAME = str(x[5]), OPERATION_NAME_REAL = str(x[6]), CODE_TRAINING = str(x[7]), DAY_TRACKING = str(x[8]), TECHNICIANS = str(x[9]), WORK_HRS = str(x[10]), EARNED_HOURS = str(x[11]))
        print(sql_employee_profile)
        myCursor.execute(sql_employee_profile)
        mydb.commit()
update_employee_info()
# schedule.every().saturday.at("11:59").do(update_employee_info)
# schedule.every().day.at("12:30").do(update_employee_info)
# schedule.every(5).minutes.do(update_employee_info)
# print(datetime.datetime.now())
# print('shedule start')
# while True:
#     schedule.run_pending()
#     time.sleep(1)        
