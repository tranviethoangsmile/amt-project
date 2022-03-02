# -*- coding: utf-8 -*-
"""
Created on Mon Dec 21 19:34:30 2020

@author: mutran
"""

# -*- coding: utf-8 -*-

"""
Created on Mon Dec 21 18:58:25 2020

@author: mutran
"""
import sys, json
import os
import string
import pandas as pd
from sqlalchemy import create_engine
#import random
import datetime
from datetime import datetime
import numpy as np
import mysql.connector
mydb=mysql.connector.connect(
    host='pbvweb01v',
    user='intern',
    passwd='intern21',
    database="amt"
)
engine_phubaiinnovation= create_engine('mysql+mysqlconnector://root:123456@pbvweb01v:3306/amt', echo=False)
mycursor = mydb.cursor()
pathFile='./public/home/' + sys.argv[1]

datafull=pd.read_excel(pathFile)
datafull=datafull.fillna("")
print('Mechani_HeadCount: ',len(datafull))
print(datafull)
# Begin Update
for i in range(0,len(datafull)):
    # STT=str(datafull.iloc[i,0])
    # IDMechanic=str(datafull.iloc[i,1]) 
    # NameMechanic=str(datafull.iloc[i,2])
    # print(STT)
    ID=str(datafull.iloc[i,0])
    NAME=str(datafull.iloc[i,1]) 
    SHIFT=str(datafull.iloc[i,2])
    OPERATION_NAME=str(datafull.iloc[i,3])
    CODE_TRANNING=str(datafull.iloc[i,4]) 
    REDUCE_DATE=str(datafull.iloc[i,5])
    NOTE=str(datafull.iloc[i,6]) 
    REASON_NOT_PASS=str(datafull.iloc[i,7])
    print(ID)
   
   
    query=('INSERT INTO amt_tracking(ID,NAME,SHIFT,OPERATION_NAME,CODE_TRAINING,REDUCE_DATE,NOTE,REASON_NOT_PASS)'
        + 'values (%s, %s, %s, %s, %s, %s, %s, %s)')
    values=(ID,NAME,SHIFT,OPERATION_NAME,CODE_TRANNING,REDUCE_DATE,NOTE,REASON_NOT_PASS)
    print(query)
    mycursor.execute(query, values)
    mydb.commit()
    if i%100==0:
        print(i,' / ',len(datafull))
    i+=1
mydb.close()
print('finished')
