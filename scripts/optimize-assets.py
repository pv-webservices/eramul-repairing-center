from pathlib import Path
from PIL import Image,ImageOps
root=Path('public'); dest=root/'images'
files={'ac':'Image-7.jpeg','compressor':'air-compressor.jpeg','washing':'Image-6.jpeg','inverter':'compressor-1.jpeg','electrical':'Image-3.jpeg','motor':'high-pressure-washing-motor.jpeg','lift':'2-stand-lift.jpeg','fridge':'commercial-freeze.jpeg','ice':'ice-cube-machine.jpeg','chiller':'chilled-plant.jpeg','vacuum':'vacuum-clearner.jpeg'}
for name,file in files.items():
 im=Image.open(root/file).convert('RGB'); im.thumbnail((570,400))
 canvas=Image.new('RGB',(640,480),'#f7f9fc');canvas.paste(im,((640-im.width)//2,(480-im.height)//2));canvas.save(dest/(name+'.webp'),quality=84)
for i in range(9,17):
 im=ImageOps.exif_transpose(Image.open(root/f'Image-{i}.jpeg'));im.thumbnail((1000,1100));im.save(dest/f'field-{i}.webp',quality=83)
generated=Path(r'C:\Users\hp\.codex\generated_images\01a14116-15be-76f3-b2b0-1b7849fa08fb')
for name,file in {'hero':'exec-ebea1056-314c-4c9c-aa0a-577121313a78.png','about':'exec-7aeb04f0-108b-41b2-b73d-aef39d8257f8.png','geyser':'exec-9625302d-3061-40e3-8146-39460eda039b.png'}.items():
 im=Image.open(generated/file).convert('RGB');im.thumbnail((1536,1024));im.save(dest/(name+'.webp'),quality=86)
 if name in ['hero','about']:
  im.thumbnail((800,600));im.save(dest/(name+'-small.webp'),quality=83)
logo=Image.open(root/'website logo.webp');logo.crop((0,0,180,240)).resize((64,64)).save(root/'favicon.png')
