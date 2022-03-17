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

def update_day_training():
    print("auto update employee info")
    now = datetime.now()

    year = now.strftime("%Y")
    print("year:", year)

    month = now.strftime("%m")
    print("month:", month)
    day = int(now.strftime("%d")) - 1
    if day <= 0 :
        day = day + 1
    if day < 10 :
        day = '0' +  str(day) 
    print("day:", day)
    DAY_TRACKING = str(year) + '-' + str(month) + '-' + str(day)
    print(DAY_TRACKING)
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
update_day_training()
# schedule.every().saturday.at("11:59").do(update_day_training)
# schedule.every().day.at("12:30").do(update_day_training)
# schedule.every(3).minutes.do(update_day_training)
# print(datetime.datetime.now())
# print('shedule start')
# while True:
#     schedule.run_pending()
#     time.sleep(1)        
