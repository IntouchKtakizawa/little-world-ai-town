# Little World / AI Town

A browser sandbox with individual residents, a city builder, and an Earth strategy map. Change the weather, shape settlements, and explore how local simulation rules interact.

[Play in your browser](https://intouchktakizawa.github.io/little-world-ai-town/) · [Gameplay guide](docs/gameplay.md) · [Geography and asset credits](data/SOURCES.md)

Despite the repository's AI Town name, the current version uses **local, rule-based simulation and contextual dialogue**. It does not call a language model or need an API key.

## Features

- Residents with routines, needs, relationships, memories, and editable profiles.
- Weather and intervention tools, including planting, healing, and time controls.
- City construction, upgrades, research, policies, and pets.
- Earth geography with country selection, cities, development, trade, and simulated diplomacy.
- Optional fictional conflict mechanics and a diplomatic inbox.
- Validated browser saves, campaign switching, and restoration of the previous Earth campaign.

## Stack

JavaScript ES modules, HTML/CSS, Canvas, browser local storage, and a small Node.js development server. No third-party npm dependencies are required. Earth assets are bundled locally; see [source and attribution details](data/SOURCES.md).

## Run locally

Requires **Node.js 20+**:

```sh
git clone https://github.com/IntouchKtakizawa/little-world-ai-town.git
cd little-world-ai-town
npm run dev
```

Open **http://127.0.0.1:3000**. Optional `HOST` and `PORT` environment variables change the listening address and port. Any static web server can also serve the browser files.

## Checks and build

```sh
npm run check
npm test
npm run build
```

The build writes the static site to `dist/`. GitHub Actions checks and tests the code and deploys the static build to Pages. Tests cover simulation rules, interactions, save validation, city systems, geography, and world systems.

## Code guide

- `app.js`, `god-mode.js`, `simulation.js`: town UI, interactions, and simulation rules
- `city-mode.js`, `city-simulation.js`: city interface and state changes
- `world-mode.js`, `world-simulation.js`: world interface, diplomacy, and strategy rules
- `earth-geography.js`, `earth-renderer.js`, `earth-data.js`: geographic lookup, rendering, and data
- `server.js`: development server with an explicit public-file allowlist
- `tests/`: automated regression tests

## Status and limitations

Personal simulation project with town, city, and Earth modes. Saved games belong to this browser and origin; clearing browser data removes them. There is no cloud sync or offline progression.

Geography uses real source data, while resource production, service ratings, military forces, diplomacy, and conflicts are fictional game systems. They are not current geopolitical data or predictions. The [gameplay guide](docs/gameplay.md) documents individual controls, save behavior, and the feature history.
