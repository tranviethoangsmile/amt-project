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

engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)

mydb=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

myCursor=mydb.cursor()

ds=[]   
ds=pd.read_excel("C:\\CMMS\\Nhân lực.XLSX")

# filename='C:\\ABC\\public\\mc\\'+sys.argv[1]
# ds=pd.read_excel(filename,"MC_IN_U")
# import re
# print("JHI E")

# print(len(ds))
# print(ds)

i=4
# print(len(ds))
# print(ds)
while i<len(ds):

    id= ds.iloc[i,1]
    name= ds.iloc[i,2]
    bday= ds.iloc[i,3]
    lexpert= ds.iloc[i,4]
    cer= ds.iloc[i,5]
    expert1=ds.iloc[i,6]
    expert2=ds.iloc[i,7]
    expert3= ds.iloc[i,8]
    expert4=ds.iloc[i,9]
    expert5=ds.iloc[i,10]
    expert6= ds.iloc[i,11]
    l1=ds.iloc[i,12]
    l2=ds.iloc[i,13]
    l3= ds.iloc[i,14]
    sd=ds.iloc[i,15]
    position=ds.iloc[i,16]
    team= ds.iloc[i,17]
    add= ds.iloc[i,18]
    num= ds.iloc[i,19]
    mail = ds.iloc[i,21]
    stt=ds.iloc[i,0]
    exper=""

    st=[id,name,bday,lexpert,cer,expert1,expert2,expert3,expert4,expert5,expert6,l1,l2,l3,sd,position,team,add,num]
    for j in range(0,19):
        if str(st[j])== 'nan': st[j]=""          
    if str(st[5])=='1':
        st[5]="Cơ khí"
    if str(st[6])=='1':
        st[6]="Điện công nghiệp"
    if str(st[7])=='1':
        st[7]="Điện lạnh"
    if str(st[8])=='1':
        st[8]="Điện tử"
    if str(st[9])=='1':
        st[9]="Xây dựng"
    for b in range(5,11):
        if str(st[b])!="":  exper= exper+ " "+st[b]+ " |"
    exper=exper[0:len(exper)-1]
    print(exper)
    # print(a)
    sql_up1='replace into fm_staff (idfm,name,expertise,levels,team,b_day,position,le_expert,certificate,address,ph_num,start_day,stt,email) values ("' +str(st[0]) + '","' + str(st[1]) + '","' + str(exper) + '","' + str(st[11]) +str(st[12]) +str(st[13])+ '","' + str(st[16]) + '","' + str(st[2]) + '","'+str(st[15]) +'","'+str(st[3])+'","' +str(st[4])+ '","'+str(st[17])+'","'+str(st[18])+'","'+str(st[14])+'","'+str(stt)+'","' +str(mail) + '");'
    print(sql_up1)
    myCursor.execute(sql_up1)
    mydb.commit()

    i=i+1
# print(i)
print("finishupmac")
