"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { supabase } from "@/lib/supabase";
import type { MapPoint } from "@/lib/types";
import "leaflet/dist/leaflet.css";

export function MapComponent() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPoints() {
      const { data, error } = await supabase.rpc("get_map_points");
      if (!error && data) {
        setPoints(data);
      }
      setLoading(false);
    }
    loadPoints();
  }, []);

  const totalParticipants = points.reduce((sum, p) => sum + p.cnt, 0);

  return (
    <div className="relative">
      {/* Stats overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <p className="text-sm text-gray-500">Участниц на карте</p>
        <p className="text-3xl font-bold text-red-700">{totalParticipants}</p>
        <p className="text-xs text-gray-400">
          {points.length} городов
        </p>
      </div>

      {loading ? (
        <div className="h-[600px] flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Загрузка карты...</p>
        </div>
      ) : (
        <MapContainer
          center={[62, 90]}
          zoom={3}
          className="h-[600px] w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point, i) => (
            <CircleMarker
              key={i}
              center={[point.lat, point.lng]}
              radius={Math.min(6 + point.cnt * 2, 20)}
              pathOptions={{
                color: "#991b1b",
                fillColor: "#dc2626",
                fillOpacity: 0.8,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{point.city}</p>
                  <p className="text-sm text-gray-500">{point.region}</p>
                  <p className="text-red-700 font-medium">
                    {point.cnt} {point.cnt === 1 ? "участница" : "участниц"}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
