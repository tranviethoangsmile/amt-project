import sys, json
import os
import string
import pandas as pd
from sqlalchemy import create_engine
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
print(pathFile)
datafull=pd.read_excel(pathFile)
datafull=datafull.fillna("")
print('Mechani_HeadCount: ',len(datafull))

print(datafull)
# Begin Update
for i in range(0,len(datafull)):
    DAY=str(datafull.iloc[i,0])
    CODE_TRAINING=str(datafull.iloc[i,1]) 
    TAGETS=str(datafull.iloc[i,2])
    print(DAY)  
    query=('REPLACE INTO amt.tagets_training_tracking(DAY, CODE_TRAINING, TAGETS)'
        + 'values (%s, %s, %s)')
    values=(DAY, CODE_TRAINING, TAGETS)
    print(query)
    mycursor.execute(query, values)
    mydb.commit()
    if i%100==0:
        print(i,' / ',len(datafull))
    i+=1
mydb.close()
print('finished process')
