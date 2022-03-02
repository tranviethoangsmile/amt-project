
# import pandas as pd

# import mysql.connector

# from sqlalchemy import create_engine

# import xlsxwriter

# import datetime

# engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)
# cnxn=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

# cursor = cnxn.cursor()
# script = "SELECT * FROM spare_new ORDER BY Stt ASC;"
# cursor.execute(script)

# workbook = xlsxwriter.Workbook('Expenses010.xlsx')

# worksheet = workbook.add_worksheet()
# worksheet.autofilter('A1:V2000')

# wrap_format = workbook.add_format({'text_wrap': 1,'valign': 'center','bg_color': 'pink'})
# date_format = workbook.add_format({'num_format': 'd mmm yyyy','valign': 'center','border': 1})
# money_format= workbook.add_format({'num_format': '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)','border': 1})
# cell_format = workbook.add_format({'valign': 'center','border': 1})
# data_format1 = workbook.add_format({'bg_color': 'blue'})

# data = cursor.fetchall()
# row = 1
# col = 0

# worksheet.write(0,0,'Stt',wrap_format)
# worksheet.write(0,1,'Id',wrap_format)
# worksheet.write(0,2,'Tên vật tư',wrap_format)
# worksheet.write(0,3,'Ảnh',wrap_format)
# worksheet.write(0,4,'Vị trí',wrap_format)
# worksheet.write(0,5,'Đơn giá',wrap_format)
# worksheet.write(0,6,'M/C',wrap_format)
# worksheet.write(0,7,'Số bộ phận',wrap_format)
# worksheet.write(0,8,'Đơn vị tính',wrap_format)
# worksheet.write(0,9,'Số lượng nhận trong kỳ',wrap_format)
# worksheet.write(0,10,'Số lượng xuất trong kỳ',wrap_format)
# worksheet.write(0,11,'Số lượng hiện tại',wrap_format)
# worksheet.write(0,12,'Tồn tối thiểu',wrap_format)
# worksheet.write(0,13,'Tồn tối đa',wrap_format)
# worksheet.write(0,14,'Tần suất đặt hàng',wrap_format)
# worksheet.write(0,15,'USERUPDATE',wrap_format)
# worksheet.write(0,16,'TIMEUPDATE',wrap_format)
# worksheet.write(0,17,'Ghi chú',wrap_format)
# worksheet.write(0,18,'Số tồn đầu kỳ IC238',wrap_format)
# worksheet.write(0,19,'Số tồn cuối kỳ IC238',wrap_format)
# worksheet.write(0,20,'Số lượng chênh lệch',wrap_format)
# worksheet.write(0,21,'Số lượng đặt hàng cho chu kì tiếp theo',wrap_format)



# date_format = workbook.add_format({'num_format': 'd mmm yyyy'})
# for a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19 in (data):  
#     worksheet.write(row, col,     a1, cell_format)
#     worksheet.write(row, col + 1, a2, cell_format)
#     worksheet.write(row, col + 2, a3, cell_format)
#     worksheet.write(row, col + 3, a4, cell_format)
#     worksheet.write(row, col + 4, a5, cell_format)
#     worksheet.write(row, col + 5, a6, money_format)
#     worksheet.write(row, col + 6, a7, cell_format)
#     worksheet.write(row, col + 7, a8, cell_format)
#     worksheet.write(row, col + 8, a9, cell_format)
#     worksheet.write(row, col + 9, a10, cell_format)
#     worksheet.write(row, col + 10, a11, cell_format)
#     worksheet.write(row, col + 11, a12, cell_format)
#     worksheet.write(row, col + 12, a13, cell_format)
#     worksheet.write(row, col + 13, a14, cell_format)
#     worksheet.write(row, col + 14, a15, cell_format)
#     worksheet.write(row, col + 15, a16, cell_format)
#     worksheet.write(row, col + 16, a17, date_format)
#     worksheet.write(row, col + 17, '=IF(L<M,"ALERT","OK")', cell_format) 
#     worksheet.write(row, col + 18, '', cell_format) 
#     worksheet.write(row, col + 19, '', cell_format) 
#     worksheet.write(row, col + 20, '', cell_format) 
#     worksheet.write(row, col + 21,'', cell_format) 
#     row += 1
# worksheet.freeze_panes(1, 1)
# workbook.close()


import pandas as pd

