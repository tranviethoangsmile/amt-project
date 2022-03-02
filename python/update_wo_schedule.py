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
 
engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)

mydb=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

myCursor=mydb.cursor()

def update_wo():
    print("Cập nhật!!!!!!!!!!!!")
    print(datetime.datetime.now())
    date_now = datetime.date.today();
    date_finish = date_now+ datetime.timedelta(days=7);
    date_start = date_now+ datetime.timedelta(days=-7);
    sql_up="SELECT Objs,name_obj,Cycle,Date,priority FROM work_schedule_detail WHERE Date< '"+str(date_finish)+"' AND Date> '"+str(date_start)+"' AND Status='""';"
    print(sql_up)
    myCursor.execute(sql_up)
    result= myCursor.fetchall()
    print(result)
    for x in result:
        myCursor.execute('SELECT sub_pos FROM mc_in_u WHERE code_old="' + x[0] +'";')
        print('SELECT sub_pos FROM mc_in_u WHERE code_old="' + x[0] +'";')
        result2= myCursor.fetchall()
        myCursor.execute('SELECT id FROM work_order WHERE id LIKE "PM%" ORDER BY id DESC LIMIT 1;')
        result1= myCursor.fetchall()
        if len(result1) <1 :
            a= "PM000001"
        else:
            a= result1[0][0]
            a= a[len(a)-6 :len (a)]
            a="000000"+str(int(a)+1)
            a= "PM"+ a[len(a)-6 :len (a)]
        if len(result2)<1:
            sql_up='insert into work_order (id,depart_req,type_req,type_eq,req,time_req,timeend_req,leve_req,status_work,place_req,cycle) values ("' + str(a) + '","F&M","'+str(x[2])+'","' + str(x[0]) + '","Bảo dưỡng định kỳ '+str(x[1])+':' + str(x[0]) + '","'+str(x[3])+'","'+str(x[3])+'", "'+ str(x[4]) + '","Chưa phân công","","'+ str(x[2]) + '");'
            print(sql_up)
            myCursor.execute('insert into work_order (id,depart_req,type_req,type_eq,req,time_req,timeend_req,leve_req,status_work,place_req,cycle) values ("' + str(a) + '","F&M","'+str(x[2])+'","' + str(x[0]) + '","Bảo dưỡng định kỳ '+str(x[1])+':' + str(x[0]) + '","'+str(x[3])+'","'+str(x[3])+'", "'+ str(x[4]) + '","Chưa phân công","","'+ str(x[2]) + '");')
        else:
            myCursor.execute('insert into work_order (id,depart_req,type_req,type_eq,req,time_req,timeend_req,leve_req,status_work,place_req,cycle) values ("' + str(a) + '","F&M","'+str(x[2])+'","' + str(x[0]) + '","Bảo dưỡng định kỳ '+str(x[1])+':' + str(x[0]) + '","'+str(x[3])+'","'+str(x[3])+'", "'+ str(x[4]) + '","Chưa phân công","'+str(result2[0][0])+'","'+ str(x[2]) + '");')
        # print('insert into work_order (id,depart_req,type_req,type_eq,req,time_req,leve_req,status_req,procer,status_work,place_req,cycle) values ("' + a + '","F&M","Bảo dưỡng định kỳ '+x[1]+'","' + x[0] + '","","'+x[2]+'", "'+ x[3] + '","","","Chưa phân công","'+result2[0][0]+'","'+ x[1] + '");')
        mydb.commit()

        myCursor.execute('update work_schedule_detail set Status="Đã phân" WHERE Objs="'+str(x[0])+'" AND Date="'+str(x[3])+'" AND Cycle="'+str(x[2])+'" ')
        print('update work_schedule_detail set Status="Đã phân" WHERE Objs="'+str(x[0])+'" AND Date="'+str(x[3])+'" AND Cycle="'+str(x[2])+'"')
        mydb.commit()
    # print(result)
update_wo()
schedule.every().monday.at("9:21").do(update_wo)
# schedule.every().day.at("12:00").do(update_wo)
print(datetime.datetime.now())
print('shedule start')
while True:
    schedule.run_pending()
    time.sleep(1)        
