import math

import sys

import os

import time

import pandas as pd

import string

import getpass

import mysql.connector

import datetime

from sqlalchemy import create_engine

import numpy as np

import calendar

import schedule

engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)

mydb=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

myCursor=mydb.cursor()

def isert_wo(x):
    myCursor.execute('SELECT id FROM work_order WHERE id LIKE "PM%" ORDER BY id DESC LIMIT 1;')
    result1= myCursor.fetchall()
    a= result1[0][0]
    a= a[len(a)-6 :len (a)]
    a="000000"+str(int(a)+1)
    a= "PM"+ a[len(a)-6 :len (a)]
    myCursor.execute('insert into work_order (id,depart_req,type_req,type_eq,req,time_req,leve_req,status_req,procer,time_rec,time_exe, time_confirm,status_work) values ("' + a + '","Hệ thống","Bảo dưỡng định kỳ '+x[1]+'","' + x[0] + '","' + x[0] + '","'+x[2]+'", "'+ x[3] + '","","","'+x[2]+'","'+x[2]+'","'+x[2]+'","Chưa xử lý");')
    mydb.commit()

def update_time(ob,cy,le):
    b=datetime.datetime.strptime(le, '%Y-%m-%d').date()
    if cy=="W":
        b=b+datetime.timedelta(days=7)
    if cy=="2W":
        b=b+datetime.timedelta(days=14)
    if cy=="3W":
        b=b+datetime.timedelta(days=21)
    if cy=="M":
        b=b+datetime.timedelta(days=30)
        c=calendar.day_name[b.weekday()]
        if c=="Sunday":
            b=b+datetime.timedelta(days=1)
    if cy=="2M":
        b=b+datetime.timedelta(days=60)
        c=calendar.day_name[b.weekday()]
        if c=="Sunday":
            b=b+datetime.timedelta(days=1)
    if cy=="Q":
        b=b+datetime.timedelta(days=90)
        c=calendar.day_name[b.weekday()]
        if c=="Sunday":
            b=b+datetime.timedelta(days=1)
    if cy=="2Q":
        b=b+datetime.timedelta(days=180)
        c=calendar.day_name[b.weekday()]
        if c=="Sunday":
            b=b+datetime.timedelta(days=1)
    if cy=="Y":
        b=b+datetime.timedelta(days=365)
        c=calendar.day_name[b.weekday()]
        if c=="Sunday":
            b=b+datetime.timedelta(days=1)      
    return b

def update_wo():
    date_now = datetime.date.today();
    date_finish = date_now+ datetime.timedelta(days=7);
    date_start = date_now+ datetime.timedelta(days=-7);
    sql_up="SELECT objs,cylcle1,leadtime1,priority FROM work_schedule WHERE leadtime1< '"+str(date_finish)+"' AND leadtime2> '"+str(date_start)+"' UNION SELECT objs,cylcle2,leadtime2,priority FROM work_schedule WHERE leadtime2< '"+str(date_finish)+"' AND leadtime2> '"+str(date_start)+"' UNION SELECT objs,cylcle3,leadtime3,priority FROM work_schedule WHERE leadtime3< '"+str(date_finish)+"' AND leadtime3> '"+str(date_start)+"';"
    print(sql_up)
    myCursor.execute(sql_up)
    result= myCursor.fetchall()
    print(result)
    for x in result:
        if x[2] > str(date_now):
            isert_wo(x)
        else :
            b=update_time(x[0],x[1],x[2])
            myCursor.execute("UPDATE work_schedule set leadtime1='"+ str(b)+"' where objs='"+ x[0]+"';")
            mydb.commit()
        
update_wo()
