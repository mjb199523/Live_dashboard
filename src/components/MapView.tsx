/** Interactive map — deck.gl + MapLibre GL */

import { useState, useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer, GeoJsonLayer, LineLayer, PathLayer, IconLayer } from '@deck.gl/layers';
import { useLayerStore } from '../store/layers';
import { useWorkspaceStore } from '../store/workspace';
import { useDataFetch } from '../hooks/useDataFetch';
import { severityColor, ciiColor } from '../utils/formatters';
import { MapSearch } from './MapSearch';

interface MapViewProps {
  onCountryClick: (countryCode: string | null) => void;
}

// Simplified CII GeoJSON type
interface CIIData {
  countryCode: string;
  countryName: string;
  score: number;
}

const AIRPLANE_ICON = {
  url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjZmZkNzAwIiBkPSJNMjEsMTZWMTRMMTMsOVYzLjVDMTMsMi42NyAxMi4zMywyIDExLjUsMkMxMC42NywyIDEwLDIuNjcgMTAsMy41VjlMMiwxNFYxNkwxMCwxMy41VjE5TDgsMjAuNVYyMkwxMS41LDIxTDE1LDIyVjIwLjVMMTMsMTlWMTMuNUwyMSwxNloiLz48L3N2Zz4=',
  width: 24,
  height: 24
};

