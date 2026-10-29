# Little World · God Mode

A living town in your hands. Shape the skies, create people, and see the consequences of every little intervention.

A dependency-free browser sandbox built with JavaScript, Canvas, and a small Node.js development server.

## Run

Requires Node.js 20 or newer. No installation or API key required.

```sh
npm run dev
```

Open **http://127.0.0.1:3000**. Optional environment variables: `PORT` (default `3000`) and `HOST` (default `127.0.0.1`). The browser files can also be served by any static web server.

## Your powers

| Power | What happens |
| --- | --- |
| Sunshine, rain, storms, snow | Animated weather with adjustable intensity. People react, seek shelter, and remember the change. Storms periodically strike lightning. |
| Lightning brush | Click the map to strike. People within range lose health and energy and flee home. |
| Grow trees | Plant up to 150 trees on the map. Your forest survives a reload. |
| Bless brush | Restore nearby residents' health, energy, fullness, and social needs. |
| Teleport | Pick a resident and click land to move them instantly. |
| Heal everyone | Restore the town's health and energy. |
| Send a feast | Restore fullness and bring everyone to the market. |
| Gather the town | Summon everyone to the park to form new connections. |
| Create a resident | Give someone a name, age, role, biography, color, and favorite place. Up to 40 residents. |
| Control time | Pause, run at 1×/2×/5×/20×, set the hour, or skip to the next morning. |

Click a resident on the map or in the resident list for their biography, personality, live needs, relationships, and memories. Say hello, offer a snack, suggest rest, heal them, or send them to a particular place. Click a building to see its occupants or summon everyone there.

## Saving

Your people, relationships, memories, journal, planted trees, weather, time, and simulation settings autosave in this browser. **Save world** saves immediately. Saved data is checked before restoring. **New beginning** starts over and replaces the local save. Saves are specific to the browser and origin; clearing browser data removes them. There is no cloud sync or offline time progression.

## Checks

```sh
npm run check
npm test
```

Thirty-five automated tests cover Earth geography, world diplomacy and battles, city construction and research, area effects, stat bounds, save validation, safe text rendering, zero-time movement, and fast-forward routing. GitHub Actions runs syntax checks and tests on pushes and pull requests.

The browser was also used to verify weather reactions, custom resident creation, saving and reloading, lightning damage and memories, healing, time controls, and map interactions.

## How the residents work

Residents follow routines and need-based decisions, walk along routes, rest and eat, and build relationships through encounters. Actions create memories. Low energy and hunger affect health. A god can always heal them.

Behavior and contextual dialogue run locally. This version does **not** call a language model. Future extensions could add model-backed dialogue, long-term plans, new neighborhoods, and shared worlds.

## Files

- `app.js`: residents, movement, town rendering, profile interactions, simulation loop
- `god-mode.js`: divine powers, weather, creation, time editing, and persistence
- `simulation.js`: pure simulation rules and save validation
- `style.css` / `index.html`: responsive interface and accessible controls
- `server.js`: local server with an explicit public-file allowlist
- `tests/simulation.test.js`: simulation regression tests

## Cities & Civilization (v0.3)

The new **City region** view is a city builder with six connected cities, 36 building plots, 16 building types, and upgrades to level 5. The original town and its named residents remain available through **Original town**.

- **Build:** choose a blueprint, press **Build on the map**, and click an empty `+` plot. **Expand region** purchases the next city. Inspect buildings to upgrade them. Housing raises aggregate city population; commercial buildings generate income; clinics, parks, labs, and defenses provide services.
- **Research:** 12 projects cover healthcare, construction, energy, transit, electric vehicles, agriculture, education, veterinary care, civil resilience, diplomacy, and automation. Labs and funding determine progress. Discoveries unlock hospitals, skyscrapers, solar farms, universities, transit stations, and defense headquarters, or improve city stats. Research is a fictional game mechanic, not real scientific work.
- **City Hall:** set taxes, healthcare funding, research funding, and traffic density. Cars move through the region; transit and electric mobility research change the traffic. Higher taxes increase revenue and lower happiness. Services cost credits.
- **Cats & dogs:** adopt up to 40 pets. Each has a name, home city, health, an animated map presence, and an inspectable profile. Feed and care for them directly.
- **Diplomacy:** declare conflict with fictional neighbors, invest in defenses, negotiate peace, and repair the region. Conflict lowers trade income, health, and happiness and damages buildings over time. It does not automatically result in victory or conquest.
- **Divine powers:** expand the drawer for weather and miracles. Targeted resident powers switch to the original town so their targets match the map. **Grant 5,000 credits** funds sandbox experiments.
- **City guide:** the `? City guide` button explains each control inside the app.

The city population is an aggregate model; named residents retain their individual profiles and memories. City state, research, buildings, policies, conflict, and pets autosave separately alongside the original world. There is no cloud sync or offline progression. **New beginning** resets both.

The automated suite now contains 14 tests, including expansion costs, occupied plots, research prerequisites, unlocks, building upgrades, conflict effects, and city save validation. Browser checks cover construction, research completion, adoption, peace negotiations, and repairs.

