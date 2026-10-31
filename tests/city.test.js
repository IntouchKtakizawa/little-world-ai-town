import test from "node:test";
import assert from "node:assert/strict";
import {
  createCityState,
  construct,
  expand,
  beginResearch,
  advanceCity,
  upgrade,
  cityStats,
  validateCity,
} from "../city-simulation.js";

test("expansion unlocks a new city and charges exactly once", () => {
  const s = createCityState(),
    before = s.treasury;
  assert.ok(construct(s, "shop", 2, 0).error);
  const r = expand(s);
  assert.equal(r.district, 2);
  assert.equal(s.treasury, before - 2300);
  assert.ok(construct(s, "shop", 2, 0).building);
});
test("occupied plots and locked technology cannot consume funds", () => {
  const s = createCityState(),
    before = s.treasury;
  assert.ok(construct(s, "shop", 0, 0).error);
  assert.ok(construct(s, "skyscraper", 0, 5).error);
  assert.equal(s.treasury, before);
});
test("research completes over simulation time and unlocks tall buildings", () => {
  const s = createCityState();
  assert.ok(beginResearch(s, "engineering").project);
  assert.ok(beginResearch(s, "medicine").error);
  const events = advanceCity(s, 50);
  assert.equal(events[0].id, "engineering");
  assert.ok(s.completed.includes("engineering"));
  assert.equal(s.activeResearch, null);
  assert.ok(construct(s, "skyscraper", 0, 5).building);
});
test("research prerequisites and funding control discovery progress", () => {
  const s = createCityState();
  assert.ok(beginResearch(s, "oncology").error);
  s.researchFunding = 0;
  assert.ok(beginResearch(s, "medicine").error);
  s.researchFunding = 70;
  beginResearch(s, "medicine");
  s.researchFunding = 0;
  advanceCity(s, 20);
  assert.equal(s.researchProgress, 0);
  s.researchFunding = 70;
  advanceCity(s, 45);
  assert.ok(s.completed.includes("medicine"));
  assert.ok(beginResearch(s, "oncology").project);
});
test("building upgrades increase housing and income without exceeding level 5", () => {
  const s = createCityState(),
    before = cityStats(s);
  upgrade(s, 1);
  assert.equal(s.buildings[0].level, 2);
  assert.ok(cityStats(s).population > before.population);
  assert.ok(cityStats(s).income > before.income);
  s.buildings[0].level = 5;
  const cash = s.treasury;
  assert.ok(upgrade(s, 1).error);
  assert.equal(s.treasury, cash);
});
test("conflict has economic and building consequences and defenses reduce damage", () => {
  const s = createCityState(),
    defended = createCityState(),
    peaceIncome = cityStats(s).income;
  s.conflict.active = true;
  defended.conflict.active = true;
  defended.completed.push("resilience");
  assert.ok(cityStats(s).income < peaceIncome);
  advanceCity(s, 60);
  advanceCity(defended, 60);
  assert.ok(s.buildings[0].integrity < 100);
  assert.ok(defended.buildings[0].integrity > s.buildings[0].integrity);
  const condition = s.buildings[0].integrity;
  s.conflict.active = false;
  advanceCity(s, 30);
  assert.equal(s.buildings[0].integrity, condition);
});
test("city saves preserve pets, policies, buildings, and discoveries", () => {
  const s = createCityState();
  s.tax = 14;
  s.completed.push("agriculture");
  const restored = JSON.parse(JSON.stringify(s));
  assert.equal(validateCity(restored), true);
  assert.equal(restored.pets[1].name, "Biscuit");
  assert.equal(restored.tax, 14);
  restored.buildings[1].slot = 0;
  assert.equal(validateCity(restored), false);
});