export function MapView({ onCountryClick }: MapViewProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const enabledLayers = useLayerStore((s) => s.enabledLayers);
  const workspace = useWorkspaceStore((s) => s.activeWorkspace);

  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  // Data fetches
  const { data: earthquakes } = useDataFetch<any[]>('/api/earthquakes', 300000);
  const { data: wildfires } = useDataFetch<any[]>('/api/wildfires', 900000);
  const { data: disasters } = useDataFetch<any[]>('/api/disasters', 600000);
  const { data: flights } = useDataFetch<any[]>('/api/flights', 60000);
  const { data: conflicts } = useDataFetch<any[]>('/api/conflicts', 300000);
  const { data: pipelines } = useDataFetch<any[]>('/api/pipelines', 600000);
  const { data: ports } = useDataFetch<any[]>('/api/ports', 600000);
  const { data: storage } = useDataFetch<any[]>('/api/storage', 600000);
  const { data: ciiData } = useDataFetch<CIIData[]>('/api/cii', 900000);
  const { data: flightTrack } = useDataFetch<any>(
    selectedFlightId ? `/api/flights/${selectedFlightId}/track` : null,
    60000
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          },
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [workspace.defaultCenter[0], workspace.defaultCenter[1]],
      zoom: workspace.defaultZoom,
      maxZoom: 16,
      minZoom: 1.5,
    });

    const overlay = new MapboxOverlay({
      interleaved: false,
      layers: [],
    });

    map.addControl(overlay as unknown as maplibregl.IControl);
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    mapRef.current = map;
    overlayRef.current = overlay;

    return () => {
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  // Update layers when data or toggles change
  const updateLayers = useCallback(() => {
    if (!overlayRef.current) return;

    const layers: any[] = [];

    // Earthquake layer
    if (enabledLayers.has('earthquakes') && earthquakes?.length) {
      layers.push(
        new ScatterplotLayer({
          id: 'earthquakes',
          data: earthquakes,
          getPosition: (d: any) => [d.lng, d.lat],
          getRadius: (d: any) => Math.pow(2, (d.metadata?.magnitude || 3)) * 800,
          getFillColor: (d: any) => {
            const c = severityColor(d.severity);
            const r = parseInt(c.slice(1, 3), 16);
            const g = parseInt(c.slice(3, 5), 16);
            const b = parseInt(c.slice(5, 7), 16);
            return [r, g, b, 180];
          },
          radiusMinPixels: 4,
          radiusMaxPixels: 30,
          pickable: true,
          stroked: true,
          lineWidthMinPixels: 1,
          getLineColor: [255, 140, 0, 100],
        })
      );
    }

    // Wildfire layer
    if (enabledLayers.has('wildfires') && wildfires?.length) {
      layers.push(
        new ScatterplotLayer({
          id: 'wildfires',
          data: wildfires,
          getPosition: (d: any) => [d.lng, d.lat],
          getRadius: (d: any) => ((d.metadata?.frp as number) || 10) * 50 + 2000,
          getFillColor: [255, 68, 0, 160],
          radiusMinPixels: 3,
          radiusMaxPixels: 15,
          pickable: true,
        })
      );
    }

    // Disaster layer
    if (enabledLayers.has('disasters') && disasters?.length) {
      layers.push(
        new ScatterplotLayer({
          id: 'disasters',
          data: disasters,
          getPosition: (d: any) => [d.lng, d.lat],
          getRadius: 15000,
          getFillColor: [255, 215, 0, 180],
          radiusMinPixels: 6,
          radiusMaxPixels: 20,
          pickable: true,
          stroked: true,
          lineWidthMinPixels: 2,
          getLineColor: [255, 215, 0, 255],
        })
      );
    }

    // Flight layer (Airplanes)
    if (enabledLayers.has('flights') && flights?.length) {
      layers.push(
        new IconLayer({
          id: 'flights',
          data: flights,
          pickable: true,
          iconAtlas: AIRPLANE_ICON.url,
          iconMapping: {
            airplane: { x: 0, y: 0, width: 24, height: 24, mask: false }
          },
          getIcon: () => 'airplane',
          sizeScale: 1,
          getPosition: (d: any) => [d.lng, d.lat],
          getSize: 24,
          getAngle: (d: any) => d.heading,
          onClick: (info: any) => {
            if (info.object) {
              setSelectedFlightId(info.object.icao24);
            }
          },
        })
      );
    }

    // Flight route (if selected)
    if (enabledLayers.has('flights') && flightTrack?.path) {
      layers.push(
        new PathLayer({
          id: 'flight-route',
          data: [flightTrack],
          getPath: (d: any) => d.path,
          getColor: [0, 255, 136, 200],
          getWidth: 2,
          widthMinPixels: 2,
        })
      );
    }

    // Conflict layer
    if (enabledLayers.has('conflicts') && conflicts?.length) {
      layers.push(
        new ScatterplotLayer({
          id: 'conflicts',
          data: conflicts,
          getPosition: (d: any) => [d.lng, d.lat],
          getRadius: 20000,
          getFillColor: (d: any) => d.type === 'protest' ? [255, 215, 0, 180] : [255, 68, 68, 180],
          radiusMinPixels: 5,
          radiusMaxPixels: 14,
          pickable: true,
          stroked: true,
          lineWidthMinPixels: 1.5,
          getLineColor: (d: any) => d.type === 'protest' ? [255, 215, 0, 255] : [255, 68, 68, 255],
        })
      );
    }

    // Pipeline layer
    if (enabledLayers.has('pipelines') && pipelines?.length) {
      const lineData = pipelines.map((p: any) => ({
        ...p,
        path: p.coordinates.map((c: [number, number]) => [c[0], c[1]]),
      }));
      layers.push(
        new LineLayer({
          id: 'pipelines',
          data: lineData,
          getSourcePosition: (d: any) => d.path[0],
          getTargetPosition: (d: any) => d.path[d.path.length - 1],
          getColor: (d: any) => {
            switch (d.status) {
              case 'operational': return [168, 85, 247, 180];
              case 'reduced': return [255, 215, 0, 180];
              case 'disrupted': return [255, 68, 68, 200];
              case 'offline': return [107, 122, 141, 100];
              default: return [168, 85, 247, 120];
            }
          },
          getWidth: (d: any) => Math.max(1, Math.min(6, d.capacityBcfYr / 500)),
          widthMinPixels: 1,
          widthMaxPixels: 6,
          pickable: true,
        })
      );
    }

    // Ports layer
    if (enabledLayers.has('ports') && ports?.length) {
      layers.push(
        new ScatterplotLayer({
          id: 'ports',
          data: ports,
          getPosition: (d: any) => [d.lng, d.lat],
          getRadius: (d: any) => Math.sqrt(d.throughputMtpa) * 1500 + 5000,
          getFillColor: (d: any) => {
            switch (d.type) {
              case 'chokepoint': return [6, 182, 212, 200];
              case 'canal': return [59, 130, 246, 200];
              default: return [6, 182, 212, 140];
            }
          },
          radiusMinPixels: 4,
          radiusMaxPixels: 16,
          pickable: true,
          stroked: true,
          lineWidthMinPixels: 1,
          getLineColor: [6, 182, 212, 255],
        })
      );
    }

    // Storage layer
    if (enabledLayers.has('storage') && storage?.length) {
      layers.push(
        new ScatterplotLayer({
          id: 'storage',
          data: storage,
          getPosition: (d: any) => [d.lng, d.lat],
          getRadius: 12000,
          getFillColor: [59, 130, 246, 180],
          radiusMinPixels: 5,
          radiusMaxPixels: 12,
          pickable: true,
          stroked: true,
          lineWidthMinPixels: 1,
          getLineColor: [59, 130, 246, 255],
        })
      );
    }

    // CII Choropleth — simplified (circles per country)
    if (enabledLayers.has('cii') && ciiData?.length) {
      // Map country codes to approximate centroids for circle rendering
      const countryCentroids: Record<string, [number, number]> = {
        UKR: [31.2, 48.4], SYR: [38.0, 35.0], YEM: [48.0, 15.5], SDN: [30.0, 15.0],
        MMR: [96.0, 19.8], COD: [23.7, -2.5], SOM: [46.2, 5.2], AFG: [67.7, 33.9],
        LBY: [17.2, 26.3], IRQ: [43.7, 33.2], LBN: [35.8, 33.9], VEN: [-66.6, 6.4],
        HTI: [-72.3, 19.0], MOZ: [35.5, -18.7], ETH: [40.5, 9.1], NGA: [8.0, 10.0],
        PAK: [69.3, 30.4], BGD: [90.4, 23.7], GEO: [43.4, 42.3], IND: [78.9, 20.6],
        CHN: [104.2, 35.9], RUS: [105.3, 61.5], IRN: [53.7, 32.4], ISR: [34.9, 31.0],
        PSE: [35.2, 31.9], TUR: [35.2, 38.9], USA: [-95.7, 37.1], GBR: [-3.4, 55.4],
        DEU: [10.5, 51.2], FRA: [2.2, 46.2], BRA: [-51.9, -14.2], ARG: [-63.6, -38.4],
        CUB: [-77.8, 21.5], LKA: [80.8, 7.9], MLI: [-2.0, 17.6], BFA: [-1.6, 12.3],
        NER: [8.1, 17.6], CAF: [20.9, 6.6], TCD: [18.7, 15.5], JPN: [138.3, 36.2],
        AUS: [133.8, -25.3], KOR: [128.0, 35.9], PRK: [127.5, 40.3], IDN: [113.9, -0.8],
        MEX: [-102.6, 23.6], COL: [-74.3, 4.6], SAU: [45.1, 23.9], EGY: [30.8, 26.8],
        ZAF: [22.9, -30.6], POL: [19.1, 51.9], UZB: [64.6, 41.4], KAZ: [66.9, 48.0],
        TKM: [59.6, 38.9], CAN: [-106.3, 56.1], NOR: [8.5, 60.5], SWE: [18.6, 60.1],
        FIN: [25.7, 61.9], UGA: [32.3, 1.4], KEN: [37.9, -0.0], TZA: [34.9, -6.4],
      };

      const ciiCircleData = ciiData
        .filter((d) => countryCentroids[d.countryCode])
        .map((d) => ({
          ...d,
          position: countryCentroids[d.countryCode],
        }));

      layers.push(
        new ScatterplotLayer({
          id: 'cii',
          data: ciiCircleData,
          getPosition: (d: any) => d.position,
          getRadius: 80000,
          getFillColor: (d: any) => {
            const c = ciiColor(d.score);
            const r = parseInt(c.slice(1, 3), 16);
            const g = parseInt(c.slice(3, 5), 16);
            const b = parseInt(c.slice(5, 7), 16);
            return [r, g, b, 60];
          },
          radiusMinPixels: 12,
          radiusMaxPixels: 40,
          pickable: true,
          stroked: true,
          lineWidthMinPixels: 2,
          getLineColor: (d: any) => {
            const c = ciiColor(d.score);
            const r = parseInt(c.slice(1, 3), 16);
            const g = parseInt(c.slice(3, 5), 16);
            const b = parseInt(c.slice(5, 7), 16);
            return [r, g, b, 200];
          },
          onClick: (info: any) => {
            if (info.object) {
              onCountryClick(info.object.countryCode);
            }
          },
        })
      );
    }

    overlayRef.current.setProps({ layers });
  }, [enabledLayers, earthquakes, wildfires, disasters, flights, conflicts, pipelines, ports, storage, ciiData, flightTrack, onCountryClick]);

  useEffect(() => {
    updateLayers();
  }, [updateLayers]);

  // Fly to workspace default view when workspace changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [workspace.defaultCenter[0], workspace.defaultCenter[1]],
        zoom: workspace.defaultZoom,
        duration: 1500,
      });
    }
  }, [workspace.id]);

  const handleSearchSelect = useCallback((center: [number, number]) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center,
        zoom: 4,
        duration: 1500,
      });
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <MapSearch onSelect={handleSearchSelect} />
    </div>
  );
}
