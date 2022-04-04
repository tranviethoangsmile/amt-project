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
    ID=str(datafull.iloc[i,0])
    NAME=str(datafull.iloc[i,1])
    query=('REPLACE INTO amt.technicians(ID, NAME)'
        + 'values (%s, %s)')
    values=(ID, NAME)
    print(query)
    mycursor.execute(query, values)
    mydb.commit()
mydb.close()
print('finished process')
