import test from "node:test";
import assert from "node:assert/strict";
import {
  createEarthWorld,
  advanceWorld,
  respondDiplomacy,
  investCity,
  nationStats,
  validateWorld,
  upgradeEarthWorld,
} from "../world-simulation.js";

test("countries initiate proposals without player action or starting wars", () => {
  const s = createEarthWorld("THA");
  advanceWorld(s, 20);
  assert.equal(s.inbox.length, 1);
  assert.equal(s.inbox[0].status, "pending");
  assert.equal(s.inbox[0].type, "trade");
  assert.equal(s.wars.length, 0);
  const offer = s.inbox[0];
  assert.ok(!respondDiplomacy(s, offer.id, true).error);
  assert.equal(s.trades[0].partner, offer.partner);
  const before = s.treasury;
  assert.ok(respondDiplomacy(s, offer.id, true).error);
  assert.equal(s.treasury, before);
  advanceWorld(s, 15);
  assert.equal(s.trades[0].shipments, 1);
});
test("failed proposals preserve resources and can be declined; old offers expire", () => {
  const s = createEarthWorld();
  advanceWorld(s, 65);
  const aid = s.inbox.find((m) => m.type === "aid");
  s.stock.food = 0;
  const money = s.treasury;
  assert.ok(respondDiplomacy(s, aid.id, true).error);
  assert.equal(s.treasury, money);
  assert.equal(aid.status, "pending");
  assert.ok(!respondDiplomacy(s, aid.id, false).error);
  assert.equal(aid.status, "declined");
  const first = s.inbox.find((m) => m.status === "pending");
  advanceWorld(s, 120);
  advanceWorld(s, 120);
  assert.equal(first.status, "expired");
  assert.ok(respondDiplomacy(s, first.id, true).error);
  assert.ok(s.inbox.filter((m) => m.status === "pending").length <= 4);
});
test("joint research and aid have the promised economic effects", () => {
  const s = createEarthWorld();
  advanceWorld(s, 110);
  const research = s.inbox.find((m) => m.type === "research"),
    aid = s.inbox.find((m) => m.type === "aid");
  const science = s.stock.science,
    money = s.treasury,
    food = s.stock.food;
  respondDiplomacy(s, research.id, true);
  assert.equal(s.stock.science, science + 25);
  assert.equal(s.treasury, money - 250);
  respondDiplomacy(s, aid.id, true);
  assert.equal(s.stock.food, food - 20);
  assert.equal(s.treasury, money - 250 + 120);
});
test("real city investments consume budget, improve output, and survive save migration", () => {
  const s = createEarthWorld("THA"),
    before = nationStats(s).income;
  assert.ok(investCity(s, "JPN", "Tokyo", "transport").error);
  assert.ok(investCity(s, "THA", "Imaginary City", "health").error);
  const budget = s.treasury;
  investCity(s, "THA", "Bangkok", "transport");
  assert.equal(s.treasury, budget - 200);
  assert.equal(nationStats(s).income, before + 3);
  investCity(s, "THA", "Bangkok", "health");
  const science = s.stock.science;
  advanceWorld(s, 10);
  assert.ok(s.stock.science > science);
  const restored = upgradeEarthWorld(JSON.parse(JSON.stringify(s)));
  assert.ok(validateWorld(restored));
  assert.equal(restored.cityProjects["THA:Bangkok"].transport, 1);
  restored.cityProjects["THA:Bangkok"].health = -1;
  assert.equal(validateWorld(restored), false);
});
test("alliance invitations cannot toggle an existing alliance and war invalidates peaceful offers", () => {
  const s = createEarthWorld();
  advanceWorld(s, 20);
  const offer = s.inbox[0];
  s.relations[offer.partner] = 70;
  offer.type = "alliance";
  respondDiplomacy(s, offer.id, true);
  assert.ok(s.alliances.includes(offer.partner));
  assert.ok(respondDiplomacy(s, offer.id, true).error);
  assert.ok(s.alliances.includes(offer.partner));
  advanceWorld(s, 45);
  const next = s.inbox.find((m) => m.status === "pending");
  s.wars.push(next.partner);
  const money = s.treasury;
  assert.ok(respondDiplomacy(s, next.id, true).error);
  assert.equal(s.treasury, money);
});
