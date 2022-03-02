import math

import sys

import os

import glob
import os

list_of_files = glob.glob('./uploads/CHANGE_STYLE/GROUP/*') # * means all if need specific format then *.csv
latest_file = max(list_of_files, key=os.path.getctime)
print (latest_file)

import time

import pandas as pd

import string

import getpass

import mysql.connector

from datetime import datetime

from sqlalchemy import create_engine

import datetime

import numpy as np


print('hi ae')

engine_hbi = create_engine('mysql+mysqlconnector://capacity:capac1ty@pbvweb01v:3306/qco', echo=False)

mydb=mysql.connector.connect(host="pbvweb01v", user='capacity', passwd='capac1ty', database="qco")

myCursor=mydb.cursor()

ds=[]

ds=pd.read_excel(latest_file)

print(len(ds))
print(ds)

i=0

while i<len(ds):

      groupcs= ds.iloc[i,0]
      selling1= ds.iloc[i,1]
      selling2= ds.iloc[i,2]
      distribute= ds.iloc[i,3]
      transfer_time= ds.iloc[i,4]
      leader= ds.iloc[i,5]

      if str(groupcs)=='nan' : groupcs=" "
      if str(selling1)=='nan' : selling1=" "
      if str(selling2)=='nan' : selling2=" "
      if str(distribute)=='nan' : distribute=" "
      if str(transfer_time)=='nan' : transfer_time=" "
      if str(leader)=='nan' : leader=" "

      sql_up=('insert into qco.changestyle_group  (group_cs, style1, style2, section, c_time, leader) values ("'+str(groupcs)+'","'+str(selling1)+'","'+str(selling2)+'","'+str(distribute)+'","'+str(transfer_time)+'","'+str(leader)+'");')

      print(sql_up)
 
      myCursor.execute(sql_up)

      mydb.commit()

      i=i+1

print("finish")
