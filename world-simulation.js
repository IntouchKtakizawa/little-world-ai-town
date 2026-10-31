import { EARTH_COUNTRIES, EARTH_NATIONS, EARTH_BY_ID } from "./earth-data.js";
import {
  realCenter,
  realNeighbors,
  countryClimate,
  specialty,
} from "./earth-geography.js";
import { clamp } from "./simulation.js";
export const NATIONS = [
  {
    id: "willow",
    name: "Willow Republic",
    short: "WILLOW",
    color: "#b8d58a",
    dark: "#638357",
    home: [14, 4],
  },
  {
    id: "aurora",
    name: "Aurora Union",
    short: "AURORA",
    color: "#9bbfd0",
    dark: "#4c7d94",
    home: [5, 3],
  },
  {
    id: "solara",
    name: "Solara Federation",
    short: "SOLARA",
    color: "#dfbc78",
    dark: "#ab8346",
    home: [13, 8],
  },
  {
    id: "meridian",
    name: "Meridian Empire",
    short: "MERIDIAN",
    color: "#c59cb7",
    dark: "#925d80",
    home: [20, 4],
  },
  {
    id: "pacifica",
    name: "Pacifica League",
    short: "PACIFICA",
    color: "#93c8b7",
    dark: "#528d7a",
    home: [23, 10],
  },
  {
    id: "verdant",
    name: "Verdant Commonwealth",
    short: "VERDANT",
    color: "#ce9e83",
    dark: "#9e6f53",
    home: [7, 9],
  },
];
export const GOODS = ["food", "metal", "energy", "science"];
export const TECH = {
  navigation: {
    name: "Ocean navigation",
    cost: 500,
    science: 15,
    duration: 35,
    description: "Claim and launch expeditions across the sea.",
  },
  logistics: {
    name: "Trade logistics",
    cost: 500,
    science: 20,
    duration: 40,
    description: "Trade shipments earn 50% more revenue.",
  },
  agriculture: {
    name: "Global agriculture",
    cost: 450,
    science: 15,
    duration: 35,
    description: "Double food production across your territories.",
  },
  energy: {
    name: "Energy networks",
    cost: 550,
    science: 20,
    duration: 40,
    description: "Double energy production across your territories.",
  },
  defense: {
    name: "Territorial defense",
    cost: 650,
    science: 25,
    duration: 50,
    description: "Your defending forces gain 40% strength.",
  },
  governance: {
    name: "Civic institutions",
    cost: 700,
    science: 30,
    duration: 50,
    description: "City income +30%; relations improve faster.",
  },
};
// An original, simplified world silhouette. Countries and borders are fictional.
const continents = [
  [
    [2, 2],
    [5, 1],
    [9, 2],
    [10, 4],
    [8, 6],
    [6, 6],
    [5, 5],
    [3, 5],
    [2, 3],
  ],
  [
    [6, 6],
    [9, 6],
    [10, 8],
    [9, 11],
    [8, 13],
    [6, 10],
  ],
  [
    [12, 2],
    [15, 1],
    [18, 2],
    [22, 1],
    [26, 3],
    [27, 5],
    [25, 7],
    [23, 7],
    [22, 6],
    [20, 7],
    [18, 6],
    [17, 5],
    [15, 6],
    [12, 5],
  ],
  [
    [12, 5],
    [15, 5],
    [17, 7],
    [16, 10],
    [14, 11],
    [12, 8],
  ],
  [
    [22, 9],
    [25, 9],
    [27, 11],
    [25, 12],
    [22, 11],
  ],
  [
    [10, 0],
    [12, 0],
    [12, 2],
    [10, 2],
  ],
];
function inside(x, y, poly) {
  let yes = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    let a = poly[i],
      b = poly[j];
    if (
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    )
      yes = !yes;
  }
  return yes;
}
export const center = (t) =>
  t.earth
    ? realCenter(t)
    : { x: 26 + t.col * 31 + (t.row % 2) * 15.5, y: 38 + t.row * 32 };
