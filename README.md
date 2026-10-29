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

Seven automated tests cover area effects, stat bounds, save validation, safe text rendering, zero-time movement, and fast-forward routing. GitHub Actions runs syntax checks and tests on pushes and pull requests.

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
