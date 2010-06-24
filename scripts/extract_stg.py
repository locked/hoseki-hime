import os,sys

def sans_null(string):
    tmp=""
    for i in string.split('\0'):
        tmp=tmp+i
    return tmp

def dec2hex(n):
    return "%X" % n

def hex2dec(s):
    """return the integer value of a hexadecimal string s"""
    return int(s, 16)

stg = "fairyjewels.stg"

f = open( stg, "rb" )
pos = 1067
finfos = []
for i in range( 750 ):
  f.seek( pos )
  fn = str( sans_null( f.read( 32 ) ) )
  bytes = []
  for j in range( 3 ):
    f.seek( pos-j-2 )
    byte = f.read( 1 )
    bytes.append( dec2hex( ord( byte ) ) )
  dec = hex2dec( "".join( bytes ) )
  bytes = []
  for j in range( 3 ):
    f.seek( pos-j-7 )
    byte = f.read( 1 )
    if fn.find( "loser" )>0:
      print dec2hex( ord( byte ) ),
    bytes.append( dec2hex( ord( byte ) ) )
  size = hex2dec( "".join( bytes ) )
  finfo = { "start": dec, "end": dec+size, "size": size }
  finfo['name'] = fn.strip()
  finfos.append( finfo )
  pos += 48
  #print ".", fn, dec, size
print "done"
#exit()

#print pngs
skip = True
for png in finfos:
 if "start" not in png:
  print "skip file (no start offset)"
 fn = png['name']
 if fn!="":
  if fn.endswith("xplosionbig.ogg"):
    skip = False
  if skip:
    continue
  #size = png["end"]-png["start"]+4
  size = png['size']
  print "new png [%s] start:%d end:%d size:%d" % (fn, png["start"], png["end"], size)
  f.seek( png["start"] )
  fold = ""
  if fn.endswith("ogg"):
    fold = "sounds/"
  if fn.endswith("png"):
    fold = "images/"
  if fn.endswith("lvl"):
    fold = "levels/"
  fw = open( "extract/" + fold + fn, "w" )
  s = 0
  while s<size:
    d = f.read( 1 )
    fw.write( d )
    s += 1 #len(d)
    #print "(%d/%d)" % (s, size)
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