export function neighbors(a, b) {
  if (a.earth && b.earth) return realNeighbors(a, b);
  return (
    Math.abs(a.row - b.row) <= 1 &&
    Math.hypot(center(a).x - center(b).x, center(a).y - center(b).y) < 39 &&
    a.id !== b.id
  );
}
export function createWorld() {
  let tiles = [];
  for (let row = 0; row < 13; row++)
    for (let col = 0; col < 28; col++) {
      if (continents.some((p) => inside(col, row, p))) {
        const nearest = NATIONS.slice().sort(
          (a, b) =>
            Math.hypot(a.home[0] - col, a.home[1] - row) -
            Math.hypot(b.home[0] - col, b.home[1] - row),
        )[0];
        const dist = Math.hypot(nearest.home[0] - col, nearest.home[1] - row);
        tiles.push({
          id: `${col}:${row}`,
          col,
          row,
          owner: dist < 2.7 ? nearest.id : null,
          resource: GOODS[(col * 7 + row * 3) % 4],
          city: dist < 1.2 ? 1 : 0,
          troops: dist < 2 ? 30 : 15,
          port: false,
          name: regionName(col, row),
        });
      }
    }
  const home = tiles
    .filter((t) => t.owner === "willow")
    .sort(
      (a, b) =>
        Math.hypot(a.col - 14, a.row - 4) - Math.hypot(b.col - 14, b.row - 4),
    )[0];
  home.city = 2;
  home.troops = 100;
  for (const nation of NATIONS.filter((n) => n.id !== "willow")) {
    const capital = tiles
      .filter((t) => t.owner === nation.id)
      .sort(
        (a, b) =>
          Math.hypot(a.col - nation.home[0], a.row - nation.home[1]) -
          Math.hypot(b.col - nation.home[0], b.row - nation.home[1]),
      )[0];
    if (capital) {
      capital.city = 2;
      capital.troops = 70;
    }
  }
  return {
    version: 1,
    tiles,
    treasury: 3000,
    stock: { food: 80, metal: 80, energy: 80, science: 50 },
    relations: Object.fromEntries(
      NATIONS.filter((n) => n.id !== "willow").map((n) => [n.id, 45]),
    ),
    wars: [],
    alliances: [],
    trades: [],
    battles: [],
    completed: [],
    research: null,
    progress: 0,
    elapsed: 0,
    economyClock: 0,
    tradeClock: 0,
    aiClock: 0,
    events: [
      {
        text: "Your republic has joined the world stage. Peace is yours to keep.",
        kind: "peace",
      },
    ],
    nextId: 1,
    inbox: [],
    diplomacyClock: 25,
    diplomacyTurn: 0,
    cityProjects: {},
  };
}
function regionName(c, r) {
  const a = [
    "North",
    "River",
    "High",
    "Silver",
    "New",
    "Stone",
    "Sun",
    "West",
    "Green",
    "Lake",
  ];
  const b = [
    "haven",
    "ford",
    "reach",
    "bay",
    "field",
    "crest",
    "port",
    "vale",
    "wick",
    "bridge",
  ];
  return a[(c + r) % a.length] + b[(c * 3 + r) % b.length];
}
export function nationStats(s, owner = s.player || "willow") {
  const land = s.tiles.filter((t) => t.owner === owner);
  return {
    territories: land.length,
    cities: s.earth
      ? land.reduce((n, t) => n + (t.hubs?.length || 0), 0)
      : land.filter((t) => t.city > 0).length,
    population: land.reduce(
      (n, t) =>
        n +
        (t.earth
          ? Math.round(t.population * (1 + (t.city - t.baselineCity) * 0.01))
          : 200 + t.city * 1500),
      0,
    ),
    troops:
      land.reduce((n, t) => n + t.troops, 0) +
      (s.battles || [])
        .filter((b) => b.attacker === owner)
        .reduce((n, b) => n + b.force, 0),
    income: Math.round(
      land.reduce(
        (n, t) =>
          n +
          (t.earth ? t.economy : 3) +
          t.city * 8 +
          Object.entries(s.cityProjects || {})
            .filter(([key]) => key.startsWith(t.id + ":"))
            .reduce((sum, [, p]) => sum + p.transport * 3 + p.housing * 2, 0),
        0,
      ) *
        (owner === (s.player || "willow") && s.completed.includes("governance")
          ? 1.3
          : 1),
    ),
    ports: land.filter((t) => t.port).length,
  };
}
function own(s, id) {
  return s.tiles.find((t) => t.id === id);
}
export function adjacentOwned(s, t, owner = s.player || "willow") {
  return s.tiles.some((a) => a.owner === owner && neighbors(a, t));
}
function event(s, text, kind = "world") {
  s.events.unshift({ text, kind });
  s.events = s.events.slice(0, 30);
}
export function claim(s, id) {
  const t = own(s, id);
  if (t?.protected)
    return { error: "Antarctica is a protected polar region in Earth mode." };
  if (!t || t.owner) return { error: "Choose an unclaimed territory." };
  if (!adjacentOwned(s, t) && !s.completed.includes("navigation"))
    return {
      error: "Claim a neighboring territory, or research Ocean navigation.",
    };
  if (s.treasury < 180)
    return { error: "Claiming a territory needs 180 credits." };
  s.treasury -= 180;
  t.owner = s.player || "willow";
  t.troops = 20;
  event(s, `${t.name} joined your republic peacefully.`, "claim");
  return { tile: t };
}
export function develop(s, id) {
  const t = own(s, id);
  if (t?.owner !== (s.player || "willow"))
    return { error: "You can develop only your own territory." };
  if (t.city >= 5) return { error: "This city is already level 5." };
  const cost = 300 * (t.city + 1);
  if (s.treasury < cost || s.stock.metal < 10)
    return { error: `Development needs ${cost} credits and 10 metal.` };
  s.treasury -= cost;
  s.stock.metal -= 10;
  t.city++;
  event(s, `${t.name} developed into a level ${t.city} city.`, "city");
  return { tile: t };
}
export function recruit(s, id) {
  const t = own(s, id);
  if (t?.owner !== (s.player || "willow"))
    return { error: "Recruit in a territory you control." };
  if (s.treasury < 150 || s.stock.food < 10 || s.stock.metal < 5)
    return { error: "Recruitment needs 150 credits, 10 food, and 5 metal." };
  s.treasury -= 150;
  s.stock.food -= 10;
  s.stock.metal -= 5;
  t.troops += 25;
  return { tile: t };
}
export function transfer(s, from, to, count) {
  const a = own(s, from),
    b = own(s, to);
  if (
    !a ||
    !b ||
    a.id === b.id ||
    a.owner !== (s.player || "willow") ||
    b.owner !== (s.player || "willow")
  )
    return { error: "Choose two different territories you control." };
  if (!neighbors(a, b) && !s.completed.includes("navigation"))
    return {
      error: "Move to an adjacent territory, or research Ocean navigation.",
    };
  if (!Number.isInteger(count) || count < 1 || a.troops - count < 5)
    return { error: "Leave at least 5 troops behind." };
  a.troops -= count;
  b.troops += count;
  return {};
}
export function declareWar(s, nation) {
  if (!Object.hasOwn(s.relations, nation))
    return { error: "Choose another country." };
  if (s.wars.includes(nation)) return { error: "You are already at war." };
  if (s.alliances.includes(nation))
    return { error: "End your alliance before declaring war." };
  s.wars.push(nation);
  s.relations[nation] = 0;
  s.trades = s.trades.filter((t) => t.partner !== nation);
  event(
    s,
    `You declared war on ${nationsFor(s).find((n) => n.id === nation).name}. Trade agreements ended.`,
    "war",
  );
  return {};
}
export function peace(s, nation) {
  if (!s.wars.includes(nation)) return { error: "You are already at peace." };
  if (s.treasury < 200)
    return { error: "Peace negotiations need 200 credits." };
  s.treasury -= 200;
  s.wars = s.wars.filter((n) => n !== nation);
  for (const battle of s.battles.filter(
    (b) => b.attacker === nation || b.defender === nation,
  )) {
    const source = own(s, battle.source),
      destination =
        source?.owner === battle.attacker
          ? source
          : s.tiles.find((t) => t.owner === battle.attacker);
    if (destination) destination.troops += battle.force;
  }
  s.battles = s.battles.filter(
    (b) => b.attacker !== nation && b.defender !== nation,
  );
  s.relations[nation] = 35;
  event(
    s,
    `Peace was signed with ${nationsFor(s).find((n) => n.id === nation).name}. Borders hold where they are.`,
    "peace",
  );
  return {};
}
export function gift(s, nation) {
  if (!Object.hasOwn(s.relations, nation) || s.wars.includes(nation))
    return { error: "Gifts are available for countries at peace." };
  if (s.treasury < 100)
    return { error: "A diplomatic gift needs 100 credits." };
  s.treasury -= 100;
  s.relations[nation] = clamp(s.relations[nation] + 15);
  return {};
}
export function alliance(s, nation) {
  if (s.wars.includes(nation)) return { error: "Negotiate peace first." };
  if (s.relations[nation] < 65)
    return {
      error: "An alliance needs at least 65 relations. Send diplomatic gifts.",
    };
  if (s.alliances.includes(nation)) {
    s.alliances = s.alliances.filter((n) => n !== nation);
    event(s, "You ended an alliance.", "peace");
    return { ended: true };
  }
  s.alliances.push(nation);
  event(
    s,
    `Your government allied with ${nationsFor(s).find((n) => n.id === nation).name}.`,
    "peace",
  );
  return {};
}
export function signTrade(s, partner, exportGood, importGood, quantity) {
  if (!Object.hasOwn(s.relations, partner) || s.wars.includes(partner))
    return { error: "Trade requires a country at peace with you." };
  if (!nationStats(s, partner).territories)
    return { error: "This country no longer controls territory." };
  if (s.relations[partner] < 30)
    return { error: "Improve relations to 30 before trading." };
  if (
    !GOODS.includes(exportGood) ||
    !GOODS.includes(importGood) ||
    exportGood === importGood
  )
    return { error: "Choose different resources to import and export." };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20)
    return { error: "Trade quantities must be from 1 to 20." };
  if (s.trades.some((t) => t.partner === partner))
    return { error: "Cancel the existing agreement with this country first." };
  if (s.stock[exportGood] < quantity)
    return {
      error: "You do not have enough resources for the first shipment.",
    };
  const route = {
    id: s.nextId++,
    partner,
    exportGood,
    importGood,
    quantity,
    shipments: 0,
    status: "Waiting for shipment",
  };
  s.trades.push(route);
  event(
    s,
    `A ${exportGood}-for-${importGood} agreement was signed with ${nationsFor(s).find((n) => n.id === partner).name}.`,
    "trade",
  );
  return { route };
}
export function attack(s, source, target, count) {
  const a = own(s, source),
    b = own(s, target);
  if (
    a?.owner !== (s.player || "willow") ||
    !b?.owner ||
    b.owner === (s.player || "willow")
  )
    return { error: "Choose your staging territory and an enemy territory." };
  if (!s.wars.includes(b.owner))
    return {
      error: "Declare war on the territory’s country before attacking.",
    };
  if (!neighbors(a, b) && !s.completed.includes("navigation"))
    return {
      error: "Attack a neighboring territory, or research Ocean navigation.",
    };
  if (s.battles.some((v) => v.target === target))
    return { error: "There is already a battle for this territory." };
  if (!Number.isInteger(count) || count < 10 || a.troops - count < 5)
    return { error: "Send at least 10 troops and leave at least 5 behind." };
  a.troops -= count;
  const battle = {
    id: s.nextId++,
    source,
    target,
    attacker: s.player || "willow",
    defender: b.owner,
    force: count,
    progress: 0,
  };
  s.battles.push(battle);
  event(s, `Your forces began an advance on ${b.name}.`, "war");
  return { battle };
}
export function research(s, id) {
  const t = TECH[id];
  if (!t) return { error: "Choose a technology." };
  if (s.research) return { error: "Finish the current technology first." };
  if (s.completed.includes(id))
    return { error: "This technology is already unlocked." };
  if (s.treasury < t.cost || s.stock.science < t.science)
    return { error: `This needs ${t.cost} credits and ${t.science} science.` };
  s.treasury -= t.cost;
  s.stock.science -= t.science;
  s.research = id;
  s.progress = 0;
  return {};
}
export function advanceWorld(s, dt) {
  if (!Number.isFinite(dt) || dt < 0) return;
  dt = Math.min(dt, 120);
  advanceDiplomacy(s, dt);
  s.elapsed += dt;
  s.economyClock += dt;
  s.tradeClock += dt;
  s.aiClock += dt;
  while (s.economyClock >= 10) {
    s.economyClock -= 10;
    if (s.completed.includes("governance"))
      for (const id of Object.keys(s.relations))
        if (!s.wars.includes(id))
          s.relations[id] = clamp(s.relations[id] + 0.2);
    s.treasury += nationStats(s).income / 6;
    s.stock.science = Math.min(
      9999,
      s.stock.science +
        Object.entries(s.cityProjects || {})
          .filter(([key]) =>
            s.tiles.some(
              (t) =>
                t.owner === (s.player || "willow") &&
                key.startsWith(t.id + ":"),
            ),
          )
          .reduce((n, [, p]) => n + (p.health * 2) / 6, 0),
    );
    for (const t of s.tiles.filter((t) => t.owner === (s.player || "willow")))
      s.stock[t.resource] = Math.min(
        9999,
        s.stock[t.resource] +
          (1 + t.city * 0.5) *
            (["food", "energy"].includes(t.resource) &&
            s.completed.includes(
              t.resource === "food" ? "agriculture" : "energy",
            )
              ? 2
              : 1),
      );
  }
  while (s.tradeClock >= 15) {
    s.tradeClock -= 15;
    for (const route of s.trades) {
      if (!nationStats(s, route.partner).territories) {
        route.status = "Paused: partner has no territory";
        continue;
      }
      if (s.stock[route.exportGood] >= route.quantity) {
        s.stock[route.exportGood] -= route.quantity;
        s.stock[route.importGood] = Math.min(
          9999,
          s.stock[route.importGood] + route.quantity,
        );
        s.treasury +=
          route.quantity * (s.completed.includes("logistics") ? 4.5 : 3);
        route.shipments++;
        route.status = "Trading";
        s.relations[route.partner] = clamp(s.relations[route.partner] + 1);
      } else route.status = "Paused: insufficient " + route.exportGood;
    }
  }
  if (s.research) {
    s.progress += (dt / TECH[s.research].duration) * 100;
    if (s.progress >= 100) {
      event(s, `${TECH[s.research].name} is complete.`, "research");
      s.completed.push(s.research);
      s.research = null;
      s.progress = 0;
    }
  }
  for (const b of s.battles) {
    b.progress += (dt / 30) * 100;
    if (b.progress >= 100) {
      const target = own(s, b.target);
      if (target.owner !== b.defender) {
        b.finished = true;
        continue;
      }
      let defense =
        target.troops *
        (1 + target.city * 0.12) *
        (target.owner === (s.player || "willow") &&
        s.completed.includes("defense")
          ? 1.4
          : 1);
      if (b.force > defense) {
        const previous = target.owner;
        target.owner = b.attacker;
        target.troops = Math.max(5, Math.round(b.force - defense * 0.65));
        target.city = Math.max(0, target.city - 1);
        event(
          s,
          `${target.name} was captured by ${nationsFor(s).find((n) => n.id === b.attacker).name}.`,
          "war",
        );
        if (!s.tiles.some((t) => t.owner === previous))
          event(
            s,
            `${nationsFor(s).find((n) => n.id === previous).name} no longer holds territory.`,
            "war",
          );
      } else {
        target.troops = Math.max(5, Math.round(target.troops - b.force * 0.5));
        event(
          s,
          `The defense of ${target.name} held. The attacking force was lost.`,
          "war",
        );
      }
      b.finished = true;
    }
  }
  s.battles = s.battles.filter((b) => !b.finished);
  if (s.aiClock >= 40) {
    s.aiClock = 0;
    for (const enemy of s.wars) {
      s.tiles
        .filter((t) => t.owner === enemy)
        .forEach((t) => (t.troops = Math.min(140, t.troops + 6)));
      const targets = s.tiles.filter(
        (t) =>
          t.owner === (s.player || "willow") &&
          s.tiles.some(
            (a) => a.owner === enemy && a.troops > 35 && neighbors(a, t),
          ) &&
          !s.battles.some((b) => b.target === t.id),
      );
      if (targets.length) {
        const target = targets[0],
          source = s.tiles.find(
            (a) => a.owner === enemy && a.troops > 35 && neighbors(a, target),
          );
        const force = Math.floor(source.troops * 0.65);
        source.troops -= force;
        s.battles.push({
          id: s.nextId++,
          source: source.id,
          target: target.id,
          attacker: enemy,
          defender: s.player || "willow",
          force,
          progress: 0,
        });
        event(
          s,
          `${nationsFor(s).find((n) => n.id === enemy).name} is advancing on ${target.name}.`,
          "war",
        );
      }
    }
  }
}
export function validateWorld(s) {
  return (
    !!s &&
    validateInteractions(s) &&
    s.version === 1 &&
    (!s.earth || EARTH_NATIONS.some((n) => n.id === s.player)) &&
    Number.isFinite(s.treasury) &&
    s.treasury >= 0 &&
    s.stock &&
    GOODS.every((g) => Number.isFinite(s.stock[g]) && s.stock[g] >= 0) &&
    Array.isArray(s.tiles) &&
    s.tiles.length > 50 &&
    s.tiles.length < 400 &&
    new Set(s.tiles.map((t) => t.id)).size === s.tiles.length &&
    s.tiles.every(
      (t) =>
        typeof t.name === "string" &&
        t.name.length < 80 &&
        (s.earth
          ? !!EARTH_BY_ID[t.id] &&
            t.earth === true &&
            Number.isFinite(t.population) &&
            t.population >= 0 &&
            Number.isFinite(t.economy) &&
            Number.isInteger(t.baselineCity) &&
            Array.isArray(t.hubs)
          : Number.isInteger(t.col) &&
            t.col >= 0 &&
            t.col < 28 &&
            Number.isInteger(t.row) &&
            t.row >= 0 &&
            t.row < 13 &&
            t.id === `${t.col}:${t.row}`) &&
        (!t.owner || nationsFor(s).some((n) => n.id === t.owner)) &&
        GOODS.includes(t.resource) &&
        Number.isInteger(t.city) &&
        t.city >= 0 &&
        t.city <= 5 &&
        Number.isFinite(t.troops) &&
        t.troops >= 0,
    ) &&
    s.relations &&
    nationsFor(s)
      .filter((n) => n.id !== (s.player || "willow"))
      .every(
        (n) =>
          Number.isFinite(s.relations[n.id]) &&
          s.relations[n.id] >= 0 &&
          s.relations[n.id] <= 100,
      ) &&
    ["wars", "alliances"].every(
      (k) =>
        Array.isArray(s[k]) &&
        s[k].every((id) =>
          nationsFor(s).some((n) => n.id === id && id !== "willow"),
        ),
    ) &&
    Array.isArray(s.trades) &&
    s.trades.every(
      (t) =>
        Object.hasOwn(s.relations, t.partner) &&
        GOODS.includes(t.exportGood) &&
        GOODS.includes(t.importGood) &&
        Number.isInteger(t.quantity) &&
        t.quantity > 0 &&
        t.quantity <= 20 &&
        Number.isInteger(t.id) &&
        t.id > 0 &&
        Number.isInteger(t.shipments) &&
        t.shipments >= 0 &&
        typeof t.status === "string" &&
        t.status.length < 100,
    ) &&
    Array.isArray(s.completed) &&
    s.completed.every((k) => Object.hasOwn(TECH, k)) &&
    (!s.research || Object.hasOwn(TECH, s.research)) &&
    Array.isArray(s.battles) &&
    s.battles.every(
      (b) =>
        s.tiles.some((t) => t.id === b.source) &&
        s.tiles.some((t) => t.id === b.target) &&
        nationsFor(s).some((n) => n.id === b.attacker) &&
        nationsFor(s).some((n) => n.id === b.defender) &&
        Number.isFinite(b.force) &&
        b.force > 0 &&
        Number.isFinite(b.progress),
    ) &&
    [
      "elapsed",
      "economyClock",
      "tradeClock",
      "aiClock",
      "progress",
      "nextId",
    ].every((k) => Number.isFinite(s[k]) && s[k] >= 0) &&
    Array.isArray(s.events) &&
    s.events.every((e) => typeof e.text === "string" && e.text.length < 1000)
  );
}

