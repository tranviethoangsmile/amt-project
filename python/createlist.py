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
# print(schedule.__doc__)
# print(dir(schedule))
# print(schedule)
# print(schedule.has_app_context())
import time
 


engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)

mydb=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

myCursor=mydb.cursor()


def update_woo(cy,date1):
    if cy!='' and str(date1)!="None" and str(date1)!="" :
        b=datetime.datetime.strptime(str(date1), '%Y-%m-%d').date()
        if cy=="W":
            d=7
        if cy=="2W":
            d=14
        if cy=="3W":
            d=21
        if cy=="M":
            d=30
        if cy=="2M":
            d=60
        if cy=="Q":
            d=90
        if cy=="2Q":
            d=180
        if cy=="Y":
            d=365
        list=[b]
        while True:
            b=b+datetime.timedelta(days=d)
            c=calendar.day_name[b.weekday()]
            if c=="Sunday":
                b=b+datetime.timedelta(days=1)
            if b.year > datetime.datetime.now().year:
                break;
            list.append(b)
        return list
    else :
        return ''
     
def update_wo():
    myCursor.execute("delete from work_schedule_detail WHERE Objs='"+sys.argv[1]+"' ;")
    mydb.commit()
    sql_up='SELECT * FROM work_schedule WHERE objs="'+sys.argv[1]+'";'
    myCursor.execute(sql_up)
    result= myCursor.fetchall()
    for x in result:
        l1=update_woo(x[1],x[2])
        l2=update_woo(x[3],x[4])
        l3=update_woo(x[5],x[6])
    for a in l1:
        aa=a.strftime("%U")
        myCursor.execute("insert into work_schedule_detail (Objs,Cycle,Date,week) values ('"+sys.argv[1]+"','"+ str(x[1])+"','"+ str(a)+"','"+ str(aa)+"');")
        mydb.commit()
    for b in l2:
        bb=b.strftime("%U")
        myCursor.execute("insert into work_schedule_detail (Objs,Cycle,Date,week) values ('"+sys.argv[1]+"','"+ str(x[3])+"','"+ str(b)+"','"+ str(bb)+"');")
        mydb.commit()
    for c in l3:
        cc=c.strftime("%U")
        myCursor.execute("insert into work_schedule_detail (Objs,Cycle,Date,week) values ('"+sys.argv[1]+"','"+ str(x[5])+"','"+ str(c)+"','"+ str(cc)+"');")
        mydb.commit()

update_wo()     
print("ok")   

# import datetime

# x = datetime.datetime.now()

# print(x.strftime("%U"))
