import imaplib
import ssl
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date

sender_email = "cristialegend@gmail.com"
password = "abc_123456789"

mail = imaplib.IMAP4_SSL('imap.gmail.com')
mail.login(sender_email, password)
mail.list()
# Out: list of "folders" aka labels in gmail.
mail.select("inbox") # connect to inbox.
# result, data = mail.search(None, "ALL")
_,search_data = mail.search(None, "UNSEEN")


for num in search_data[0].split():
    # print(num)
    _,data= mail.fetch(num,'(RFC822)')
    _,b= data[0]
    email_messange =email.message_from_bytes(b)
    #print(email_messange)
    print(email_messange['from'])
    print(email_messange['date'])
    # print("-------------")
    # for header in ['subject','to','from','date']:
    #     print("{}: {}".format(header,email_messange[header]))
    for part in email_messange.walk():
        if part.get_content_type() == "text/plain" :
            body= part.get_payload(decode=True)
            print(body.decode())
# ids = search_data[0] # data is a list.
# id_list = ids.split() # ids is a space separated string
# latest_email_id = id_list[-1] # get the latest
 
# # # fetch the email body (RFC822) for the given ID
# _, data = mail.fetch(latest_email_id, "(RFC822)") 

datetime= "Thu, 9 Sep 2021 22:24:53 +0700"
print(datetime.strftime("%m/%d/%Y, %H:%M:%S"))
# print(data)
# raw_email = data[0][1] # here's the body, which is raw text of the whole email
# # including headers and alternate payloads