export function nationsFor(s) {
  return s.earth ? EARTH_NATIONS : NATIONS;
}
export function createEarthWorld(player = "THA") {
  if (!EARTH_NATIONS.some((n) => n.id === player)) player = "THA";
  const tiles = EARTH_COUNTRIES.map((c) => {
    const level =
      c.id === "ATA"
        ? 0
        : Math.max(
            1,
            Math.min(4, Math.round(Math.log10(Math.max(1000, c.gdp)) / 2)),
          );
    return {
      id: c.id,
      earth: true,
      name: c.name,
      owner: c.id === "ATA" ? null : c.id,
      protected: c.id === "ATA",
      population: c.population,
      populationYear: c.populationYear,
      economy: Math.max(2, Math.round(Math.log10(Math.max(1, c.gdp)) * 6)),
      baselineCity: level,
      city: level,
      hubs: c.cities.map((city) => ({ ...city })),
      climate: countryClimate(c),
      resource: specialty(c),
      troops:
        c.id === player
          ? 100
          : c.id === "ATA"
            ? 0
            : Math.max(
                15,
                Math.min(
                  120,
                  Math.round(Math.log10(Math.max(100, c.population)) * 8),
                ),
              ),
      port: false,
    };
  });
  return {
    version: 1,
    earth: true,
    player,
    tiles,
    treasury: 5000,
    stock: { food: 100, metal: 100, energy: 100, science: 75 },
    relations: Object.fromEntries(
      EARTH_NATIONS.filter((n) => n.id !== player).map((n) => [n.id, 45]),
    ),
    wars: [],
    alliances: [],
    trades: [],
    battles: [],
    completed: [],
    research: null,
    progress: 0,
    elapsed: 0,
    economyClock: 0,
    tradeClock: 0,
    aiClock: 0,
    events: [
      {
        text: `You are leading ${EARTH_BY_ID[player].name}. Real geography; a new peaceful game scenario.`,
        kind: "peace",
      },
    ],
    nextId: 1,
    inbox: [],
    diplomacyClock: 25,
    diplomacyTurn: 0,
    cityProjects: {},
  };
}

