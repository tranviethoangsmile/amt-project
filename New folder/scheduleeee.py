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

# import schedule

engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)

mydb=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

myCursor=mydb.cursor()

# def update_week(): 
#     sql_up="SELECT objs,W FROM work_schedulee WHERE W LIKE '%2%';"
#     myCursor.execute(sql_up)
#     result= myCursor.fetchall()
#     # print(result)
#     for x in result:
#         # print(x[1])
#         a=datetime.datetime.strptime(x[1], '%Y-%m-%d').date()
#         b=a+datetime.timedelta(days=7);
#         # print(b)
#         myCursor.execute("UPDATE work_schedulee set W='"+ str(b)+"' where objs='"+ x[0]+"';")
#         # print("UPDATE work_schedulee set W='"+ str(b)+"' where objs='"+ x[0]+"';") 
#         mydb.commit()

# def update_2week(): 
#     sql_up="SELECT objs,W2 FROM work_schedulee WHERE W2 LIKE '%2%';"
#     myCursor.execute(sql_up)
#     result= myCursor.fetchall()
#     for x in result:
#         a=datetime.datetime.strptime(x[1], '%Y-%m-%d').date()
#         b=a+datetime.timedelta(days=14);
#         myCursor.execute("UPDATE work_schedulee set W2='"+ str(b)+"' where objs='"+ x[0]+"';")
#         mydb.commit()

# def update_3week(): 
#     sql_up="SELECT objs,W3 FROM work_schedulee WHERE W3 LIKE '%2%';"
#     myCursor.execute(sql_up)
#     result= myCursor.fetchall()
#     for x in result:
#         a=datetime.datetime.strptime(x[1], '%Y-%m-%d').date()
#         b=a+datetime.timedelta(days=21);
#         myCursor.execute("UPDATE work_schedulee set W3='"+ str(b)+"' where objs='"+ x[0]+"';")
#         mydb.commit()

# def update_month(): 
#     sql_up="SELECT objs,M FROM work_schedulee WHERE M LIKE '%2%';"
#     myCursor.execute(sql_up)
#     result= myCursor.fetchall()
#     for x in result:
#         a=datetime.datetime.strptime(x[1], '%Y-%m-%d').date()
#         # print(a)
#         b=a+datetime.timedelta(days=30)
#         # print(b)
#         c=calendar.day_name[b.weekday()]
#         # print(c)
#         # print("-----")
#         if c=="Sunday":
#             b=b+datetime.timedelta(days=1)
#             # print(b)
#             # c=calendar.day_name[b.weekday()]
#             # print(c)     
#         myCursor.execute("UPDATE work_schedulee set M='"+ str(b)+"' where objs='"+ x[0]+"';")
#         mydb.commit()

# def update_2month(): 
#     sql_up="SELECT objs,M2 FROM work_schedulee WHERE M2 LIKE '%2%';"
#     myCursor.execute(sql_up)
#     result= myCursor.fetchall()
#     for x in result:
#         a=datetime.datetime.strptime(x[1], '%Y-%m-%d').date()
#         b=a+datetime.timedelta(days=60)
#         c=calendar.day_name[b.weekday()]
#         if c=="Sunday":
#             b=b+datetime.timedelta(days=1)  
#         myCursor.execute("UPDATE work_schedulee set M2='"+ str(b)+"' where objs='"+ x[0]+"';")
#         mydb.commit()

# def update_quarter(): 
#     sql_up="SELECT objs,Q FROM work_schedulee WHERE Q LIKE '%2%';"
#     myCursor.execute(sql_up)
#     result= myCursor.fetchall()
#     for x in result:
#         a=datetime.datetime.strptime(x[1], '%Y-%m-%d').date()
#         b=a+datetime.timedelta(days=90)
#         c=calendar.day_name[b.weekday()]
#         if c=="Sunday":
#             b=b+datetime.timedelta(days=1)  
#         myCursor.execute("UPDATE work_schedulee set Q='"+ str(b)+"' where objs='"+ x[0]+"';")
#         mydb.commit()

# def update_2quarter(): 
#     sql_up="SELECT objs,Q FROM work_schedulee WHERE Q LIKE '%2%';"
#     myCursor.execute(sql_up)
#     result= myCursor.fetchall()
#     for x in result:
#         a=datetime.datetime.strptime(x[1], '%Y-%m-%d').date()
#         b=a+datetime.timedelta(days=180)
#         c=calendar.day_name[b.weekday()]
#         if c=="Sunday":
#             b=b+datetime.timedelta(days=1)  
#         myCursor.execute("UPDATE work_schedulee set Q='"+ str(b)+"' where objs='"+ x[0]+"';")
#         mydb.commit()

# def update_year(): 
#     sql_up="SELECT objs,Y FROM work_schedulee WHERE Y LIKE '%2%';"
#     myCursor.execute(sql_up)
#     result= myCursor.fetchall()
#     for x in result:
#         a=datetime.datetime.strptime(x[1], '%Y-%m-%d').date()
#         b=a+datetime.timedelta(days=365)
#         c=calendar.day_name[b.weekday()]
#         if c=="Sunday":
#             b=b+datetime.timedelta(days=1)  
#         myCursor.execute("UPDATE work_schedulee set Y='"+ str(b)+"' where objs='"+ x[0]+"';")
#         mydb.commit()

# schedule.every().thursday.at("22:00").do(update_week)
date_start = datetime.date.today();
# print(date_start);
date_finish = date_start+ datetime.timedelta(days=7);
# print(date_finish);
sql_up="SELECT objs,cylcle1,leadtime1 FROM work_schedule WHERE leadtime1< '"+str(date_finish)+"' AND leadtime1> '"+str(date_start)+"';"
myCursor.execute(sql_up)
result= myCursor.fetchall()
print(result)
# for x in result:
#         # print(x[1])
#     a=datetime.datetime.strptime(x[1], '%Y-%m-%d').date()
#     b=a+datetime.timedelta(days=7);
#         # print(b)
#     myCursor.execute("UPDATE work_schedulee set W='"+ str(b)+"' where objs='"+ x[0]+"';")
#         # print("UPDATE work_schedulee set W='"+ str(b)+"' where objs='"+ x[0]+"';") 
#     mydb.commit()
