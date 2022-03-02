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
ds=[]   
#filename='C:\\CMMS\\public\\sche\\nhtonkế hoạch bảo trì 2022.xlsx'

filename='C:\\Users\\ngmai1\\Desktop\\cmms\\public\\sche\\'+sys.argv[1]
ds=pd.read_excel(filename)
import re

def update_woo(cy,date1):
    if cy!='' and str(date1)!="None" :
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
                break
            list.append(b)
        return list
    else :
        return []

i=2
while i<len(ds):
    ob=ds.iloc[i,1]
    tb=ds.iloc[i,0]
    if str(ob)!='' and str(ob)!="nan":
        w= ds.iloc[i,4]
        w2= ds.iloc[i,5]
        w3= ds.iloc[i,6]
        m= ds.iloc[i,7]
        m2= ds.iloc[i,8]
        q= ds.iloc[i,9]
        q2= ds.iloc[i,10]
        y= ds.iloc[i,11]
        pri=ds.iloc[i,3]
        ll1= ds.iloc[i,12]
        ll2= ds.iloc[i,13]
        ll3= ds.iloc[i,14]
        if str(ll1)=="nan":
            ll1="2022-01-01"
        if str(ll2)=="nan":
            ll2=ll1
        if str(ll3)=="nan":
            ll3=ll1
        if str(pri)=="nan":
            pri=3
        qty=ds.iloc[i,2]
        a=0
        time=['W','2W','3W','M','2M','Q','2Q','Y']
        cylcle=['','','']
        datamachine =[w,w2,w3,m,m2,q,q2,y]
        for j in range(0,8):
            if str(datamachine[j])== 'nan': datamachine[j]="";       
        for j in range(0,8):
            if str(datamachine[j])== 'X': 
                cylcle[a]=time[j]
                a=a+1
        if str(cylcle[2])!='':
            sql_up=('replace into fm.work_schedule  (objs,name_obj,priority,cylcle1,cylcle2,cylcle3,leadtime1,leadtime2,leadtime3,user,timeupdate,note) values ("'+str(ob)+'","'+str(tb)+'","'+str(pri)+'","'+str(cylcle[0])+'","'+str(cylcle[1])+'","'+str(cylcle[2])+'","'+str(ll1)+'","'+str(ll2)+'","'+str(ll3)+'","nton",now(),"'+str(qty)+'");')  
            
            myCursor.execute(sql_up)
            mydb.commit()
        elif str(cylcle[1])!='':
            sql_up=('replace into fm.work_schedule  (objs,name_obj,priority,cylcle1,cylcle2,leadtime1,leadtime2,leadtime3,user,timeupdate,note) values ("'+str(ob)+'","'+str(tb)+'","'+str(pri)+'","'+str(cylcle[0])+'","'+str(cylcle[1])+'","'+str(ll1)+'","'+str(ll2)+'",null,"nton",now(),"'+str(qty)+'");')
               
            myCursor.execute(sql_up)
            mydb.commit()
        elif str(cylcle[0])!='':
            sql_up=('replace into fm.work_schedule  (objs,name_obj,priority,cylcle1,leadtime1,leadtime2,leadtime3,user,timeupdate,note) values ("'+str(ob)+'","'+str(tb)+'","'+str(pri)+'","'+str(cylcle[0])+'","'+str(ll1)+'",null,null,"nton",now(),"'+str(qty)+'");')
                
            myCursor.execute(sql_up)
            mydb.commit()
        
        if str(ob)!='' and str(ob)!="nan":
            myCursor.execute("delete from work_schedule_detail WHERE Objs='"+str(ob)+"' ;")
            
            mydb.commit()
            sql_up1='SELECT * FROM work_schedule WHERE objs="'+str(ob)+'";'
            
            myCursor.execute(sql_up1)
            result= myCursor.fetchall()
            for x in result:
                
                l1=update_woo(x[2],x[3])
                l2=update_woo(x[4],x[5])
                l3=update_woo(x[6],x[7])
            for a in l1:
                aa=a.strftime("%U")
                myCursor.execute("insert into work_schedule_detail (Objs,name_obj,Cycle,Date,week,Priority) values ('"+str(ob)+"','"+str(tb)+"','"+ str(x[2])+"','"+ str(a)+"','"+ str(aa)+"','"+str(pri)+"');")
                mydb.commit()
            for b in l2:
                bb=b.strftime("%U")
                myCursor.execute("insert into work_schedule_detail (Objs,name_obj,Cycle,Date,week,Priority) values ('"+str(ob)+"','"+str(tb)+"','"+ str(x[4])+"','"+ str(b)+"','"+ str(bb)+"','"+str(pri)+"');")
                mydb.commit()
            for c in l3:
                cc=c.strftime("%U")
                myCursor.execute("insert into work_schedule_detail (Objs,name_obj,Cycle,Date,week,Priority) values ('"+str(ob)+"','"+str(tb)+"','"+ str(x[4])+"','"+ str(c)+"','"+ str(cc)+"','"+str(pri)+"');")
                mydb.commit()
    i=i+1
print("finishupm")



    
       