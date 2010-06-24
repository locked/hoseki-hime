import os,sys

stg = "fairyjewels.stg"

f = open( stg, "rb" )
pos = 1067
for i in range( 50 ):
  f.seek( pos )
  d = f.read( 20 )
  pos += 48
  print ".", d
print "done"

def hex2dec(s):
    """return the integer value of a hexadecimal string s"""
    return int(s, 16)

# 4f 67 67 53 00
oggsta = [hex2dec('4f'), hex2dec('67'), hex2dec('67'), hex2dec('53'), hex2dec('00')]


pngfn = "sound-"
d = None
pngi = 0
starti = 0
pngs = []
png = None
tmpstr = ""
while d!="":
 f.seek( pngi )
 d = f.read( 1 )
 if len(d)>0 and d!="":
  pngi += 1
  if oggsta[starti]==ord( d ):
    starti += 1
    tmpstr += d
    #if starti>3:
    #  print " pngstart hint: %d", ord( d ), d, pngi
    if starti==len(oggsta):
      if png is not None:
        # End the current if any
        png["end"] = pngi-starti-1
        png["id"] = len( pngs )
        pngs.append( png )
        print " file added:", png["start"], png["end"], int(png["end"]-png["start"]), len( pngs )
      png = { "start": pngi-starti }
      print " filestart FOUND:", pngi
      starti = 0
      tmpstr = ""
  else:
    starti = 0
 #if len( pngs )>10:
 # break

#print pngs
for png in pngs:
  if "start" not in png:
    print "skip file (no starti)"
  fn = pngfn + str(png["id"]) + ".ogg"
  size = png["end"]-png["start"] #+4
  print "new png:", fn, png["start"], png["end"], size
  f.seek( png["start"] )
  fw = open( "extract/" + fn, "w" )
  s = 0
  while s<size:
    d = f.read( 1 )
    fw.write( d )
    s += len(d)
  fw.close()
f.close()

