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
sql_up1='update spare_new set Qty_ic="0",Qty_im="0",Qty_ex="0" where id LIKE "%ID";'
myCursor.execute(sql_up1)
mydb.commit()
ds=[]   

filename='C:\\CMMS\\public\\spare\\'+sys.argv[1]
ds=pd.read_excel(filename,"IC238-Dau ky")
import re
i=3

while i<len(ds):
      id= ds.iloc[i,4]
      if id=='':
            continue
      qty= str(ds.iloc[i,7])
      qty= qty.replace(".0","")
      sql_up2='update spare_new set Qty_ic="'+str(qty)+'",Qty="'+str(qty)+'" where id="'+str(id)+'";'
      myCursor.execute(sql_up2)
      mydb.commit()
      i=i+1

print("finishupspare")
