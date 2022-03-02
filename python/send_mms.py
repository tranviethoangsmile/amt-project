import smtplib
import sys

import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import openpyxl

import sys

import pprint

import pandas as pd

import mysql.connector

from sqlalchemy import create_engine

import datetime

sender_email = "cristialegend@gmail.com"
password = "tuiqebzjicolcxgw"

receiver_email = "ngoi.mai1@hanes.com,nhatthatkim.ton@hanes.com"

# receiver_email = sys.argv[8]

engine_hbi = create_engine('mysql+mysqlconnector://intern:intern21@pbvweb01v:3306/fm', echo=False)

mydb=mysql.connector.connect(host="pbvweb01v", user='intern', passwd='intern21', database="fm")

myCursor=mydb.cursor()

agv=sys.argv[1]

result=pd.read_sql("SELECT * FROM work_order WHERE id='"+agv+"';",engine_hbi)

message = MIMEMultipart("alternative")
message["Subject"] = "YÊU CẦU SỮA CHỮA MỚI ""  "+sys.argv[1]
html = '<!DOCTYPE html>'
html += """
  <html>
    <body>
      <style>
        tablea {boder: solid 1px blue;}
      </style>
      <p>Chào Anh/Chị,<br>
      Hệ thống CMMS ghi nhận một công việc do """ +str(sys.argv[5])+ """ giao cho bạn lúc """ +str(sys.argv[3])+ """ .<br>
      Mã công việc  do (Anh/Chị) """ +str(sys.argv[1])+ """ yêu cầu tại """ +str(sys.argv[6])+ """, mức độ ưu tiên """ +str(sys.argv[7])+ """.<br>
      CMMS.<br>   
      <table style="margin-left: auto; margin-right: auto;" class="tablea">
      <thead>
        <tr><th style="border: 1px solid   blue;width: 50%;" colspan="2">PHIẾU YÊU CẦU CÔNG VIỆC """ +str(sys.argv[1])+ """</th><th style="border: 1px solid   blue;width: 50%;"colspan="2">REV : """ +result.iloc[0,14]+":"+result.iloc[0,14]+ """</th></tr>
        <tr><td style="border: 1px solid   blue;" colspan="2" colspan="2">Bộ phận yêu cầu: """ +str(result.iloc[0,1])+ """</td><td style="border: 1px solid   blue;"colspan="2">Ngày yêu cầu: """ +str(sys.argv[3])+ """</td></tr>
        <tr><td style="border: 1px solid   blue;" colspan="2" colspan="2">Người yêu cầu: """ +str(result.iloc[0,2])+ """</td><td style="border: 1px solid   blue;" colspan="2">Người nhận: """ +str(sys.argv[9])+ """</td></tr>
        <tr><td style="border-top: 1px solid   blue;border-left: 1px solid   blue;border-right: 1px solid   blue;" colspan="2">Nội dung:</td><td style="border-top: 1px solid   blue;border-left: 1px solid   blue;border-right: 1px solid   blue;" colspan="2">Giải pháp:</td></tr>
        <tr>
          <td style="border-bottom: 1px solid   blue;border-left: 1px solid   blue;border-right: 1px solid   blue;" colspan="2">""" +str(result.iloc[0,15])+ """</td>
          <td  style="border-bottom: 1px solid   blue;border-left: 1px solid   blue;border-right: 1px solid   blue;" colspan="2">""" +str(result.iloc[0,19])+ """</td>
        </tr>
        <tr><td style="border: 1px solid  blue;" colspan="4">Vật tư cần thay thế: </td></tr>
 """

sql_up1="SELECT * FROM part_log WHERE wo='"+agv+"';"
myCursor.execute(sql_up1)
result1= myCursor.fetchall()
html += """
        <tr><td style="border: 1px solid   blue;width: 10px;">STT</td><td style="border: 1px solid   blue;">Tên vật tư</td><td style="border: 1px solid   blue;">Số lượng</td><td style="border: 1px solid   blue;">Ghi chú</td></tr>"""
stt=0
for y in result1:
  stt= stt +1
  html+="""<tr><td style="border: 1px solid   blue; ">""" +str(stt)+ """</td><td style="border: 1px solid   blue;">""" +str(y[1])+ """</td><td style="border: 1px solid   blue;">""" +str(y[5])+ """</td><td style="border: 1px solid   blue;">""" +str(y[11])+ """</td></tr>
       """
html += """
      </thead> 
      </table>
    </body>
  </html>
"""

message.attach(MIMEText(html, "html"))

connect = smtplib.SMTP_SSL("smtp.gmail.com", 465)
connect.login(sender_email, password)
connect.sendmail(sender_email, receiver_email,  message.as_string())

print("ok")