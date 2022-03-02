import openpyxl

import sys

import pprint

import pandas as pd

import mysql.connector

from sqlalchemy import create_engine

import datetime

engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)

mydb=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

myCursor=mydb.cursor()

wb = openpyxl.load_workbook('C:/CMMS/python/PHIEU.xlsx')
# sheet = wb['PHU-F-FM-001']

agv=sys.argv[1]
agv.count("|")
list=[]
i=0
a=1
n=''
while i<agv.count("|"):
    list.append(agv[a:a+8])
    a=a+9
    i=i+1
for x in list:
    if n=='':
        sheet = wb["FM"]
    else:
        sheet = wb[n]
    sheet.title= str(x)
    wb.copy_worksheet(wb[x])
    n= str(x)+" Copy"
    sql_up="SELECT * FROM work_order WHERE id='"+x+"';"
    myCursor.execute(sql_up)
    result= myCursor.fetchall()


    sheet['K1'] = result[0][0]
    sheet['J2'] = result[0][14]+":"+result[0][14]
    sheet['J3'] = result[0][10]
    sheet['E3'] = result[0][1]
    sheet['E4'] = result[0][2]
    sheet['A6'] = result[0][15]
    sheet['G6'] = result[0][20]
    sheet['E24'] = result[0][18]

    sql_up="SELECT * FROM part_log WHERE wo='"+x+"';"
    myCursor.execute(sql_up)
    result= myCursor.fetchall()
    stt=0
    pos=13
    for y in result:
        stt= stt +1
        sheet['A'+str(pos)]=stt
        sheet['B'+str(pos)] = y[1]
        sheet['G'+str(pos)] = y[5]
        sheet['H'+str(pos)] = y[11]
        pos=pos+1
 
    wb.save('C:/CMMS/public/import_workex/PHIEUCV.xlsx')
print('./public/import_workex/PHIEUCV.xlsx')
