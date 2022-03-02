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


engine_hbi = create_engine('mysql+mysqlconnector://capacity:capac1ty@pbvweb01v:3306/qco', echo=False)

mydb=mysql.connector.connect(host="pbvweb01v", user='capacity', passwd='capac1ty', database="qco")


myCursor=mydb.cursor()

ds=[]   
ds=pd.read_excel("C:\CHANGE_STYLE\MACHINE\CHANGE STYLE W21_MACHINE.xlsx")

print(len(ds))
print(ds)

i=0

while i<len(ds):
      
      # stt= ds.iloc[i,0]
      groupcs= ds.iloc[i,0]
      transfer_time= ds.iloc[i,1]
      quality_remark= ds.iloc[i,2]
      add_model= ds.iloc[i,3]
      add_function= ds.iloc[i,4]
      add_quantity= ds.iloc[i,5]
      sub_model= ds.iloc[i,6]
      sub_function= ds.iloc[i,7]
      sub_quantity= ds.iloc[i,8]

      datamachine =[groupcs,transfer_time,quality_remark,add_model,add_function,add_quantity,sub_model,sub_function,sub_quantity]
      print(datamachine)
      for j in range(0,9):
            if str(datamachine[j])== 'nan': datamachine[j]=""          
      print(datamachine)

      sql_up=('insert into qco.changestyle_machine  (group_cs,c_time,quality_remark, add_model, add_function, add_quantity, sub_model, sub_function, sub_quantity) values ("'+str(datamachine[0])+'","'+str(datamachine[1])+'","'+str(datamachine[2])+'","'+str(datamachine[3])+'","'+str(datamachine[4])+'","'+str(datamachine[5])+'","'+str(datamachine[6])+'","'+str(datamachine[7])+'","'+str(datamachine[8])+'");')
      print(sql_up)
      
      myCursor.execute(sql_up)

      mydb.commit()

      i=i+1

print("finish")
