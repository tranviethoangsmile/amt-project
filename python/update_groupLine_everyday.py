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

def update_group_line():
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
update_group_line()
# schedule.every().saturday.at("11:59").do(update_group_line)
# schedule.every().day.at("12:30").do(update_group_line)
# schedule.every(3).minutes.do(update_group_line)
# print(datetime.datetime.now())
# print('shedule start')
# while True:
#     schedule.run_pending()
#     time.sleep(1)        
