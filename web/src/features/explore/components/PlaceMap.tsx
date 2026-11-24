import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function PlaceMap({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      className="explore-map"
      aria-label={`Vị trí ${name}`}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <CircleMarker
        center={[lat, lng]}
        radius={10}
        pathOptions={{
          color: '#fff',
          weight: 3,
          fillColor: '#fa8b02',
          fillOpacity: 1,
        }}
      >
        <Popup>{name}</Popup>
      </CircleMarker>
    </MapContainer>
  );
}
