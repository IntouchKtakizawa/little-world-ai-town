# Earth assets and provenance

Retrieved 2026-10-29. These bundled assets are served locally; the running game does not contact the providers.

## Natural Earth

- Country and region polygons: [Admin 0, 1:50 million](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/).
- [Source country GeoJSON](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson).
- [Source populated-place GeoJSON](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_populated_places_simple.geojson).
- [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/): map data is public domain.

`earth-data.js` is derived from those files using `scripts/prepare-earth.py`. It includes 242 mapped countries and regions (Antarctica included), 542 city markers (up to five per region), generalized boundaries rounded to four decimal places, source population estimates and their years, source GDP metadata, and land-neighbor relationships inferred from shared boundary vertices. Dependencies and regions are not necessarily sovereign states. Small-scale boundary data is a generalized cartographic reference, not an authoritative legal boundary determination.

Population estimates are historical (mostly 2019), not live population counts. Mapped city hubs are a selection of major places, not an exhaustive city census.

## NASA

- Terrain image: [Blue Marble, 2002](https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/).
- [Bundled 2048 × 1024 image source](https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.jpg).
- Credit: NASA Earth Observatory / NASA Goddard Space Flight Center, Blue Marble.
- [NASA image and media guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/).

The image is a historical composite, not a live satellite feed or current weather map. NASA logos are not used and no endorsement is implied.

## Game-derived values

Resources, broad biome labels, development levels, production, treasuries, military units, growth, day/night shading, trade, alliances, and conflict outcomes are game mechanics. Resource specialties and biome classes use simple geographic/economic heuristics and are not scientific climate classifications or factual export/mineral inventories. Every new campaign starts at peace and does not reproduce current international conflicts or alliances.

The town and City region keep their own municipal simulation and storage. Earth campaign data uses a new storage key, leaving earlier fictional-world, town, and city saves intact. Switching the country you lead creates a new Earth campaign and backs up the previous one in the same browser; Restore previous swaps them.
