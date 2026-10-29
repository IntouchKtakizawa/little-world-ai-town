// Pure simulation rules shared by the sandbox and its tests.
export const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function affectResident(person, changes) {
  for (const key of ['health', 'energy', 'hunger', 'social']) {
    if (Number.isFinite(changes[key])) person[key] = clamp(person[key] + changes[key]);
  }
  return person;
}
export function nearestResidents(people, x, y, radius) {
  return people.filter(p => Math.hypot(p.x - x, p.y - y) <= radius);
}
export function validateSnapshot(s) {
  if (!s || s.version !== 2 || !Number.isFinite(s.minutes) || s.minutes < 0 || !Array.isArray(s.people) || !s.people.length || s.people.length > 40) return false;
  const destinations = ['home','cafe','library','workshop','market','park'];
  return s.people.every((p, i) => p.id === i && ['name','role','bio','thought','action','color','hair','skin','bg'].every(k => typeof p[k] === 'string' && p[k].length < 2000) &&
    ['color','hair','skin','bg'].every(k => /^#[0-9a-f]{6}$/i.test(p[k])) &&
    ['health','energy','hunger','social'].every(k => Number.isFinite(p[k]) && p[k] >= 0 && p[k] <= 100) &&
    Number.isFinite(p.x) && p.x >= 0 && p.x <= 900 && Number.isFinite(p.y) && p.y >= 0 && p.y <= 500 &&
    destinations.includes(p.target) && Array.isArray(p.path) && p.path.every(d => Number.isFinite(d.x) && Number.isFinite(d.y)) &&
    Array.isArray(p.traits) && p.traits.every(t => typeof t === 'string') && Array.isArray(p.memories) && p.memories.every(m => typeof m.text === 'string' && typeof m.time === 'string') &&
    p.relations && typeof p.relations === 'object' && Object.entries(p.relations).every(([id,n]) => Number.isInteger(+id) && +id >= 0 && +id < s.people.length && Number.isFinite(n) && n >= 0 && n <= 100));
}

// Consume waypoints safely, including repeated points and the first zero-time frame.
export function advanceResident(person, dt) {
  if (!person.path.length || !Number.isFinite(dt) || dt < 0) return false;
  let budget = dt * (14 + person.id * .8);
  person.walk += dt * 6;
  while (person.path.length) {
    const destination = person.path[0];
    const dx = destination.x - person.x, dy = destination.y - person.y;
    const distance = Math.hypot(dx, dy);
    if (distance < .001 || distance <= budget) {
      person.x = destination.x; person.y = destination.y;
      person.path.shift(); budget = Math.max(0, budget - distance);
    } else {
      if (budget > 0) { person.x += dx / distance * budget; person.y += dy / distance * budget; }
      break;
    }
  }
  return person.path.length === 0;
}
