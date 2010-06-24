import os,sys

def dec2hex(n):
    return "%X" % n

def hex2dec(s):
    """return the integer value of a hexadecimal string s"""
    return int(s, 16)

stg = "fairyjewels.stg"

f = open( stg, "rb" )
pos = 1067
for i in range( 750 ):
  f.seek( pos )
  d = f.read( 20 )
  bytes = []
  for j in range( 3 ):
    f.seek( pos-j-2 )
    byte = f.read( 1 )
    #bytes.append( ord( byte ) )
    bytes.append( dec2hex( ord( byte ) ) )
  pos += 48
  if d.find( "loser" )>0:
    print ".", d, hex2dec( "".join( bytes ) )
print "done"
exit()

pngsta = [hex2dec('89'), hex2dec('50'), hex2dec('4e'), hex2dec('47'), hex2dec('0d'), hex2dec('0a'), hex2dec('1a'), hex2dec('0a')]
pngend = [hex2dec('49'), hex2dec('45'), hex2dec('4e'), hex2dec('44')] #, ae, 42, 60, 82]


pngfn = "test-"
d = None
#ispng = False
pngi = 0
starti = 0
endi = 0
#pngstarts = []
#pngends = []
pngs = []
png = {}
tmpstr = ""
while d!="":
 f.seek( pngi )
 d = f.read( 1 )
 if len(d)>0 and d!="":
  pngi += 1
  if pngsta[starti]==ord( d ):
    starti += 1
    tmpstr += d
    #if starti>3:
    #  print " pngstart hint: %d", ord( d ), d, pngi
    if starti==8:
      #pngstarts.append( pngi )
      png = { "start": pngi-starti }
      print " pngstart FOUND:", pngi
      starti = 0
      tmpstr = ""
  else:
    starti = 0
  if pngend[endi]==ord( d ):
    endi += 1
    #print " pngstart hint: %d", ord( d )
    if endi==4:
      #pngends.append( pngi )
      png["end"] = pngi
      png["id"] = len( pngs )
      pngs.append( png )
      print " png added:", png["start"], png["end"], int(png["end"]-png["start"]), len( pngs )
      if len( pngs )==135:
        exit()
      endi = 0
  else:
    endi = 0
 #if len( pngs )>10:
 # break

#print pngs
for png in pngs:
  if "start" not in png:
    print "skip png (no starti)"
  fn = pngfn + str(png["id"]) + ".png"
  size = png["end"]-png["start"]+4
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

exit()

pos = 38108  #94dc
size = 9100
pos = 62636  #f4a8 + 5
size = 9100
pos = 61252  #ef38 + 12
size = 1377+4
f.seek( pos )
fw = open( png, "w" )
d = None
s = 0
while s<size:
  d = f.read( 1 )
  s += len(d)
  fw.write( d )
fw.close()
f.close()

# pos:49DBC8 size:ecd4 loser.png (test-135.png)
# hexdump -s 1051 -n 37000 -C fairyjewels.stg | grep -B 1 -A 1 'loser'
#0000641b  00 13 00 49 23 64 51 00  d8 ec 00 00 c8 db 49 00  |...I#dQ.......I.|
#0000642b  69 6e 67 61 6d 65 5f 6c  6f 73 65 72 2e 64 65 2e  |ingame_loser.de.|
#0000643b  70 6e 67 00 00 00 00 00  00 00 00 00 00 00 00 00  |png.............|
#--
#00006f2b  00 13 00 57 28 67 51 00  3b 00 00 00 a0 c8 4a 00  |...W(gQ.;.....J.|
#00006f3b  69 6e 67 61 6d 65 5f 6c  6f 73 65 72 2e 64 65 2e  |ingame_loser.de.|
#00006f4b  73 65 71 00 00 00 00 00  00 00 00 00 00 00 00 00  |seq.............|
#--
#000082ab  00 10 00 66 76 4d 45 00  bd fa 00 00 dc c8 4a 00  |...fvME.......J.|
#000082bb  69 6e 67 61 6d 65 5f 6c  6f 73 65 72 2e 70 6e 67  |ingame_loser.png|
#000082cb  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|