## Nations & Territories (v0.4)

The **World map** adds a separate strategy layer: an original simplified world silhouette with **148 hex territories and six fictional nations**. Lead the Willow Republic from peace, trade and alliances, or choose war. The world map is not a map of real countries or geopolitical predictions.

### Territory and city control

Click a hex to inspect its owner, produced resource, city level, population, and troops. Claim adjacent neutral territory for 180 national credits. Develop owned cities up to level 5, recruit troops, and transfer forces while retaining a five-unit garrison. **Ocean navigation** unlocks remote claims, transfers, and expeditions. **Manage your cities** opens the existing detailed city builder.

National treasury and stockpiles support territorial development, diplomacy, armies, and trade. The City region retains its municipal budget, detailed buildings, pets, and city research. Both layers progress under the same pause and speed controls and retain their own saved state.

### Trade and diplomacy

Use **World trade** to choose a country, export resource, import resource, and shipment size. Agreements exchange resources 1:1 every 15 simulation seconds and earn revenue. Routes pause if exports are insufficient or a partner no longer has territory. Other countries act as suppliers capable of fulfilling accepted exchanges; they do not simulate separate depleting stockpiles. Trade lines and moving ships appear on the map.

Gifts improve relations, and 65 relations permit an alliance. Alliances block war declarations until ended. Countries begin at peace and do not invade the player unless the player chooses war.

### Optional campaigns

**Diplomacy → Declare war** opens a second deliberate choice. War ends trade with that country and enables both invasions and counterattacks. Select enemy land, choose a staging territory, recruit there if needed, and send forces. Troops must exceed the displayed defender strength to win. City levels and territorial-defense technology improve defense. Battles resolve over 30 simulation seconds. Captured cities lose a level and ownership changes on the map. Defeated forces are lost; enemy countries mobilize and can counterattack.

Negotiate peace for 200 credits to stop campaigns, return surviving deployed forces, and keep current borders. Conquest is not required to progress.

### World technology and persistence

Six national technologies cover navigation, trade logistics, agriculture, energy, defense, and civic institutions. They complement the city builder’s broader 12-project research tree. Discovery requires both national credits and science and progresses with simulation time.

The new **World guide** explains the controls in the app. Ownership, troops, active battles, treaties, trade routes, stockpiles, and technologies autosave in this browser. Reloading preserves the campaign; no offline progress is simulated. **Grant resources** provides sandbox funding. **New beginning** resets all three layers.

The suite now includes **26 tests**, including trade shipments and shortages, war authorization, capture and defeat, peace withdrawals, alliances, counterattacks, technology unlocks, and world save validation. Browser verification also covers actual shipments, recruitment, conquest, counterattacks, peace, and an alliance.

## Earth (v0.5)

The world view now uses **real Earth geography** rather than the original hex silhouette:

- **242 mapped countries and regions**, including protected Antarctica; 241 playable country/region identities.
- **NASA Blue Marble** terrain and **Natural Earth 1:50m** boundaries, with **542 real city markers**, including capitals and smaller mapped countries such as Singapore.
- **Satellite, Political, Population, and Resources** map layers, country search, geographic selection, focus, mouse-wheel zoom, + / − controls, and drag-to-pan. A simulated day/night overlay is optional.
- Country details show real geographic region, mapped capital/city hubs, historical source-population estimates, and a clearly labeled game biome.
- Land movement uses shared geographic borders. Overseas campaigns require Ocean navigation.
- **Change country** starts a new peaceful Earth campaign as the selected country or region. **Restore previous** restores the backed-up Earth campaign without touching the town or city-builder saves.
- Geography, boundaries, and historic population inputs come from source data; resource output, military forces, diplomacy, development, and wars remain fictional game rules. New campaigns do not reproduce real current conflicts or alliances.

See [data/SOURCES.md](data/SOURCES.md) for asset credits, exact input URLs, derivation details, and what is real versus simulated. The basemap and geography are bundled locally. Rendering caches the terrain and country fills, while selected boundaries and zoomed outlines remain vector-based.

To rebuild `earth-data.js`, download the two 50m Natural Earth GeoJSON inputs linked in the sources document to `/tmp/earth-countries.geojson` and `/tmp/earth-cities.geojson`, then run `python3 scripts/prepare-earth.py`.

There are now **35 automated tests**. The Earth tests verify real coastline picking (including Singapore), projection round trips, actual land neighbors, starting as different countries, development, foreign trade, fictional combat, protected Antarctica, and preserving gameplay across geography updates. Browser checks cover Earth rendering, Japan/Thailand focus, campaign switching and restoring, and the map controls.

## GitHub Pages deployment

`npm run build` creates a static `dist/` directory. The GitHub Pages workflow checks the code, runs the tests, and deploys that directory on pushes to `main` or manual workflow runs. In repository **Settings → Pages**, select **GitHub Actions** as the source. GitHub Free requires a public repository for Pages; a private source repository requires an eligible paid plan. Saved games remain local to each visitor's browser.