import mysql.connector

from sqlalchemy import create_engine

import xlsxwriter

import datetime

from datetime import datetime

engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)
cnxn=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

cursor = cnxn.cursor()
script = "SELECT * FROM spare_new ORDER BY Stt ASC;"
cursor.execute(script)

now = datetime.now()
current_time =  now.strftime("%d_%m_%Y-%H_%M_%S")

workbook = xlsxwriter.Workbook('C:\\CMMS\\public\\spaex\\'+ 'DANHSACHVATTU_' +current_time +'.xlsx')
worksheet = workbook.add_worksheet('SPARE') 
data = cursor.fetchall()
row = 1
col = 0
cell_format = workbook.add_format({'valign': 'center'})
wrap_format     = workbook.add_format({'text_wrap': 1,'valign': 'center'})
date_format = workbook.add_format({'num_format': 'd mmm yyyy'})
num_format=workbook.add_format({'num_format': '#,##0.00'})
worksheet.set_column('Q:Q', 15)

money_format= workbook.add_format({'num_format': '#,##0','border': 1})
date_format = workbook.add_format({'num_format': 'd mmm yyyy'})
for a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19 in (data):  
    worksheet.write(row, col,     a1, cell_format)
    worksheet.write(row, col + 1, a2, cell_format)
    worksheet.write(row, col + 2, a3)
    worksheet.write(row, col + 3, a4)
    worksheet.write(row, col + 4, a5, cell_format)

    worksheet.write(row, col + 5, int(a6), money_format)
    worksheet.write(row, col + 6, a7, cell_format)
    worksheet.write(row, col + 7, a8, cell_format)
    worksheet.write(row, col + 8, a9, cell_format)
    worksheet.write(row, col + 9, a10, cell_format)
    worksheet.write(row, col + 10, a11, cell_format)
    worksheet.write(row, col + 11, a12, cell_format)
    worksheet.write(row, col + 12, a13, cell_format)
    worksheet.write(row, col + 13, a14, cell_format) 
    worksheet.write(row, col + 14, a15, cell_format)
    worksheet.write(row, col + 15, a16, cell_format)
    worksheet.write(row, col + 16, a17, date_format)
    worksheet.write(row, col + 17, a18, cell_format)
    row += 1

worksheet.add_table('A1:V2000', {
                              'columns': [{'header': 'Stt','header_format': wrap_format},
                                          {'header': 'Id','header_format': wrap_format},
                                          {'header': 'Tên vật tư','header_format': wrap_format},
                                          {'header': 'Ảnh','header_format': wrap_format},
                                          {'header': 'Vị trí','header_format': wrap_format},
                                          {'header': 'Ðơn giá','header_format': wrap_format},
                                          {'header': 'M/C','header_format': wrap_format},
                                          {'header': 'Số bộ phận','header_format': wrap_format},
                                          {'header': 'Ðơn vị tính','header_format': wrap_format},
                                          {'header': 'Số lượng nhận trong kì','header_format': wrap_format},
                                          {'header': 'Số lượng xuất trong kì','header_format': wrap_format},
                                          {'header': 'Số lượng hiện tại','header_format': wrap_format},
                                          {'header': 'Tồn tối thiểu','header_format': wrap_format},
                                          {'header': 'Tồn tối đa','header_format': wrap_format},                                
                                          {'header': 'Tần suất dặt hàng','header_format': wrap_format},
                                          {'header': 'USERUPDATE','header_format': wrap_format},
                                          {'header': 'TIMEUPDATE','header_format': wrap_format,'format': date_format},
                                          {'header': 'Số tồn đầu kì IC238','header_format': wrap_format},
                                          {'header': 'Ghi chú','header_format': wrap_format,'formula':'=IF([@[Số lượng hiện tại]]<[@[Tồn tối thiểu]],"ALERT","OK")'},
                                          {'header': 'Số tồn cuối kì IC238','header_format': wrap_format},                                                                                  
                                          {'header': 'Số lượng chênh lệch','header_format': wrap_format},
                                          {'header': 'Số lượng đặt hàng cho chu kì tiếp theo','header_format': wrap_format}
                                          ],'style': 'Table Style Light 11'})

worksheet.freeze_panes(1, 1)
workbook.close()
print('.\public\\spaex\\'+ 'DANHSACHVATTU_' +current_time +'.xlsx')
