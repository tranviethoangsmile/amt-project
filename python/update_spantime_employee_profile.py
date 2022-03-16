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

def update_spantime_employee_info():
    print("auto update employee info")
    now = datetime.now()

    year = now.strftime("%Y")
    print("year:", year)

    month = now.strftime("%m")
    print("month:", month)

    day = int(now.strftime("%d")) - 3
    if day < 0 :
        day = day + 3
    if day < 10 :
        day = '0' +  str(day) 
    print("day:", day)
    sql_up= """SELECT tb2.*, tb3.StartTime, ROUND(SUM(tb3.SpanTime),2) FROM (SELECT tb1.* FROM (SELECT * FROM amt.amt_tracking b
    WHERE b.ID NOT IN (SELECT ID FROM amt.employee_stop_working))tb
    INNER JOIN (SELECT a.ID,a.NAME, a.Shift, a.Line FROM erpsystem.setup_emplist AS a)tb1
    ON tb1.ID = tb.ID) tb2
    INNER JOIN (SELECT a.ID, a.StartTime, a.SpanTime FROM linebalancing.operation_offstandard_tracking a)tb3
    ON tb3.ID = tb2.ID AND LEFT(tb3.StartTime, 10) = '{year}-{month}-{day}'
    GROUP BY tb2.ID;""".format(year = year, month = month, day = day)
    print(sql_up)
    myCursor.execute(sql_up)
    result= myCursor.fetchall()
    print(result)
    for x in result:
        txt = str(x[4])
        time = txt.split()
        split_time = time[0].split('-')
        year_tracking = split_time[0]
        month_tracking = split_time[1]
        day_tracking = split_time[2]
        day_month_year = year_tracking + month_tracking + day_tracking

        print(day_tracking)
 
        sql_up="""UPDATE amt.employee_profile a SET a.SPAN_TIME = '{x5}' WHERE a.ID = '{x0}' AND DAY_TRACKING = '{x4}'""".format(x0 = str(x[0]), x5 = str(x[5]), x4 = day_month_year )
      
        print(sql_up)
        myCursor.execute("""UPDATE amt.employee_profile a SET a.SPAN_TIME = '{x5}' WHERE a.ID = '{x0}' AND DAY_TRACKING = '{x4}'""".format(x0 = str(x[0]), x5 = str(x[5]), x4 = day_month_year ))
           
        mydb.commit()
update_spantime_employee_info()
# schedule.every().saturday.at("11:59").do(update_employee_info)
# schedule.every().day.at("13:40").do(update_employee_info)
schedule.every(10).minutes.do(update_spantime_employee_info)
# print(datetime.datetime.now())
# print('shedule start')
while True:
    schedule.run_pending()
    time.sleep(1)        
