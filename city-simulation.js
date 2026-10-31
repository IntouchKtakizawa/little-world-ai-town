import { clamp } from "./simulation.js";

export const DISTRICTS = [
  "Willowbrook",
  "Nova Heights",
  "Harbor City",
  "Eastbank",
  "Verdant Valley",
  "Aurora City",
];
export const BUILDINGS = {
  house: {
    name: "Townhouses",
    icon: "⌂",
    cost: 250,
    income: 6,
    capacity: 24,
    color: "#c4a380",
  },
  apartment: {
    name: "Apartments",
    icon: "▥",
    cost: 600,
    income: 15,
    capacity: 90,
    color: "#95aab3",
  },
  shop: {
    name: "Corner shop",
    icon: "▣",
    cost: 200,
    income: 15,
    color: "#c3a17b",
  },
  restaurant: {
    name: "Restaurant",
    icon: "♨",
    cost: 380,
    income: 22,
    color: "#c28162",
  },
  office: {
    name: "Office tower",
    icon: "▤",
    cost: 800,
    income: 38,
    color: "#86a4af",
  },
  skyscraper: {
    name: "Skyscraper",
    icon: "▥",
    cost: 2000,
    income: 90,
    capacity: 180,
    color: "#6b969c",
    requires: "engineering",
  },
  clinic: {
    name: "Health clinic",
    icon: "✚",
    cost: 400,
    income: -8,
    health: 3,
    color: "#e2dcca",
  },
  hospital: {
    name: "Hospital",
    icon: "✚",
    cost: 1400,
    income: -18,
    health: 10,
    color: "#b8d2cd",
    requires: "medicine",
  },
  lab: {
    name: "Research lab",
    icon: "⚗",
    cost: 700,
    income: -12,
    research: 1,
    color: "#a5b9c4",
  },
  university: {
    name: "University",
    icon: "⌘",
    cost: 1600,
    income: -16,
    research: 2,
    color: "#c2ac8e",
    requires: "education",
  },
  park: {
    name: "City park",
    icon: "♧",
    cost: 150,
    income: -2,
    happiness: 5,
    color: "#83a86b",
  },
  farm: {
    name: "Urban farm",
    icon: "❋",
    cost: 350,
    income: 14,
    food: 10,
    color: "#a3b87b",
  },
  solar: {
    name: "Solar farm",
    icon: "☀",
    cost: 950,
    income: 28,
    color: "#637f9e",
    requires: "cleanEnergy",
  },
  station: {
    name: "Transit station",
    icon: "▰",
    cost: 900,
    income: 24,
    color: "#b6ae94",
    requires: "transit",
  },
  shelter: {
    name: "Emergency shelter",
    icon: "◇",
    cost: 500,
    income: -5,
    defense: 6,
    color: "#a0a9a2",
  },
  defense: {
    name: "Defense HQ",
    icon: "⚑",
    cost: 1200,
    income: -15,
    defense: 16,
    color: "#8f9c86",
    requires: "resilience",
  },
};
export const RESEARCH = {
  engineering: {
    name: "Advanced construction",
    field: "Construction",
    icon: "▥",
    cost: 650,
    duration: 50,
    description: "Build taller, stronger, and more efficiently.",
    unlocks: "Skyscrapers · cheaper building upgrades",
  },
  cleanEnergy: {
    name: "Clean energy",
    field: "Energy",
    icon: "☀",
    cost: 550,
    duration: 45,
    description: "Develop solar power and a cleaner electricity grid.",
    unlocks: "Solar farms · +8 happiness",
  },
  transit: {
    name: "Public transport",
    field: "Transport",
    icon: "▰",
    cost: 450,
    duration: 40,
    description: "Connect neighborhoods with stations and a bus network.",
    unlocks: "Transit stations · buses · +10% income",
  },
  agriculture: {
    name: "Food systems",
    field: "Agriculture",
    icon: "❋",
    cost: 400,
    duration: 35,
    description: "Improve crop yields and neighborhood food security.",
    unlocks: "Double farm income · +6 happiness",
  },
  education: {
    name: "Public education",
    field: "Education",
    icon: "⌘",
    cost: 500,
    duration: 45,
    description: "Give new ideas a place to grow.",
    unlocks: "Universities · faster research",
  },
  medicine: {
    name: "Modern medicine",
    field: "Healthcare",
    icon: "✚",
    cost: 500,
    duration: 45,
    description: "Unlock hospitals. Improve public health and recovery.",
    unlocks: "Hospitals · +8 public health",
  },
  electric: {
    name: "Electric mobility",
    field: "Transport",
    icon: "ϟ",
    cost: 900,
    duration: 60,
    requires: "transit",
    description: "Upgrade city traffic to quieter electric vehicles.",
    unlocks: "Electric cars · +8 happiness",
  },
  veterinary: {
    name: "Veterinary care",
    field: "Animal welfare",
    icon: "♧",
    cost: 350,
    duration: 30,
    description: "Help cats, dogs, and their people thrive together.",
    unlocks: "Healthier pets · +5 happiness",
  },
  resilience: {
    name: "Civil resilience",
    field: "Defense",
    icon: "◇",
    cost: 600,
    duration: 50,
    description: "Strengthen shelters, emergency services, and city defenses.",
    unlocks: "Defense HQ · less conflict damage",
  },
  diplomacy: {
    name: "Diplomatic studies",
    field: "Government",
    icon: "⚑",
    cost: 500,
    duration: 40,
    description: "Build lasting peace and better trade relationships.",
    unlocks: "Stronger treaties · +15% peaceful income",
  },
  automation: {
    name: "Smart industry",
    field: "Technology",
    icon: "⚙",
    cost: 1200,
    duration: 70,
    requires: "engineering",
    description: "Automate industry and coordinate city services.",
    unlocks: "+25% city income",
  },
  oncology: {
    name: "Cancer research",
    field: "Healthcare",
    icon: "✚",
    cost: 1100,
    duration: 70,
    requires: "medicine",
    description:
      "A fictional oncology program that improves healthcare in this simulation.",
    unlocks: "+12 public health · improved recovery",
  },
};
export const slotPosition = (district, slot) => ({
  x: (district % 3) * 300 + 64 + (slot % 3) * 86,
  y: Math.floor(district / 3) * 250 + 90 + Math.floor(slot / 3) * 100,
});
export const expansionCost = (state) => 1000 + state.districts.length * 650;
export function createCityState() {
  return {
    version: 1,
    treasury: 10000,
    districts: [0, 1],
    buildings: [
      { id: 1, type: "house", district: 0, slot: 0, level: 1, integrity: 100 },
      { id: 2, type: "shop", district: 0, slot: 1, level: 1, integrity: 100 },
      { id: 3, type: "park", district: 0, slot: 2, level: 1, integrity: 100 },
      { id: 4, type: "clinic", district: 0, slot: 3, level: 1, integrity: 100 },
      { id: 5, type: "lab", district: 0, slot: 4, level: 1, integrity: 100 },
      {
        id: 6,
        type: "apartment",
        district: 1,
        slot: 0,
        level: 1,
        integrity: 100,
      },
      { id: 7, type: "office", district: 1, slot: 1, level: 1, integrity: 100 },
      {
        id: 8,
        type: "restaurant",
        district: 1,
        slot: 3,
        level: 1,
        integrity: 100,
      },
    ],
    completed: [],
    activeResearch: null,
    researchProgress: 0,
    tax: 10,
    healthFunding: 60,
    researchFunding: 70,
    trafficDensity: 55,
    pets: [
      { id: 1, type: "cat", name: "Miso", health: 100, district: 0 },
      { id: 2, type: "dog", name: "Biscuit", health: 100, district: 1 },
    ],
    conflict: { active: false, neighbor: "Ironvale", tension: 12, peace: 100 },
    elapsed: 0,
    nextId: 9,
  };
}
export function cityStats(s) {
  let population = 20,
    income = 0,
    health = 45 + s.healthFunding * 0.3,
    happiness = 75 - s.tax * 0.7,
    defense = 8,
    labs = 0;
  for (const b of s.buildings) {
    const t = BUILDINGS[b.type],
      factor = (b.level * b.integrity) / 100;
    population += (t.capacity || 0) * factor;
    income +=
      t.income *
      factor *
      (b.type === "farm" && s.completed.includes("agriculture") ? 2 : 1);
    health += (t.health || 0) * factor;
    happiness += (t.happiness || 0) * factor;
    defense += (t.defense || 0) * factor;
    labs += (t.research || 0) * factor;
  }
  income += (population * s.tax) / 100;
  income -= s.healthFunding * 0.3 + s.researchFunding * 0.2;
  if (s.completed.includes("medicine")) health += 8;
  if (s.completed.includes("oncology")) health += 12;
  for (const [k, n] of [
    ["cleanEnergy", 8],
    ["electric", 8],
    ["agriculture", 6],
    ["veterinary", 5],
  ])
    if (s.completed.includes(k)) happiness += n;
  if (s.completed.includes("transit")) income *= 1.1;
  if (s.completed.includes("automation")) income *= 1.25;
  if (s.completed.includes("diplomacy") && !s.conflict.active) income *= 1.15;
  if (s.conflict.active) {
    income = income * 0.55 - 25;
    happiness -= 22;
    health -= 8;
  } else happiness += s.conflict.peace * 0.06;
  return {
    population: Math.max(0, Math.round(population)),
    income: Math.round(income),
    health: clamp(health),
    happiness: clamp(happiness),
    defense: Math.round(defense),
    labs,
  };
}
export function construct(s, type, district, slot) {
  const t = BUILDINGS[type];
  if (!t) return { error: "Choose a building first." };
  if (!s.districts.includes(district))
    return { error: "Expand into this district first." };
  if (!Number.isInteger(slot) || slot < 0 || slot > 5)
    return { error: "Choose a marked building plot." };
  if (s.buildings.some((b) => b.district === district && b.slot === slot))
    return { error: "This plot is occupied. Inspect it to upgrade." };
  if (t.requires && !s.completed.includes(t.requires))
    return {
      error: `Research ${RESEARCH[t.requires].name} to unlock this building.`,
    };
  if (s.treasury < t.cost)
    return { error: "Not enough credits. Add a grant or grow your income." };
  s.treasury -= t.cost;
  const building = {
    id: s.nextId++,
    type,
    district,
    slot,
    level: 1,
    integrity: 100,
  };
  s.buildings.push(building);
  return { building };
}
export function expand(s) {
  if (s.districts.length >= 6)
    return {
      error:
        "All six cities are connected. Fill plots and upgrade buildings to grow further.",
    };
  const cost = expansionCost(s);
  if (s.treasury < cost)
    return { error: `Expansion needs ${cost.toLocaleString()} credits.` };
  const district = Array.from({ length: 6 }, (_, i) => i).find(
    (i) => !s.districts.includes(i),
  );
  s.districts.push(district);
  s.treasury -= cost;
  return { district };
}
export function beginResearch(s, id) {
  const r = RESEARCH[id];
  if (!r) return { error: "Choose a research project." };
  if (s.completed.includes(id))
    return { error: "This discovery is already complete." };
  if (s.activeResearch) return { error: "Finish the current project first." };
  if (r.requires && !s.completed.includes(r.requires))
    return { error: `Complete ${RESEARCH[r.requires].name} first.` };
  if (cityStats(s).labs < 0.1)
    return { error: "Build or repair a research lab first." };
  if (s.researchFunding === 0)
    return { error: "Increase research funding in City Hall." };
  if (s.treasury < r.cost)
    return { error: "Not enough credits to fund this project." };
  s.treasury -= r.cost;
  s.activeResearch = id;
  s.researchProgress = 0;
  return { project: r };
}
export function upgrade(s, id) {
  const b = s.buildings.find((b) => b.id === id);
  if (!b) return { error: "Building not found." };
  if (b.level >= 5) return { error: "This building is at its maximum level." };
  const cost = Math.round(
    BUILDINGS[b.type].cost *
      b.level *
      0.6 *
      (s.completed.includes("engineering") ? 0.75 : 1),
  );
  if (s.treasury < cost) return { error: `Upgrade needs ${cost} credits.` };
  s.treasury -= cost;
  b.level++;
  b.integrity = 100;
  return { building: b, cost };
}
export function advanceCity(s, dt) {
  const events = [];
  if (!Number.isFinite(dt) || dt < 0) return events;
  dt = Math.min(dt, 120);
  s.elapsed += dt;
  const stats = cityStats(s);
  s.treasury = Math.max(0, s.treasury + (stats.income * dt) / 60);
  if (s.activeResearch && stats.labs > 0) {
    const r = RESEARCH[s.activeResearch];
    s.researchProgress = clamp(
      s.researchProgress +
        (dt / r.duration) *
          100 *
          stats.labs *
          (s.researchFunding / 70) *
          (s.completed.includes("education") ? 1.25 : 1),
    );
    if (s.researchProgress >= 100) {
      s.completed.push(s.activeResearch);
      events.push({ type: "research", id: s.activeResearch });
      s.activeResearch = null;
      s.researchProgress = 0;
    }
  }
  if (s.conflict.active) {
    s.conflict.tension = clamp(s.conflict.tension + dt * 0.05);
    s.conflict.peace = clamp(s.conflict.peace - dt * 0.06);
    const protection =
      1 + stats.defense / 20 + (s.completed.includes("resilience") ? 2 : 0);
    s.buildings.forEach(
      (b) =>
        (b.integrity = clamp(b.integrity - (dt * 0.18) / protection, 15, 100)),
    );
  } else {
    s.conflict.peace = clamp(s.conflict.peace + dt * 0.03);
    s.conflict.tension = clamp(s.conflict.tension - dt * 0.02);
  }
  s.pets.forEach(
    (p) =>
      (p.health = clamp(
        p.health +
          dt * (s.completed.includes("veterinary") ? 0.05 : 0.005) -
          (s.conflict.active ? dt * 0.03 : 0),
      )),
  );
  return events;
}
export function validateCity(s) {
  return (
    !!s &&
    s.version === 1 &&
    Number.isFinite(s.treasury) &&
    s.treasury >= 0 &&
    Array.isArray(s.districts) &&
    s.districts.length > 0 &&
    s.districts.length <= 6 &&
    new Set(s.districts).size === s.districts.length &&
    s.districts.every((i) => Number.isInteger(i) && i >= 0 && i < 6) &&
    Array.isArray(s.buildings) &&
    s.buildings.length <= 36 &&
    new Set(s.buildings.map((b) => `${b.district}:${b.slot}`)).size ===
      s.buildings.length &&
    s.buildings.every(
      (b) =>
        BUILDINGS[b.type] &&
        s.districts.includes(b.district) &&
        Number.isInteger(b.slot) &&
        b.slot >= 0 &&
        b.slot < 6 &&
        Number.isInteger(b.level) &&
        b.level >= 1 &&
        b.level <= 5 &&
        Number.isFinite(b.integrity) &&
        b.integrity >= 0 &&
        b.integrity <= 100,
    ) &&
    Array.isArray(s.completed) &&
    s.completed.every((k) => RESEARCH[k]) &&
    (!s.activeResearch || RESEARCH[s.activeResearch]) &&
    Number.isFinite(s.researchProgress) &&
    s.researchProgress >= 0 &&
    s.researchProgress <= 100 &&
    ["tax", "healthFunding", "researchFunding", "trafficDensity"].every(
      (k) =>
        Number.isFinite(s[k]) && s[k] >= 0 && s[k] <= (k === "tax" ? 25 : 100),
    ) &&
    Number.isFinite(s.elapsed) &&
    Number.isInteger(s.nextId) &&
    s.nextId > Math.max(0, ...s.buildings.map((b) => b.id)) &&
    Array.isArray(s.pets) &&
    s.pets.length <= 40 &&
    s.pets.every(
      (p) =>
        ["cat", "dog"].includes(p.type) &&
        typeof p.name === "string" &&
        p.name.length < 50 &&
        Number.isFinite(p.health) &&
        p.health >= 0 &&
        p.health <= 100 &&
        s.districts.includes(p.district),
    ) &&
    s.conflict &&
    typeof s.conflict.active === "boolean" &&
    ["Ironvale", "Redhaven", "Stonewatch"].includes(s.conflict.neighbor) &&
    Number.isFinite(s.conflict.tension) &&
    Number.isFinite(s.conflict.peace)
  );
}
