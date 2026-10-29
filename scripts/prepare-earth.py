"""Reduce public Natural Earth datasets to the fields used by the game.
Sources are documented in data/SOURCES.md. Inputs are downloaded, never executed.
"""
import json, colorsys, itertools
from collections import defaultdict
from pathlib import Path
countries=json.loads(Path('/tmp/earth-countries.geojson').read_text())['features']
cities=json.loads(Path('/tmp/earth-cities.geojson').read_text())['features']
vertices=defaultdict(set)
records=[]
for index, feature in enumerate(countries):
 p=feature['properties']; identifier=p['ADM0_A3']; polygons=feature['geometry']['coordinates']
 if feature['geometry']['type']=='Polygon': polygons=[polygons]
 geometry=[[[[round(x,4),round(y,4)] for x,y,*_ in ring] for ring in poly] for poly in polygons]
 for poly in geometry:
  for x,y in poly[0]:vertices[(round(x,3),round(y,3))].add(identifier)
 urban=[]
 for c in cities:
  cp=c['properties']
  if cp['adm0_a3']==identifier:
   urban.append({'name':cp['name'],'lon':round(cp['longitude'],4),'lat':round(cp['latitude'],4),'capital':bool(cp['adm0cap']),'population':cp['pop_max']})
 urban.sort(key=lambda c:(not c['capital'],-c['population']))
 rgb=colorsys.hsv_to_rgb((index*.61803398875)%1,.33,.72)
 color='#'+''.join(f'{round(v*255):02x}' for v in rgb)
 records.append({'id':identifier,'name':p['NAME_EN'] or p['ADMIN'],'short':p['NAME'].upper(),'iso2':p['ISO_A2_EH'],'continent':p['CONTINENT'],'region':p['SUBREGION'],'lon':p['LABEL_X'],'lat':p['LABEL_Y'],'population':round(p['POP_EST']),'populationYear':p['POP_YEAR'],'gdp':p['GDP_MD'],'gdpYear':p['GDP_YEAR'],'color':color,'dark':color,'cities':urban[:5],'polygons':geometry,'neighbors':[]})
counts=defaultdict(int)
for members in vertices.values():
 for a,b in itertools.combinations(sorted(members),2): counts[(a,b)]+=1
by_id={c['id']:c for c in records}
for (a,b),n in counts.items():
 if n>=2:by_id[a]['neighbors'].append(b);by_id[b]['neighbors'].append(a)
records.sort(key=lambda c:c['name'])
Path('earth-data.js').write_text('// Generalized Natural Earth 1:50m geography. Public domain. See data/SOURCES.md.\nexport const EARTH_COUNTRIES = '+json.dumps(records,ensure_ascii=False,separators=(',',':'))+';\nexport const EARTH_NATIONS = EARTH_COUNTRIES.filter(c=>c.id!=="ATA");\nexport const EARTH_BY_ID = Object.fromEntries(EARTH_COUNTRIES.map(c=>[c.id,c]));\n')
print('Countries and regions:',len(records),'city markers:',sum(len(c['cities']) for c in records),'land borders:',sum(len(c['neighbors']) for c in records)//2)
print('Thailand:',{k:v for k,v in by_id['THA'].items() if k!='polygons'})
