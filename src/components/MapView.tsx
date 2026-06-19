/** Interactive map — deck.gl + MapLibre GL */

import { useState, useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer, GeoJsonLayer, LineLayer, PathLayer, IconLayer } from '@deck.gl/layers';
import { useLayerStore } from '../store/layers';
import { useWorkspaceStore } from '../store/workspace';
import { useDataFetch } from '../hooks/useDataFetch';
import { severityColor } from '../utils/formatters';
import { MapSearch } from './MapSearch';

interface MapViewProps {
  onCountryClick: (countryCode: string | null, countryName: string | null) => void;
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
  const { data: disasters } = useDataFetch<any[]>('/api/disasters', 600000);
  const { data: flights } = useDataFetch<any[]>('/api/flights', 60000);
  const { data: conflicts } = useDataFetch<any[]>('/api/conflicts', 300000);
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



    overlayRef.current.setProps({ layers });
  }, [enabledLayers, earthquakes, disasters, flights, conflicts, flightTrack, onCountryClick]);

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

  const handleSearchSelect = useCallback((center: [number, number], id?: string, name?: string) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center,
        zoom: 4,
        duration: 1500,
      });
    }
    if (id && name) {
      onCountryClick(id, name);
    }
  }, [onCountryClick]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <MapSearch 
        onSelect={handleSearchSelect} 
        onClear={() => onCountryClick(null, null)} 
      />
    </div>
  );
}
