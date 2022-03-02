# Trước khi chạy ào đường link sau bật chế độ ít an toàn (cho mail gửi) https://myaccount.google.com/lesssecureapps
import smtplib
import sys

import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

sender_email = "cristialegend@gmail.com"
password = "tuiqebzjicolcxgw"


# receiver_email = sys.argv[2]
receiver_email = sys.argv[2]

noi_dung = "Chào ngày mới "

message = MIMEMultipart("alternative")
message["Subject"] = "YÊU CẦU SỮA CHỮA"+sys.argv[1]

# text="http://pbv-pc0m3m1w/SE/"+sys.argv[1]
html = """
<html>
  <body>
    <p>Hi,<br>
       Công việc bạn yêu cầu đã hoàn thành. Vui lòng đánh giá kết quả theo link sau <br>
      <a href=http://pbv-pc0m3m1w/SE/""" +str(sys.argv[1])+ """>Đánh giá</a> 
      
    </p>
  </body>
</html>
"""
# Add HTML/plain-text parts to MIMEMultipart message
# The email client will try to render the last part first
# part2 = MIMEText(text, "plain") 
# part1 = MIMEText(html, "html") 
# message.attach(part1)
# message.attach(part2)
 
message.attach(MIMEText(html, "html"))


# <a href="http://pbv-pc0m3m1w/SE/+sys.argv[1]">Đánh giá</a> 
connect = smtplib.SMTP_SSL("smtp.gmail.com", 465)
connect.login(sender_email, password)
connect.sendmail(sender_email, receiver_email,  message.as_string())
print("oke")