import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorld,
  validateWorld,
  NATIONS,
  nationStats,
  neighbors,
  adjacentOwned,
  claim,
  develop,
  recruit,
  transfer,
  declareWar,
  peace,
  gift,
  alliance,
  signTrade,
  attack,
  research,
  advanceWorld,
} from "../world-simulation.js";
const border = (s) => {
  const source = s.tiles.find(
    (t) =>
      t.owner === "willow" && s.tiles.some((v) => !v.owner && neighbors(t, v)),
  );
  return {
    source,
    target: s.tiles.find((t) => !t.owner && neighbors(source, t)),
  };
};
const battlefield = () => {
  const s = createWorld(),
    { source, target } = border(s);
  source.troops = 100;
  target.owner = "solara";
  target.troops = 15;
  target.city = 1;
  return { s, source, target };
};

test("the whole world starts with six nations at peace and a valid save", () => {
  const s = createWorld();
  assert.equal(s.tiles.length, 148);
  assert.equal(validateWorld(s), true);
  assert.deepEqual(s.wars, []);
  NATIONS.forEach((n) => assert.ok(nationStats(s, n.id).territories > 0));
});
test("peaceful claims require eligible neutral land and charge only on success", () => {
  const s = createWorld(),
    { target } = border(s),
    cash = s.treasury;
  assert.ok(claim(s, target.id).tile);
  assert.equal(target.owner, "willow");
  assert.equal(s.treasury, cash - 180);
  assert.ok(claim(s, target.id).error);
  assert.equal(s.treasury, cash - 180);
});
test("development, recruitment and transfers consume real resources and retain a garrison", () => {
  const s = createWorld(),
    source = s.tiles.find((t) => t.owner === "willow"),
    target = s.tiles.find((t) => t.owner === "willow" && neighbors(t, source)),
    before = source.city;
  assert.ok(develop(s, source.id).tile);
  assert.equal(source.city, before + 1);
  assert.equal(s.stock.metal, 70);
  recruit(s, source.id);
  const troops = source.troops;
  assert.ok(!transfer(s, source.id, target.id, 10).error);
  assert.equal(source.troops, troops - 10);
  assert.ok(transfer(s, source.id, target.id, source.troops).error);
});
test("trade exchanges resources and earns revenue on recurring shipments", () => {
  const s = createWorld();
  assert.ok(signTrade(s, "aurora", "food", "metal", 5).route);
  const beforeFood = s.stock.food,
    beforeMetal = s.stock.metal;
  const production = (g) =>
    s.tiles
      .filter((t) => t.owner === "willow" && t.resource === g)
      .reduce((n, t) => n + 1 + t.city * 0.5, 0);
  advanceWorld(s, 15);
  assert.equal(s.trades[0].shipments, 1);
  assert.equal(s.stock.food, beforeFood + production("food") - 5);
  assert.equal(s.stock.metal, beforeMetal + production("metal") + 5);
  assert.equal(s.relations.aurora, 46);
});
test("trade pauses when exports are missing and cannot cross a war declaration", () => {
  const s = createWorld();
  signTrade(s, "aurora", "food", "metal", 20);
  s.stock.food = 0;
  s.tiles
    .filter((t) => t.owner === "willow" && t.resource === "food")
    .forEach((t) => (t.resource = "science"));
  advanceWorld(s, 15);
  assert.match(s.trades[0].status, /Paused/);
  declareWar(s, "aurora");
  assert.equal(s.trades.length, 0);
  assert.ok(signTrade(s, "aurora", "food", "metal", 1).error);
});
test("an attack needs an explicit war and victorious campaigns change ownership", () => {
  const { s, source, target } = battlefield();
  assert.ok(attack(s, source.id, target.id, 40).error);
  declareWar(s, "solara");
  assert.ok(attack(s, source.id, target.id, 40).battle);
  assert.equal(source.troops, 60);
  advanceWorld(s, 30);
  assert.equal(target.owner, "willow");
  assert.equal(target.city, 0);
  assert.equal(s.battles.length, 0);
});
test("a failed attack leaves the defenders in control", () => {
  const { s, source, target } = battlefield();
  target.troops = 100;
  declareWar(s, "solara");
  attack(s, source.id, target.id, 10);
  advanceWorld(s, 30);
  assert.equal(target.owner, "solara");
  assert.ok(target.troops > 0);
});
test("peace withdraws campaigns and returns deployed forces", () => {
  const { s, source, target } = battlefield();
  declareWar(s, "solara");
  attack(s, source.id, target.id, 40);
  assert.equal(source.troops, 60);
  peace(s, "solara");
  assert.equal(s.battles.length, 0);
  assert.equal(source.troops, 100);
  assert.equal(s.wars.length, 0);
  assert.equal(target.owner, "solara");
});
test("alliances require diplomatic relations and prevent an accidental war", () => {
  const s = createWorld();
  assert.ok(alliance(s, "aurora").error);
  gift(s, "aurora");
  gift(s, "aurora");
  assert.ok(!alliance(s, "aurora").error);
  assert.ok(declareWar(s, "aurora").error);
  alliance(s, "aurora");
  assert.ok(!declareWar(s, "aurora").error);
});
test("navigation technology unlocks remote territorial claims", () => {
  const s = createWorld(),
    remote = s.tiles.find((t) => !t.owner && !adjacentOwned(s, t));
  assert.ok(claim(s, remote.id).error);
  research(s, "navigation");
  advanceWorld(s, 35);
  assert.ok(s.completed.includes("navigation"));
  assert.ok(claim(s, remote.id).tile);
});
test("world saves keep treaties, armies, research and borders and reject duplicate land", () => {
  const s = createWorld();
  signTrade(s, "aurora", "food", "metal", 5);
  research(s, "logistics");
  const copy = JSON.parse(JSON.stringify(s));
  assert.equal(validateWorld(copy), true);
  copy.tiles[1].id = copy.tiles[0].id;
  assert.equal(validateWorld(copy), false);
});

test("countries mobilize and counterattack only after the player declares war", () => {
  const { s, source, target } = battlefield();
  target.troops = 90;
  advanceWorld(s, 40);
  assert.equal(s.battles.length, 0);
  declareWar(s, "solara");
  advanceWorld(s, 40);
  assert.ok(
    s.battles.some(
      (b) =>
        b.attacker === "solara" &&
        s.tiles.find((t) => t.id === b.target).owner === "willow",
    ),
  );
});
