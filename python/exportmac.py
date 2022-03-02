# import pyodbc

# import pandas as pd

# import math

# import sys

# import os

# import time

# import pandas as pd

# import string

# import getpass

# import mysql.connector

# from datetime import datetime

# from sqlalchemy import create_engine

# import datetime

# import numpy as np

# engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)

# cnxn=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

# cursor = cnxn.cursor()
# script = "SELECT * FROM mc_in_u"
# cursor.execute(script)

# columns = [desc[0] for desc in cursor.description]
# data = cursor.fetchall()
# df = pd.DataFrame(list(data), columns=columns)

# from datetime import datetime
# now = datetime.now()
# current_time =  now.strftime("%d_%m_%Y-%H_%M_%S")

# writer = pd.ExcelWriter('C:\\ABC\\public\\mcex\\'+ 'DANHSACHMAY_' +current_time +'.xlsx')
# df.to_excel(writer, sheet_name='MC_IN_U')
# writer.save()
# print('.\public\\mcex\\'+ 'DANHSACHMAY_' +current_time +'.xlsx')
import pandas as pd

import mysql.connector

from sqlalchemy import create_engine

import datetime

engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)
cnxn=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

cursor = cnxn.cursor()
script = "SELECT * FROM mc_in_u ORDER BY mc_code ASC;"
cursor.execute(script)

columns = [desc[0] for desc in cursor.description]
data = cursor.fetchall()
df = pd.DataFrame(list(data))
df = pd.DataFrame(list(data), columns=('TÊN THIẾT BỊ','TÊN CŨ','LOẠI THIẾT BỊ','NHÀ MÁY','VỊ TRÍ','MODEL','SỐ SERI','TRẠNG THÁI','HỆ THỐNG','MÔ TẢ', 'THỜI GIAN BẮT ĐẦU','THỜI GIAN KẾT THÚC','THỜI GIAN CẬP NHẬT','NGƯỜI CẬP NHẬT','ẢNH'), index=range(1,len(df)+1))
# print (df)

from datetime import datetime
now = datetime.now()
current_time =  now.strftime("%d_%m_%Y-%H_%M_%S")

writer = pd.ExcelWriter('C:\\CMMS\\public\\mcex\\'+ 'DANHSACHMAY_' +current_time +'.xlsx', engine='xlsxwriter')
# df.to_excel(writer, sheet_name='MC_IN_U')
# workbook  = writer.book
# worksheet = writer.sheets['MC_IN_U']


# writer = pd.ExcelWriter('pandas_table9.xlsx', engine='xlsxwriter')

df.to_excel(writer, sheet_name='MC_IN_U', startrow=3, header=True, index=True)

workbook = writer.book
worksheet = writer.sheets['MC_IN_U']

(max_row, max_col) = df.shape
cell_format =workbook.add_format({'valign': 'center'})
worksheet.set_column('A:A', 18, None, {'hidden': True})
worksheet.set_column('B:B', 35)
worksheet.set_column('C:D', 18)
worksheet.set_column('E:E', 10)
worksheet.set_column('F:G', 25)
worksheet.set_column('H:H', 15,cell_format)
worksheet.set_column('L:L', 15,cell_format)
worksheet.set_column('O:O', 15,cell_format)
worksheet.set_column('J:J', 18, None, {'hidden': True})
worksheet.set_column('K:K', 20)
worksheet.set_column('N:N', 25)
worksheet.set_column('E:E', 18, None, {'hidden': True})
worksheet.set_column('I:I', 18, None, {'hidden': True})
worksheet.set_column('M:M', 18, None, {'hidden': True})
worksheet.set_column('P:P', 18, None, {'hidden': True})
column_settings = [{'header': column} for column in df.columns]
# worksheet.autofilter(0, 0, max_row, max_col)
worksheet.add_table(3, 1, max_row, max_col - 1, {'columns': column_settings,'style':None})

title_format = workbook.add_format({'bold': True, 'italic': True})
title_format.set_font_size(15)
worksheet.write(0,3, 'DANH SÁCH MÁY_'+current_time, title_format)  # Cell is bold and italic.
header_format = workbook.add_format({
    'bold': True,
    'text_wrap': True,
    'valign': 'center',
    'fg_color': '#D7E4BC',
    'border': 1})
# cell_format =workbook.add_format({
#     'valign': 'center'})
for col_num, value in enumerate(df.columns.values):
    worksheet.write(3, col_num + 1, value, header_format)
# for row_num, value in enumerate(df.ro.values):
#     worksheet.write(row_num +1,11 , value, cell_format)
#     worksheet.write(row_num +1,14 , value, cell_format)
#     worksheet.write(row_num +1,7 , value, cell_format)
writer.save()
print('.\public\\mcex\\'+ 'DANHSACHMAY_' +current_time +'.xlsx')