// Add newly mapped regions/cities without discarding a saved Earth's gameplay.
export function upgradeEarthWorld(saved) {
  if (!saved?.earth || !Array.isArray(saved.tiles)) return saved;
  const fresh = createEarthWorld(saved.player),
    old = new Map(saved.tiles.map((t) => [t.id, t]));
  const tiles = fresh.tiles.map((t) => {
    const previous = old.get(t.id);
    return previous ? { ...t, ...previous, hubs: t.hubs, earth: true } : t;
  });
  const relations = Object.fromEntries(
    Object.entries(fresh.relations).map(([id, value]) => [
      id,
      Number.isFinite(saved.relations?.[id]) ? saved.relations[id] : value,
    ]),
  );
  return { ...fresh, ...saved, tiles, relations };
}

// Offers are simulated diplomacy, never real messages or live geopolitical events.
export function ensureDiplomacy(s) {
  s.inbox ??= [];
  s.diplomacyClock ??= 25;
  s.diplomacyTurn ??= 0;
  s.cityProjects ??= {};
}
export function advanceDiplomacy(s, dt) {
  ensureDiplomacy(s);
  for (const m of s.inbox)
    if (m.status === "pending" && m.expires <= s.elapsed + dt) {
      m.status = "expired";
      event(s, `${m.name}'s diplomatic offer expired.`, "peace");
    }
  s.diplomacyClock += dt;
  while (s.diplomacyClock >= 45) {
    s.diplomacyClock -= 45;
    if (s.inbox.filter((m) => m.status === "pending").length >= 4) continue;
    const near = EARTH_BY_ID[s.player]?.neighbors || [];
    const candidates = nationsFor(s)
      .filter(
        (n) =>
          n.id !== (s.player || "willow") && nationStats(s, n.id).territories,
      )
      .sort(
        (a, b) =>
          Number(near.includes(b.id)) - Number(near.includes(a.id)) ||
          a.id.localeCompare(b.id),
      );
    if (!candidates.length) continue;
    const turn = s.diplomacyTurn++,
      n = candidates[turn % candidates.length];
    const type = s.wars.includes(n.id)
      ? "peace"
      : s.relations[n.id] >= 65 && !s.alliances.includes(n.id)
        ? "alliance"
        : ["trade", "aid", "research", "culture"][turn % 4];
    if (type === "trade" && s.trades.some((t) => t.partner === n.id)) continue;
    const exportGood = GOODS[turn % 4],
      importGood = GOODS[(turn + 1) % 4];
    const message = {
      id: s.nextId++,
      partner: n.id,
      name: n.name,
      type,
      exportGood,
      importGood,
      status: "pending",
      expires: s.elapsed + dt + 180,
    };
    s.inbox.unshift(message);
    s.inbox = s.inbox.slice(0, 20);
    event(
      s,
      `${n.name} sent a ${type === "aid" ? "humanitarian aid request" : type + " proposal"}. Open Diplomatic inbox to respond.`,
      "diplomacy",
    );
  }
}
export function respondDiplomacy(s, id, accept) {
  ensureDiplomacy(s);
  const m = s.inbox.find((m) => m.id === id);
  if (!m || m.status !== "pending" || m.expires <= s.elapsed)
    return { error: "This offer is no longer available." };
  if (!nationStats(s, m.partner).territories)
    return { error: "This country no longer controls territory." };
  if (!accept) {
    m.status = "declined";
    event(s, `You politely declined ${m.name}'s proposal.`, "peace");
    return {};
  }
  if (s.wars.includes(m.partner) && m.type !== "peace")
    return { error: "Negotiate peace before accepting this offer." };
  let result = {};
  if (m.type === "trade")
    result = signTrade(s, m.partner, m.exportGood, m.importGood, 5);
  if (m.type === "peace") result = peace(s, m.partner);
  if (m.type === "alliance") {
    if (s.alliances.includes(m.partner))
      return { error: "You are already allied." };
    result = alliance(s, m.partner);
  }
  if (m.type === "aid") {
    if (s.stock.food < 20) return { error: "Aid requires 20 food." };
    s.stock.food -= 20;
    s.relations[m.partner] = clamp(s.relations[m.partner] + 12);
    s.treasury += 120;
  }
  if (m.type === "research") {
    if (s.treasury < 250)
      return { error: "Joint research requires 250 credits." };
    s.treasury -= 250;
    s.stock.science = Math.min(9999, s.stock.science + 25);
    s.relations[m.partner] = clamp(s.relations[m.partner] + 8);
  }
  if (m.type === "culture") {
    if (s.treasury < 100)
      return { error: "A cultural exchange requires 100 credits." };
    s.treasury -= 100;
    s.relations[m.partner] = clamp(s.relations[m.partner] + 15);
  }
  if (result.error) return result;
  m.status = "accepted";
  event(s, `You accepted ${m.name}'s ${m.type} proposal.`, "diplomacy");
  return {};
}
export function investCity(s, countryId, cityName, service) {
  ensureDiplomacy(s);
  const tile = s.tiles.find((t) => t.id === countryId),
    hub = tile?.hubs?.find((c) => c.name === cityName);
  if (!hub || tile.owner !== (s.player || "willow"))
    return { error: "Choose a real city in your territory." };
  if (!["health", "housing", "transport"].includes(service))
    return { error: "Choose a city service." };
  const key = countryId + ":" + cityName,
    project = s.cityProjects[key] || { health: 0, housing: 0, transport: 0 };
  if (project[service] >= 5)
    return { error: "This service is already fully upgraded." };
  const cost = 200 * (project[service] + 1);
  if (s.treasury < cost || s.stock.metal < 5)
    return { error: `This project needs ${cost} credits and 5 metal.` };
  s.treasury -= cost;
  s.stock.metal -= 5;
  project[service]++;
  s.cityProjects[key] = project;
  event(
    s,
    `${cityName} upgraded ${service} to level ${project[service]}.`,
    "city",
  );
  return { project };
}

