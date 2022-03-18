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

def insert_irr_tracking():
    print("auto insert irr tracking")
    now = datetime.now()

    year = now.strftime("%Y")
    print("year:", year)

    month = int(now.strftime("%m")) - 1
    print("month:", month)
    if month < 10 : 
        month = '0' + str(month)

    day = int(now.strftime("%d")) - 4
    if day < 0 :
        day = day + 15
    if day < 10 :
        day = '0' +  str(day) 
    print("day:", day)
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
insert_irr_tracking()
# schedule.every().saturday.at("11:59").do(update_employee_info)
# schedule.every().day.at("13:40").do(insert_irr_tracking)
# schedule.every(5).minutes.do(insert_irr_tracking)
# print(datetime.datetime.now())
# print('shedule start')
# while True:
#     schedule.run_pending()
#     time.sleep(1)
