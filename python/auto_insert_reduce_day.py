import math
from pickle import REDUCE

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

def insert_reduce_day():
    print("auto insert reduce day")
    now = datetime.now()

    year = now.strftime("%Y")
    print("year:", year)

    month = now.strftime("%m")
    print("month:", month)

    day = int(now.strftime("%d")) - 12
    if day < 0 :
        day = day + 12
    if day < 10 :
        day = '0' +  str(day) 
    print("day:", day)
    sql_up= """SELECT ID, DAY_TRAINING, ROUND(SUM(DOWTIME) + SUM(SPAN_TIME),2) AS STAND_OFF,floor(((ROUND(SUM(DOWTIME)+ SUM(SPAN_TIME),2) - 2.5)/7.39) + 1) AS REDUCE_DAY 
    FROM amt.employee_profile WHERE DAY_TRACKING <= '{year}{month}{day}'
    GROUP BY ID;""".format(year = year, month = month, day = day)
    print(sql_up)
    myCursor.execute(sql_up)
    result= myCursor.fetchall()
    print(result)
    for x in result:
        print(str(x[3]))
        sql_up="""UPDATE amt.employee_profile a SET a.REDUCE_DAY = '{REDUCE_DAY}' WHERE a.ID = '{ID}' AND DAY_TRACKING = '{year}{month}{day}'""".format(REDUCE_DAY = str(x[3]), ID = str(x[0]),year = year, month = month, day = day )
        print(sql_up)
        myCursor.execute(sql_up)
        mydb.commit()
insert_reduce_day()
# schedule.every().saturday.at("11:59").do(update_employee_info)
# schedule.every().day.at("13:40").do(insert_reduce_day)
# schedule.every(5).minutes.do(insert_reduce_day)
# print(datetime.datetime.now())
# print('shedule start')
# while True:
#     schedule.run_pending()
#     time.sleep(1)        