function validateInteractions(s) {
  if (
    s.inbox !== undefined &&
    (!Array.isArray(s.inbox) ||
      s.inbox.length > 20 ||
      new Set(s.inbox.map((m) => m?.id)).size !== s.inbox.length ||
      !s.inbox.every(
        (m) =>
          m &&
          Number.isInteger(m.id) &&
          m.id > 0 &&
          Object.hasOwn(s.relations || {}, m.partner) &&
          typeof m.name === "string" &&
          m.name.length < 100 &&
          ["trade", "aid", "research", "culture", "alliance", "peace"].includes(
            m.type,
          ) &&
          ["pending", "accepted", "declined", "expired"].includes(m.status) &&
          Number.isFinite(m.expires) &&
          GOODS.includes(m.exportGood) &&
          GOODS.includes(m.importGood),
      ))
  )
    return false;
  if (
    ["diplomacyClock", "diplomacyTurn"].some(
      (k) => s[k] !== undefined && (!Number.isFinite(s[k]) || s[k] < 0),
    )
  )
    return false;
  if (
    s.cityProjects !== undefined &&
    (!s.cityProjects ||
      typeof s.cityProjects !== "object" ||
      Array.isArray(s.cityProjects) ||
      !Object.entries(s.cityProjects).every(
        ([key, p]) =>
          s.tiles?.some((t) =>
            t.hubs?.some((h) => key === t.id + ":" + h.name),
          ) &&
          p &&
          ["health", "housing", "transport"].every(
            (k) => Number.isInteger(p[k]) && p[k] >= 0 && p[k] <= 5,
          ),
      ))
  )
    return false;
  return true;
}
