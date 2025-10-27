import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { calculateSpeedKmH } from "./util";

const INITIAL_CENTER = [17.385044, 78.486671]; // THESE ARE THE COORDINATES OF RTC X ROADS METRO STATION

function VehicleMap() {
  const [routeData, setRouteData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const start = [78.495095, 17.4065539]; 
        const end = [78.45031, 17.42895]; //THESE ARE THE COORDINATES OF PANJAGUTTA METRO STATION

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`
        );

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat], i) => ({
            lat,
            lng,
            timestamp: new Date(Date.now() + i * 5000).toISOString(),
          }));
          setRouteData(coords);
        } else {
          console.error("No routes found");
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();
  }, []);

  useEffect(() => {
    if (isPlaying && routeData.length > 0 && currentIndex < routeData.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 2000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentIndex, routeData]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const currentPosition = routeData[currentIndex] || routeData[0];

 
  const vehicleIcon = L.divIcon({
    className: "text-2xl",
    html: '<span class="text-red-600 font-bold">🚗</span>',
    iconSize: [24, 24],
  });

  
  const destinationIcon = L.divIcon({
    className: "text-2xl",
    html: '<span class="text-blue-600 font-bold font-size-20">📍</span>',
    iconSize: [35, 35],
  });

  return (
    <div className="relative h-screen w-full">
      <MapContainer center={INITIAL_CENTER} zoom={14} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routeData.length > 0 && (
          <>
          
            <Polyline
              pathOptions={{ color: "#044ab3", weight: 4, opacity: 0.8 }}
              positions={routeData.map((p) => [p.lat, p.lng])}
            />

          
            <Polyline
              pathOptions={{ color: "green", weight: 5, opacity: 0.8 }}
              positions={routeData.slice(0, currentIndex + 1).map((p) => [p.lat, p.lng])}
            />

           
            <Marker position={[currentPosition.lat, currentPosition.lng]} icon={vehicleIcon} />

      
            <Marker
              position={[
                routeData[routeData.length - 1].lat,
                routeData[routeData.length - 1].lng,
              ]}
              icon={destinationIcon}
            />
          </>
        )}
      </MapContainer>

      
      <div className="absolute top-4 right-4 z-[1000] p-4 bg-white shadow-xl rounded-lg w-64">
        <h2 className="text-lg font-bold mb-2">Vehicle Status</h2>
        {currentPosition && (
          <>
            <p>
              <strong>Coordinates:</strong>{" "}
              {currentPosition.lat?.toFixed(6)}, {currentPosition.lng?.toFixed(6)}
            </p>
            <p>
              <strong>Timestamp:</strong>{" "}
              {new Date(currentPosition.timestamp).toLocaleTimeString()}
            </p>
            {currentIndex > 0 && (
              <p>
                <strong>Speed:</strong>{" "}
                {calculateSpeedKmH(routeData[currentIndex - 1], currentPosition).toFixed(2)} km/h
              </p>
            )}
          </>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={togglePlay}
            className={`flex-1 px-4 py-2 text-white font-semibold rounded-lg ${
              isPlaying ? "bg-blue-500" : "bg-orange-500"
            }`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default VehicleMap;
