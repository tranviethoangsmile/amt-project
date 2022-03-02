import sys
import os
import comtypes.client




wdFormatPDF = 17

in_file = os.path.abspath("C:\\CMMS\\public\\doc_ecf\\"+sys.argv[1]+".doc")
out_file = os.path.abspath("C:\\CMMS\\public\\doc_ecf\\"+sys.argv[1]+".pdf")

word = comtypes.client.CreateObject('Word.Application')
doc = word.Documents.Open(in_file)
doc.SaveAs(out_file, FileFormat=wdFormatPDF)
doc.Close()
word.Quit()
# finish convert from word to pdf
from pdf2image import convert_from_path
images = convert_from_path('C:\\CMMS\\public\\doc_ecf\\'+sys.argv[1]+'.pdf',300,poppler_path ='C:\\CMMS\\python\\ecf\\poppler-21.11.0\\Library\\bin')
images[0].save('C:\\CMMS\\public\\img_ecf\\ECF-'+sys.argv[1]+'.jpg', 'JPEG')
# print("img have been created")
# Importing Image class from PIL module
from PIL import Image
# Opens a image in RGB mode
im = Image.open('C:\\CMMS\\public\\img_ecf\\ECF-'+sys.argv[1]+'.jpg')
 
# Size of the image in pixels (size of original image)
# (This is not mandatory)
width, height = im.size
 
# Setting the points for cropped image
left = 0
top = 80
right = width
bottom = 3 * height / 4
 
# Cropped image of above dimension
# (It will not change original image)
im1 = im.crop((left, top, right, bottom))
 
# Shows the image in image viewer
im1.save('C:\\CMMS\\public\\img_ecf\\ECF-'+sys.argv[1]+'.jpg')
print('finish')

