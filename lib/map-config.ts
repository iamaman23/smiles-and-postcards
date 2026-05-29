import type { StyleSpecification } from "maplibre-gl";

export const MAP_VIEWS = {
  standard: {
    id: "standard",
    label: "Map",
    style: {
      version: 8,
      sources: {
        "standard-raster": {
          type: "raster",
          tiles: [
            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      },
      layers: [
        {
          id: "standard-raster-base",
          type: "raster",
          source: "standard-raster",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    } satisfies StyleSpecification
  },
  satellite: {
    id: "satellite",
    label: "Satellite",
    style: {
      version: 8,
      sources: {
        "satellite-raster": {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          ],
          tileSize: 256,
          attribution: 'Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
        }
      },
      layers: [
        {
          id: "satellite-raster-base",
          type: "raster",
          source: "satellite-raster",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    } satisfies StyleSpecification
  }
} as const;

export type MapViewId = keyof typeof MAP_VIEWS;

export const DEFAULT_MAP_VIEW: MapViewId = "standard";
