import {EARTH_COUNTRIES,EARTH_BY_ID} from './earth-data.js';
import {project,unproject,countryAt} from './earth-geography.js';

export function createEarthRenderer(){
 const paths=new Map(),bounds=new Map();
 for(const c of EARTH_COUNTRIES){const path=new Path2D();for(const polygon of c.polygons)for(const ring of polygon){ring.forEach(([lon,lat],i)=>{const p=project(lon,lat);i?path.lineTo(p.x,p.y):path.moveTo(p.x,p.y)});path.closePath()}paths.set(c.id,path);const points=c.polygons.flatMap(poly=>poly[0].map(([lon,lat])=>project(lon,lat)));bounds.set(c.id,{minX:Math.min(...points.map(p=>p.x)),maxX:Math.max(...points.map(p=>p.x)),minY:Math.min(...points.map(p=>p.y)),maxY:Math.max(...points.map(p=>p.y))})}
 const texture=new Image();texture.src='data/earth-blue-marble.jpg';
 let layer='satellite',zoom=1,panX=0,panY=0,night=false;
 const bounded=()=>{panX=Math.max(-900*(zoom-1),Math.min(0,panX));panY=Math.max(-500*(zoom-1),Math.min(0,panY))};
 function screenToMap(x,y){return{x:(x-panX)/zoom,y:(y-panY)/zoom}}
 function setZoom(factor,x=450,y=250){const point=screenToMap(x,y);zoom=Math.max(1,Math.min(8,zoom*factor));panX=x-point.x*zoom;panY=y-point.y*zoom;bounded()}
 function focus(id){const c=EARTH_BY_ID[id];if(!c)return;const polys=c.polygons.map(poly=>poly[0]);const area=ring=>Math.abs(ring.reduce((sum,a,i)=>{const b=ring[(i+1)%ring.length];return sum+a[0]*b[1]-b[0]*a[1]},0));const ring=polys.slice().sort((a,b)=>area(b)-area(a))[0];const points=ring.map(([lon,lat])=>project(lon,lat)),xs=points.map(p=>p.x),ys=points.map(p=>p.y);const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);zoom=Math.min(8,Math.max(1,Math.min(720/(maxX-minX),360/(maxY-minY))));panX=450-(minX+maxX)/2*zoom;panY=250-(minY+maxY)/2*zoom;bounded()}
 const surface=document.createElement('canvas');surface.width=1800;surface.height=1000;const surfaceContext=surface.getContext('2d');let cachedKey='';
 function drawBackground(ctx,state){ctx.fillStyle='#071e31';ctx.fillRect(0,0,900,500);ctx.imageSmoothingEnabled=true;
  if(texture.complete&&texture.naturalWidth){ctx.drawImage(texture,0,25,900,450);ctx.fillStyle=layer==='satellite'?'#08223429':'#08223466';ctx.fillRect(0,25,900,450)}else{ctx.fillStyle='#153d50';ctx.fillRect(0,25,900,450)}
  ctx.strokeStyle='#d2e6e31a';ctx.lineWidth=.4/zoom;for(let lon=-150;lon<=180;lon+=30){const p=project(lon,0);ctx.beginPath();ctx.moveTo(p.x,25);ctx.lineTo(p.x,475);ctx.stroke()}for(let lat=-60;lat<=60;lat+=30){const p=project(0,lat);ctx.beginPath();ctx.moveTo(0,p.y);ctx.lineTo(900,p.y);ctx.stroke()}
  for(const tile of state.tiles){const c=EARTH_BY_ID[tile.id],path=paths.get(tile.id);if(!c||!path)continue;const owner=EARTH_BY_ID[tile.owner];ctx.globalAlpha=1;
   if(layer==='political'){ctx.fillStyle=owner?.color||'#dae4e2';ctx.globalAlpha=tile.owner===state.player ? .7 : .55;ctx.fill(path,'evenodd')}
   else if(layer==='population'){const level=Math.min(1,Math.log10(Math.max(1,tile.population))/10);ctx.fillStyle=`hsl(${48-level*44} 65% ${72-level*38}%)`;ctx.globalAlpha=.75;ctx.fill(path,'evenodd')}
   else if(layer==='resources'&&!tile.protected){ctx.fillStyle={food:'#91b869',metal:'#c49d7c',energy:'#d6be69',science:'#83b7cb'}[tile.resource];ctx.globalAlpha=.7;ctx.fill(path,'evenodd')}
   else if(tile.owner===state.player){ctx.globalAlpha=.32;ctx.fillStyle='#d5eeb1';ctx.fill(path,'evenodd')}
   ctx.globalAlpha=1;ctx.lineWidth=(tile.owner===state.player?1.2:.45)/zoom;ctx.strokeStyle=tile.owner===state.player?'#dfefb7':'#e4e6cd88';ctx.stroke(path);
  }
 }
 function draw(ctx,t,state,selected,minutes=720){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.fillStyle='#071e31';ctx.fillRect(0,0,900,500);ctx.save();ctx.translate(panX,panY);ctx.scale(zoom,zoom);
  const key=layer+'|'+texture.complete+'|'+state.player+'|'+state.tiles.map(tile=>tile.owner+':'+tile.city+':'+tile.population).join(',');
  if(key!==cachedKey){surfaceContext.setTransform(2,0,0,2,0,0);surfaceContext.clearRect(0,0,900,500);drawBackground(surfaceContext,state);cachedKey=key}
  ctx.drawImage(surface,0,0,900,500);
  const byId=Object.fromEntries(state.tiles.map(tile=>[tile.id,tile]));
  if(zoom>1.3){const topLeft=screenToMap(0,0),bottomRight=screenToMap(900,500);ctx.lineWidth=.65/zoom;ctx.strokeStyle='#e4e6cd99';for(const c of EARTH_COUNTRIES){const b=bounds.get(c.id);if(b.maxX<topLeft.x||b.minX>bottomRight.x||b.maxY<topLeft.y||b.minY>bottomRight.y)continue;ctx.stroke(paths.get(c.id))}}
  if(night){const hour=(minutes%1440)/60,sunLon=180-hour*15,declination=-12*Math.PI/180;for(let x=0;x<900;x+=12)for(let y=25;y<475;y+=12){const pos=unproject(x+6,y+6),lat=pos.lat*Math.PI/180,lon=(pos.lon-sunLon)*Math.PI/180,dot=Math.sin(lat)*Math.sin(declination)+Math.cos(lat)*Math.cos(declination)*Math.cos(lon);if(dot<.1){ctx.fillStyle=`rgba(3,12,29,${Math.min(.65,Math.max(0,(.1-dot)*1.2))})`;ctx.fillRect(x,y,12,12)}}}
  // Labels use actual geographic locations. At higher zoom, show more cities.
  ctx.textAlign='center';const important=new Set(['USA','CAN','BRA','RUS','CHN','IND','AUS','ZAF','EGY','IDN','FRA','DEU','GBR','JPN','MEX','ARG','THA']);
  for(const c of EARTH_COUNTRIES){const tile=byId[c.id];if(!tile)continue;const p=project(c.lon,c.lat);if((important.has(c.id)&&zoom<2)||c.id===selected||c.id===state.player||(zoom>=2&&c.population>5e6)){
    ctx.font=`${c.id===selected?'600 ':''}${(c.id===selected?10:8)/zoom}px sans-serif`;ctx.fillStyle=c.id===selected?'#f6e9ae':'#f0ead4';ctx.shadowColor='#031623';ctx.shadowBlur=4/zoom;ctx.fillText(c.short,p.x,p.y-5/zoom);ctx.shadowBlur=0;
   }
   for(const city of tile.hubs||[]){if(c.id!==selected&&zoom<2.2&&!city.capital)continue;if(c.id!==selected&&zoom<1.5&&!important.has(c.id))continue;const point=project(city.lon,city.lat);ctx.fillStyle=city.capital?'#f2d995':'#dbe9cf';ctx.beginPath();ctx.arc(point.x,point.y,(city.capital?2.1:1.3)/zoom,0,7);ctx.fill();if((c.id===selected&&(city.capital||zoom>2.8))||zoom>2.8){ctx.font=`${10/zoom}px sans-serif`;ctx.fillStyle='#f4e8c8';ctx.shadowColor='#061627';ctx.shadowBlur=3/zoom;ctx.fillText(city.name,point.x,point.y+10/zoom);ctx.shadowBlur=0}}
  }
  const capital=id=>{const country=EARTH_BY_ID[id];const city=country?.cities.find(c=>c.capital)||country?.cities[0];return city?project(city.lon,city.lat):country?project(country.lon,country.lat):null};
  for(const trade of state.trades){const a=capital(state.player),b=capital(trade.partner);if(!a||!b)continue;const bend=Math.min(75,Math.abs(a.x-b.x)*.12+15);ctx.strokeStyle=trade.status.startsWith('Paused')?'#cba77c88':'#d6e5a5cc';ctx.lineWidth=1.3/zoom;ctx.setLineDash([4/zoom,4/zoom]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2-bend,b.x,b.y);ctx.stroke();ctx.setLineDash([]);const u=(state.elapsed*.045+trade.id*.1)%1;const x=(1-u)*(1-u)*a.x+2*(1-u)*u*(a.x+b.x)/2+u*u*b.x,y=(1-u)*(1-u)*a.y+2*(1-u)*u*((a.y+b.y)/2-bend)+u*u*b.y;ctx.fillStyle='#f5dba1';ctx.beginPath();ctx.arc(x,y,2.5/zoom,0,7);ctx.fill()}
  for(const battle of state.battles){const a=capital(battle.source),b=capital(battle.target);if(!a||!b)continue;ctx.strokeStyle=battle.attacker===state.player?'#f5b66e':'#f08e7f';ctx.lineWidth=2/zoom;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.beginPath();ctx.arc(b.x,b.y,(8+Math.sin(t*.008)*2)/zoom,0,7);ctx.stroke()}
  const path=paths.get(selected);if(path){ctx.strokeStyle='#f7e9af';ctx.lineWidth=2/zoom;ctx.shadowColor='#d3da7d';ctx.shadowBlur=8/zoom;ctx.stroke(path);ctx.shadowBlur=0}
  ctx.restore();
  // A screen-space frame keeps navigation and source information readable at any zoom.
  ctx.fillStyle='#081e30e8';ctx.fillRect(0,0,900,25);ctx.fillRect(0,475,900,25);ctx.font='8px sans-serif';ctx.textAlign='left';ctx.fillStyle='#b7cdca';ctx.fillText('EARTH  /  '+layer.toUpperCase()+'  /  '+zoom.toFixed(1)+'×',16,16);ctx.textAlign='right';ctx.fillStyle='#8aa8ae';ctx.fillText('Drag to pan · scroll or + / − to zoom',883,16);ctx.textAlign='left';ctx.fillStyle='#afc6c1';ctx.fillText(layer==='population'?'Historical population estimates · game growth is simulated':layer==='resources'?'Resource specializations are game estimates':'Real geography · simulated countries begin at peace',16,491);ctx.textAlign='right';ctx.fillStyle='#92aeb3';ctx.fillText('NASA Blue Marble · Natural Earth',883,491)
 }
 return {draw,pickCity(x,y,state,selected){let best=null,distance=9;for(const tile of state.tiles){for(const city of tile.hubs||[]){if(tile.id!==selected&&zoom<2.2&&!city.capital)continue;if(tile.id!==selected&&zoom<1.5)continue;const p=project(city.lon,city.lat),d=Math.hypot(p.x*zoom+panX-x,p.y*zoom+panY-y);if(d<distance){distance=d;best={tile,city}}}}return best},pick(x,y){const p=screenToMap(x,y),geo=unproject(p.x,p.y);return countryAt(geo.lon,geo.lat)},setLayer(value){if(['satellite','political','population','resources'].includes(value))layer=value},get layer(){return layer},setZoom,focus,reset(){zoom=1;panX=0;panY=0},pan(dx,dy){panX+=dx;panY+=dy;bounded()},toggleNight(value){night=value},get zoom(){return zoom}};
}
