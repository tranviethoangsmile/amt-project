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
pathFile='./public/amt/' + sys.argv[1]

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
    DAY=str(datafull.iloc[i,0])
    CODE_TRANNING=str(datafull.iloc[i,1]) 
    TAGETS=str(datafull.iloc[i,2])
    print(DAY)
   
   
    query=('INSERT INTO amt.tagets_training_tracking(DAY, CODE_TRANNING, TAGETS)'
        + 'values (%s, %s, %s)')
    values=(DAY, CODE_TRANNING, TAGETS)
    print(query)
    mycursor.execute(query, values)
    mydb.commit()
    if i%100==0:
        print(i,' / ',len(datafull))
    i+=1
mydb.close()
print('finished process')
