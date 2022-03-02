import math

import sys

import os

import time

import pandas as pd

import string

import getpass

import mysql.connector

from datetime import datetime

from sqlalchemy import create_engine

import datetime

import numpy as np

import schedule
import os
import datetime

x= datetime.date(2021, 6, 13).isocalendar()[1]-2
namefile = str(x)

# -----------------------------------------------
def update_changestyle(): 


    engine_hbi = create_engine('mysql+mysqlconnector://capacity:capac1ty@pbvweb01v:3306/qco', echo=False)
    mydb=mysql.connector.connect(host="pbvweb01v", user='capacity', passwd='capac1ty', database="qco")

    myCursor=mydb.cursor()
    ds=[]
    ds=pd.read_excel("C:\CHANGE_STYLE\GROUP\CHANGE STYLE W"+namefile+".xlsx")     
    i=0
    while i<len(ds):

        groupcs= ds.iloc[i,0]
        style1= ds.iloc[i,1]
        style2= ds.iloc[i,2]
        distribute= ds.iloc[i,3]
        transfer_time= ds.iloc[i,4]
        leader= ds.iloc[i,6]

        dataline =[groupcs,style1,style2,distribute,transfer_time,leader]
        for j in range(0,7):
            if str(dataline[j])== 'nan': dataline[j]=""       

        sql_up=('update qco.changestyle_group set style1="'+str(dataline[1])+'",style2="'+str(dataline[2])+'",section="'+str(dataline[3])+'",leader="'+str(dataline[5])+'" where group_cs="'+str(dataline[0])+'" and c_time="'+str(dataline[4])+'";')
        print(sql_up)
      
        myCursor.execute(sql_up)
        mydb.commit()
        i=i+1
#----------------------------------------------------------
def update_machine(): 


    engine_hbi = create_engine('mysql+mysqlconnector://capacity:capac1ty@pbvweb01v:3306/qco', echo=False)
    mydb=mysql.connector.connect(host="pbvweb01v", user='capacity', passwd='capac1ty', database="qco")

    myCursor=mydb.cursor()

    ds=[]
    ds=pd.read_excel("C:\CHANGE_STYLE\MACHINE\CHANGE STYLE W"+namefile+"_MACHINE.xlsx")      
    i=0
    j=0
    while i<len(ds):

        stt= ds.iloc[i,0]
        groupcs= ds.iloc[i,1]
        transfer_time= ds.iloc[i,2]
        quality_remark= ds.iloc[i,3]
        add_model= ds.iloc[i,4]
        add_function= ds.iloc[i,5]
        add_quantity= ds.iloc[i,6]
        sub_model= ds.iloc[i,7]
        sub_function= ds.iloc[i,8]
        sub_quantity= ds.iloc[i,9]

        datamachine =[groupcs,transfer_time,quality_remark,add_model,add_function,add_quantity,sub_model,sub_function,sub_quantity]
        for j in range(0,9):
            if str(datamachine[j])== 'nan': datamachine[j]=""          

        sql_up=('update qco.changestyle_machine set quality_remark="'+str(datamachine[2])+'",add_model="'+str(datamachine[3])+'",add_function="'+str(datamachine[4])+'",add_quantity="'+str(datamachine[5])+'",sub_model="'+str(datamachine[6])+'",sub_function="'+str(datamachine[7])+'",sub_quantity="'+str(datamachine[8])+'" where group_cs="'+str(datamachine[0])+'" and c_time="'+str(datamachine[1])+'" and id="'+str(stt)+'";')
        print(sql_up)
      
        myCursor.execute(sql_up)
        mydb.commit()
        i=i+1
# -----------------------------------------------------------

def autoupdateline ():
    global tgcheck
    tgcheck =0
    mydb=mysql.connector.connect(
        host='pbvweb01v',
        user='capacity',
        passwd='capac1ty',
        database="qco"
    )     
    report_link="C:\CHANGE_STYLE\GROUP\CHANGE STYLE W"+namefile+".xlsx"
    modTimesinceEpoc = os.path.getmtime(report_link)
    modificationTime = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(modTimesinceEpoc))
    if tgcheck==0:
        print("Last Modified Time of line : ", modificationTime )
        sql_check_modified= 'SELECT max(time_modified) FROM time_update WHERE name="line";'
        # sql_check_modified= 'SELECT max(time_modified) FROM time_admin;'
        t_la=pd.read_sql(sql_check_modified, con=mydb)
        t_old=str(t_la.iloc[0,0])
    print(t_old)
    time_check = datetime.datetime.now()
    print (time_check)

    if modificationTime==t_old:
        tgcheck= tgcheck + 1
        if tgcheck==5:
            print('no update line at ',time_check.strftime('%Y-%m-%d %H:%M:%S'))
            tgcheck=1
    else:
        print("Last Modified Time of Line : ", modificationTime )
        tgcheck=0
        print('update line at ',time_check.strftime('%Y-%m-%d %H:%M:%S'))
        sql_time='insert into time_update (name,time_modified) values ("line","'+str(modificationTime)+'")'
        myCursor=mydb.cursor()
        myCursor.execute(sql_time)
        mydb.commit()
        myCursor.close()
        update_changestyle()

def autoupdatemachine ():
    global tgcheck
    tgcheck =0
    mydb=mysql.connector.connect(
        host='pbvweb01v',
        user='capacity',
        passwd='capac1ty',
        database="qco"
    )     
    report_link="C:\CHANGE_STYLE\MACHINE\CHANGE STYLE W"+namefile+"_MACHINE.xlsx"
    modTimesinceEpoc = os.path.getmtime(report_link)
    modificationTime = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(modTimesinceEpoc))
    if tgcheck==0:
        print("Last Modified Time of machine : ", modificationTime )
        sql_check_modified= 'SELECT max(time_modified) FROM time_update WHERE name="machine";'
        t_la=pd.read_sql(sql_check_modified, con=mydb)
        t_old=str(t_la.iloc[0,0])
    print(t_old)
    time_check = datetime.datetime.now()
    print (time_check)

    if modificationTime==t_old:
        tgcheck= tgcheck + 1
        if tgcheck==5:
            print('no update machine at ',time_check.strftime('%Y-%m-%d %H:%M:%S'))
            tgcheck=1

    else:
        print("Last Modified Time of machine: ", modificationTime )
        tgcheck=0
        print('update machine at ',time_check.strftime('%Y-%m-%d %H:%M:%S'))
        sql_time='insert into time_update (name,time_modified) values ("machine","'+str(modificationTime)+'")'
        myCursor=mydb.cursor()
        myCursor.execute(sql_time)
        mydb.commit()
        myCursor.close()
        update_machine()

# schedule.every(2).minutes.do(autoupdateline)
# schedule.every(2).minutes.do(autoupdatemachine)
# print(datetime.datetime.now())
# print('shedule start')
# # run pending
# while True:
#     schedule.run_pending()
#     time.sleep(1)
schedule.every(1).day.at("20:25").do(autoupdateline)
schedule.every(1).day.at("20:25").do(autoupdatemachine)
print(datetime.datetime.now())
print('shedule start')
# run pending
while True:
    schedule.run_pending()
    time.sleep(1)
