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
# ds=pd.read_excel("C:\\ABC\\ex.xlsx","BANG THAM CHIEU")
filename='C:\\CMMS\\public\\spare\\'+sys.argv[1]
ds=pd.read_excel(filename,"SPARE")
import re
# print("JHI E")

# print(len(ds))
# print(ds)

i=0
# print(len(ds))
# print(ds)
while i<len(ds):
      stt= ds.iloc[i,0]
      id= ds.iloc[i,1]
      name= ds.iloc[i,2]
      location= ds.iloc[i,4]
      price= ds.iloc[i,5]
      mc=ds.iloc[i,6]
      partnumber= ds.iloc[i,7]
      unit=ds.iloc[i,8]
      qtyim=ds.iloc[i,9]
      qtyex= ds.iloc[i,10]
      qty= ds.iloc[i,11]
      qtymin= ds.iloc[i,12]
      qtymax=ds.iloc[i,13]
      note=ds.iloc[i,18]
      fre=ds.iloc[i,21]
      image=ds.iloc[i,3]
 

      # if str(finish)=='nan' : finish=""
      # # if str(selling1)=='nan' : selling1=""
      # # if str(selling2)=='nan' : selling2=""
      # # if str(distribute)=='nan' : distribute= ""
      # # if str(transfer_time)=='nan' : transfer_time=""
      # # if str(leader)=='nan' : leader=""
      # # if str(quality_remark)=='nan' : quality_remark= ""

      # mac=[codenew,codeold,machine,plant,position,model,status,sys,des,seri,start,finish,image,user]
      # for j in range(0,14):
      #       if str(mac[j])== 'nan': mac[j]=""          
      # sql_up2='delete from spare_new;'

      # # if codeold=="LE-MSB.MCC7":
      # # print(sql_up1)
      # myCursor.execute(sql_up2)
      # mydb.commit()

      sql_up1='replace into spare_new (Stt,Id,Name,Location,Price,Mc,Part_number,Unit,Qty_im,Qty_ex,Qty,Qty_min,Qty_max,Note,Fre_order,User_update,Time_update,Image) values ("' +str(stt) + '","' + str(id) + '","' + str(name) + '","' + str(location) + '","' + str(price) + '","' + str(mc) + '","'+str(partnumber) +'","'+str(unit)+'","' +str(qtyim)+ '","'+str(qtyex)+'","'+str(qty)+'","'+str(qtymin)+'","'+str(qtymax)+'","'+str(note)+'","'+str(fre)+'","uynguyen",now(),"'+str(image)+'");'
      if str(stt)=='nan':
            break
      myCursor.execute(sql_up1)
      mydb.commit()
      i=i+1
# print(i)
print("finishupspare")
