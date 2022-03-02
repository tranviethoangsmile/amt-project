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
# ds=pd.read_excel("C:\\ABC\\public\\mc\\DANHSACHMAY_05_08_2021-14_39_07.xlsx","MC_IN_U")

filename='C:\\CMMS\\public\\mc\\'+sys.argv[1]
ds=pd.read_excel(filename,"MC_IN_U")
import re
# print("JHI E")

# print(len(ds))
# print(ds)

i=3
# print(len(ds))
# print(ds)
while i<len(ds):

      codenew= ds.iloc[i,1]
      machine= ds.iloc[i,3]
      codeold= ds.iloc[i,2]
      plant= ds.iloc[i,4]
      position= ds.iloc[i,5]
      model=ds.iloc[i,6]
      status= ds.iloc[i,8]
      sys=ds.iloc[i,9]
      des=ds.iloc[i,10]
      seri= ds.iloc[i,7]
      start= ds.iloc[i,11]
      finish= ds.iloc[i,12]
      image=ds.iloc[i,15]
      user=ds.iloc[i,14]
 

      # if str(finish)=='nan' : finish=""
      # # if str(selling1)=='nan' : selling1=""
      # # if str(selling2)=='nan' : selling2=""
      # # if str(distribute)=='nan' : distribute= ""
      # # if str(transfer_time)=='nan' : transfer_time=""
      # # if str(leader)=='nan' : leader=""
      # # if str(quality_remark)=='nan' : quality_remark= ""

      mac=[codenew,codeold,machine,plant,position,model,status,sys,des,seri,start,finish,image,user]
      for j in range(0,14):
            if str(mac[j])== 'nan': mac[j]=""          

      sql_up1='replace into mc_in_u (mc_code,code_old,machine,plant,sub_pos,Model,status,system,des,SerialN,start,finish,image,timeupdate,user)  values ("' +str(mac[0]) + '","' + str(mac[1]) + '","' + str(mac[2]) + '","' + str(mac[3]) + '","' + str(mac[4]) + '","' + str(mac[5]) + '","'+str(mac[6]) +'","'+str(mac[7])+'","' +str(mac[8])+ '","'+str(mac[9])+'","'+str(mac[10])+'","'+str(mac[11])+'","'+str(mac[12])+'", now(),"'+str(mac[13])+'" );'

      # if codeold=="LE-MSB.MCC7":
      #       print(sql_up1)
      myCursor.execute(sql_up1)
      mydb.commit()

      i=i+1
# print(i)
print("finishupmac")
