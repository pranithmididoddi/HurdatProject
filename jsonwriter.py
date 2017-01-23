import csv
import json
from collections import OrderedDict

csvfile = open('stormData.txt', 'r')
jsonfile1 = open('file01.json', 'w')
jsonfile2 = open('file02.json', 'w')

recordCount = 0
def initLists():
     global header, date, time, ident, status, latLng, maxws, minpress, tfNE, tfSE, tfSW, tfNW, fNE, fSE, fSW, fNW, sfNE, sfSE, sfSW, sfNW
     header = []
     date = []
     time = []
     ident = []
     status = []
     latLng = []
     maxws = []
     minpress = []
     tfNE = []
     tfSE = []
     tfSW = []
     tfNW = []
     fNE = []
     fSE = []
     fSW = []
     fNW = []
     sfNE = []
     sfSE = []
     sfSW = []
     sfNW = []

def writeToFile(count):
     entries = OrderedDict([('id', header[0]),('name', header[1]),('date', date),('time', time),('identifier', ident),('status', status),
                                ('latLng', latLng),('maxWS', maxws),('minPress', minpress),('34NE', tfNE),
                                ('34SE', tfSE),('34SW', tfSW),('34NW', tfNW),('50NE', fNE),('50SE', fSE),('50SW', fSW),
                                ('50Nw', fNW),('64NE', sfNE),('64SE', sfSE),('64SW', sfSW),('64NW', sfNW)])
     if count < 950:     
          jsonfile1.write(json.dumps(entries, sort_keys = False, indent = 4))
          jsonfile1.write(',\n')
     else:
          jsonfile2.write(json.dumps(entries, sort_keys = False, indent = 4))
          jsonfile2.write(',\n')
     initLists()

def createLat(lat):
     numLat = lat[0:-1]
     decLat = float(numLat)
     if "S" in lat:
          convLat = decLat*-1
     else:
          convLat = decLat
     return convLat

def createLon(lon):
     numLon = lon[0:-1]
     decLon = float(numLon)
     if "W" in lon:
          convLon = decLon*-1
     else:
          convLon = decLon
     return convLon

# Main
initLists()

reader = csv.reader(csvfile)


for row in reader:
     if len(row) < 5:
          if recordCount > 0:
               writeToFile(recordCount)
          recordCount = recordCount + 1
          header.append(row[0])
          header.append(row[1].strip())
     else:
          date.append(row[0])
          time.append(row[1].strip())
          ident.append(row[2].strip())
          status.append(row[3].strip())
          latCoord  = createLat(row[4].strip())
          lonCoord = createLon(row[5].strip())
          coords = latCoord,lonCoord
          latLng.append(coords)
          maxws.append(float(row[6].strip()))
          minpress.append(float(row[7].strip()))
          tfNE.append(float(row[8].strip()))
          tfSE.append(float(row[9].strip()))
          tfSW.append(float(row[10].strip()))
          tfNW.append(float(row[11].strip()))
          fNE.append(float(row[12].strip()))
          fSE.append(float(row[13].strip()))
          fSW.append(float(row[14].strip()))
          fNW.append(float(row[15].strip()))
          sfNE.append(float(row[16].strip()))
          sfSE.append(float(row[17].strip()))
          sfSW.append(float(row[18].strip()))
          sfNW.append(float(row[19].strip()))

writeToFile(recordCount)

jsonfile1.close()
jsonfile2.close()
csvfile.close()     

