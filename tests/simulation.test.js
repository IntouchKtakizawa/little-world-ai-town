import test from 'node:test';
import assert from 'node:assert/strict';
import { affectResident, nearestResidents, validateSnapshot, escapeHTML, advanceResident } from '../simulation.js';

const resident = () => ({id:0,name:'Test resident',role:'The tester',bio:'A curious neighbor.',thought:'A new day.',action:'Walking',color:'#abcdef',hair:'#333333',skin:'#aa8866',bg:'#334455',health:90,energy:75,hunger:50,social:60,x:100,y:100,target:'cafe',path:[{x:150,y:250}],traits:['Curious'],memories:[{text:'Woke up.',time:'09:00'}],relations:{}});
test('lightning damage and healing stay within valid health and need limits',()=>{
  const p=resident();affectResident(p,{health:-125,energy:-100});assert.equal(p.health,0);assert.equal(p.energy,0);
  affectResident(p,{health:100,energy:100,hunger:100,social:100});assert.deepEqual([p.health,p.energy,p.hunger,p.social],[100,100,100,100]);
});
test('an area power affects only residents inside its radius, including its boundary',()=>{
  const nearby=resident(),edge={...resident(),id:1,x:175},far={...resident(),id:2,x:176};
  assert.deepEqual(nearestResidents([nearby,edge,far],100,100,75).map(p=>p.id),[0,1]);
});
test('a saved world survives serialization with its residents, memories, and relationships',()=>{
  const p=resident(),friend={...resident(),id:1,name:'Friend',relations:{0:35}};p.relations[1]=35;
  const world=JSON.parse(JSON.stringify({version:2,minutes:1840,people:[p,friend],god:{weather:'snow'}}));
  assert.equal(validateSnapshot(world),true);assert.equal(world.people[0].memories[0].text,'Woke up.');assert.equal(world.people[1].relations[0],35);
});
test('corrupt saves and out-of-map residents are rejected',()=>{
  for(const mutation of [p=>p.health=Infinity,p=>p.x=-1,p=>p.target='missing',p=>p.id=8,p=>p.path=[{x:'oops',y:0}],p=>p.relations={99:20}]){
    const p=resident();mutation(p);assert.equal(validateSnapshot({version:2,minutes:500,people:[p]}),false);
  }
  assert.equal(validateSnapshot({version:1,minutes:0,people:[resident()]}),false);
  assert.equal(validateSnapshot({version:2,minutes:0,people:[]}),false);
});
test('resident names and biographies display as text rather than executable markup',()=>{
  assert.equal(escapeHTML('<img src=x onerror="bad()">'), '&lt;img src=x onerror=&quot;bad()&quot;&gt;');
  assert.equal(escapeHTML("Milo's & Luna's"),'Milo&#39;s &amp; Luna&#39;s');
});

test('the first zero-time frame and duplicate waypoints never produce invalid coordinates',()=>{
  const p={...resident(),walk:0,path:[{x:100,y:100},{x:100,y:100},{x:114,y:100}]};
  assert.equal(advanceResident(p,0),false);assert.equal(p.x,100);assert.equal(p.y,100);assert.equal(p.path.length,1);
  assert.equal(advanceResident(p,1),true);assert.equal(p.x,114);assert.equal(p.path.length,0);
});
test('fast-forward movement consumes multiple segments without overshooting the destination',()=>{
  const p={...resident(),walk:0,path:[{x:110,y:100},{x:110,y:110}]};
  assert.equal(advanceResident(p,100),true);assert.equal(p.x,110);assert.equal(p.y,110);
});
