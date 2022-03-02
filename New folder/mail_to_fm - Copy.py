import smtplib
import sys

import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

sender_email = "cristialegend@gmail.com"
password = "abc_123456789"

# receiver_email = sys.argv[2]
receiver_email = "nguyenphubinh999@gmail.com"

message = MIMEMultipart("alternative")
message["Subject"] = "YÊU CẦU SỮA CHỮA MỚI"+"  "+sys.argv[2]

html = """
<html>
  <body>
    <p>Chào Anh/Chị,<br>
    Hệ thống ERP ghi nhận một công việc yêu cầu sửa chữa vào lúc """ +str(sys.argv[1])+ """.<br>
    Mã yêu cầu """ +str(sys.argv[2])+ """ do (Anh/Chị) """ +str(sys.argv[3])+ """ yêu cầu tại """ +str(sys.argv[4])+ """.<br>
    Nội dung: """ +str(sys.argv[5])+ """.<br>
    Hạn hoàn thành công việc theo yêu cầu là """ +str(sys.argv[6])+ """.<br>
    Vào đường dẫn sau để xem chi tiết yêu cầu và giao việc.<br>
    http://pbv-pc0m3m1w/wo<br>
    CMMS.
  </body>
</html>
"""
message.attach(MIMEText(html, "html"))
 
connect = smtplib.SMTP_SSL("smtp.gmail.com", 465)
connect.login(sender_email, password)
connect.sendmail(sender_email, receiver_email,  message.as_string())

print("ok")