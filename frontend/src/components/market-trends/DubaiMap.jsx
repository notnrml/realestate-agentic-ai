import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import { FaArrowUp, FaArrowDown, FaArrowRight, FaMapMarkerAlt, FaRobot, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';

// Map of icon names to React Icon components
const iconMap = {
  'ai-insight': FaRobot,
  'oversaturation': FaExclamationTriangle,
  'trend': FaChartLine
};

export default function DubaiMap() {
  const [overlays, setOverlays] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/market-trends/overlays')
      .then(res => res.json())
      .then(data => {
        setOverlays(data); // Store the GeoJSON data
      })
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
          const { type, color, alertIndex } = feature.properties;
          // Map alert 'type' directly to the right icon
          const IconComponent = iconMap[type] || FaMapMarkerAlt;
          const markerIcon = L.divIcon({
            html: ReactDOMServer.renderToString(
              <span><IconComponent style={{ color, fontSize: '24px' }} /></span>
            ),
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 24]
          });
          return (
            <Marker
              key={idx}
              position={[lat, lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  const el = document.getElementById(`alert-${alertIndex}`);
                  if (el) {
                    // Scroll into view first
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // After scroll, trigger pop animation (delay roughly matches scroll duration)
                    setTimeout(() => {
                      el.classList.add('alert-pop');
                      setTimeout(() => el.classList.remove('alert-pop'), 400);
                    }, 500);
                  }
                }
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
