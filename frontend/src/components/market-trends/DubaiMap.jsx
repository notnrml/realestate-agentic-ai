<<<<<<< HEAD
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
=======
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
>>>>>>> origin/main
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import { FaArrowUp, FaArrowDown, FaArrowRight, FaMapMarkerAlt, FaRobot, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';

<<<<<<< HEAD
// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

=======
>>>>>>> origin/main
// Map of icon names to React Icon components
const iconMap = {
  'arrow-up': FaArrowUp,
  'arrow-down': FaArrowDown,
  'arrow-right': FaArrowRight,
  'robot': FaRobot,
  'exclamation-triangle': FaExclamationTriangle,
  'chart-line': FaChartLine
};

<<<<<<< HEAD
// Mock data for initial render
const mockOverlays = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [55.2708, 25.2048]
      },
      properties: {
        name: "Dubai Marina",
        icon: "arrow-up",
        color: "#10B981",
        alertIndex: 0,
        metrics: {
          price_change: 5.2,
          demand: "high",
          risk_level: "low"
        }
      }
    }
  ]
};

export default function DubaiMap() {
  const [overlays, setOverlays] = useState(mockOverlays);
=======
export default function DubaiMap() {
  const [overlays, setOverlays] = useState(null);
>>>>>>> origin/main

  useEffect(() => {
    fetch('http://localhost:8000/market-trends/overlays')
      .then(res => res.json())
      .then(data => {
        setOverlays(data); // Store the GeoJSON data
      })
<<<<<<< HEAD
      .catch(err => {
        console.error("Failed to fetch overlays:", err);
        // Keep using mock data if fetch fails
      });
  }, []);

  return (
    <div className="h-full w-full relative" style={{ minHeight: '660px' }}>
      <MapContainer
        center={[25.2048, 55.2708]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, background: '#1F2937' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />

        {overlays?.features?.map((feature, idx) => {
          const [lng, lat] = feature.geometry.coordinates;
          const { icon: iconName, color, alertIndex, name, metrics } = feature.properties;
          const IconComponent = iconMap[iconName] || FaMapMarkerAlt;
          const markerIcon = L.divIcon({
            html: ReactDOMServer.renderToString(
              <div className="relative">
                <IconComponent style={{ color, fontSize: '24px' }} />
              </div>
            ),
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          
=======
      .catch(err => console.error("Failed to fetch overlays:", err));
  }, []);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[25.2048, 55.2708]}
        zoom={12}
        className="h-full w-full" // Uses Tailwind to ensure it fills parent container
      >
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  attribution='&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
/>

        {overlays && overlays.features.map((feature, idx) => {
          const [lng, lat] = feature.geometry.coordinates;
          const { icon: iconName, color, alertIndex } = feature.properties;
          const IconComponent = iconMap[iconName] || FaMapMarkerAlt;
          const markerIcon = L.divIcon({
            html: ReactDOMServer.renderToString(
              <span><IconComponent style={{ color, fontSize: '24px' }} /></span>
            ),
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 24]
          });
>>>>>>> origin/main
          return (
            <Marker
              key={idx}
              position={[lat, lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  const el = document.getElementById(`alert-${alertIndex}`);
                  if (el) {
<<<<<<< HEAD
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
=======
                    // Scroll into view first
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // After scroll, trigger pop animation (delay roughly matches scroll duration)
>>>>>>> origin/main
                    setTimeout(() => {
                      el.classList.add('alert-pop');
                      setTimeout(() => el.classList.remove('alert-pop'), 400);
                    }, 500);
                  }
                }
              }}
<<<<<<< HEAD
            >
              <Tooltip 
                direction="top" 
                offset={[0, -10]} 
                opacity={1}
                permanent={false}
                className="custom-tooltip"
              >
                <div className="font-medium text-sm">
                  <div className="font-bold mb-1">{name}</div>
                  <div className={`flex items-center ${metrics.price_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.price_change >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                    <span>{Math.abs(metrics.price_change)}% price change</span>
                  </div>
                  <div className="text-xs mt-1">
                    <span className="text-slate-400">Demand:</span> <span className="text-white">{metrics.demand}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">Risk Level:</span> <span className="text-white">{metrics.risk_level}</span>
                  </div>
                </div>
              </Tooltip>
            </Marker>
=======
            />
>>>>>>> origin/main
          );
        })}
      </MapContainer>
    </div>
  );
}
