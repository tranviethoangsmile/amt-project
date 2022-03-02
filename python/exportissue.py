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

import sys
import datetime

engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)
cnxn=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

date1=sys.argv[1]+ " 00:00:00"
date2=sys.argv[2]+ " 23:59:59"

cursor = cnxn.cursor()
script = "SELECT idpart,namepart,ty_req,wo,qty_issue,time_req,time_issue,note,fm_staff FROM part_log  WHERE time_issue<='"+date2+"' AND time_issue>='"+date1+"' AND Status='Đã cấp' ORDER BY time_issue ASC;"
cursor.execute(script)

columns = [desc[0] for desc in cursor.description]
data = cursor.fetchall()
df = pd.DataFrame(list(data))
df = pd.DataFrame(list(data), columns=('ID','TÊN VẬT TƯU','LOẠI YÊU CẦU','MÃ CÔNG VIỆC','SỐ LƯỢNG PHÁT','THỜI GIAN YÊU CẦU','THỜI GIAN PHÁT','GHI CHÚ','NHÂN VIÊN NHẬN'), index=range(1,len(df)+1))
# print (df)

from datetime import datetime
now = datetime.now()
current_time =  now.strftime("%d_%m_%Y-%H_%M_%S")

writer = pd.ExcelWriter('C:\\CMMS\\public\\issue\\'+ 'DANHSACHCAPPHAT_' +sys.argv[1] +'-'+sys.argv[2] +'.xlsx', engine='xlsxwriter')
# df.to_excel(writer, sheet_name='MC_IN_U')
# workbook  = writer.book
# worksheet = writer.sheets['MC_IN_U']


# writer = pd.ExcelWriter('pandas_table9.xlsx', engine='xlsxwriter')

df.to_excel(writer, sheet_name='PART_LOG', startrow=3, header=True, index=True)

workbook = writer.book
worksheet = writer.sheets['PART_LOG']

(max_row, max_col) = df.shape
cell_format =workbook.add_format({'valign': 'center'})
worksheet.set_column('A:A', 5,cell_format)
worksheet.set_column('B:B', 25,cell_format)
worksheet.set_column('C:C', 40)
worksheet.set_column('D:D', 20,cell_format)
worksheet.set_column('E:E', 15,cell_format)
worksheet.set_column('F:F', 10,cell_format)
worksheet.set_column('G:H', 25,cell_format)
worksheet.set_column('L:L', 15,cell_format)
worksheet.set_column('O:O', 15,cell_format)
worksheet.set_column('J:J', 18,cell_format)
worksheet.set_column('K:K', 20,cell_format)
worksheet.set_column('N:N', 25,cell_format)
worksheet.set_column('E:E', 18,cell_format)
column_settings = [{'header': column} for column in df.columns]
# worksheet.autofilter(0, 0, max_row, max_col)
worksheet.add_table(3, 1, max_row, max_col - 1, {'columns': column_settings,'style':None})

title_format = workbook.add_format({'bold': True, 'italic': True})
title_format.set_font_size(15)
worksheet.write(0,3, 'DANHSACHCAPPHAT_' +sys.argv[1] +'-'+sys.argv[2],title_format)  # Cell is bold and italic.
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
print('.\public\\issue\\'+ 'DANHSACHCAPPHAT_' +sys.argv[1] +'-'+sys.argv[2] +'.xlsx')