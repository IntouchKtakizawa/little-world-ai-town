import {EARTH_COUNTRIES, EARTH_BY_ID} from './earth-data.js';
export const project = (lon,lat) => ({x:(lon+180)*2.5,y:25+(90-lat)*2.5});
export const unproject = (x,y) => ({lon:x/2.5-180,lat:90-(y-25)/2.5});
export function inRing(lon,lat,ring){let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>lat)!==(b[1]>lat)&&lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes}
export function contains(country,lon,lat){return country.polygons.some(poly=>inRing(lon,lat,poly[0])&&!poly.slice(1).some(hole=>inRing(lon,lat,hole)))}
export function countryAt(lon,lat){if(lat>90||lat< -90||lon>180||lon< -180)return null;return EARTH_COUNTRIES.find(c=>contains(c,lon,lat))||null}
export function countryClimate(c){const lat=Math.abs(c.lat);if(c.id==='ATA'||lat>66)return 'Polar';if((c.lat>15&&c.lat<35&&c.lon> -20&&c.lon<65)||['AUS','NAM','BWA'].includes(c.id))return 'Arid';if(['NPL','BTN','AFG','BOL','PER','CHE','KGZ','TJK'].includes(c.id))return 'Highland';if(lat<23.5)return 'Tropical';if(lat>50)return 'Boreal';return 'Temperate'}
export function specialty(c){const climate=countryClimate(c);if(climate==='Polar')return 'science';if(climate==='Arid')return 'energy';if(c.population>0&&c.gdp*1e6/c.population>35000)return 'science';if(climate==='Tropical')return 'food';if(['RUS','CAN','CHL','PER','AUS','ZAF','KAZ','MNG'].includes(c.id)||climate==='Highland')return 'metal';return 'food'}
export function realNeighbors(a,b){return !!EARTH_BY_ID[a.id]?.neighbors.includes(b.id)}
export function realCenter(tile){const c=EARTH_BY_ID[tile.id];return project(c?.lon??0,c?.lat??0)}
