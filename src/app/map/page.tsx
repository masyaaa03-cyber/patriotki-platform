"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("@/components/MapComponent").then((mod) => mod.MapComponent),
  { ssr: false, loading: () => <div className="h-[600px] bg-gray-100 flex items-center justify-center">Загрузка карты...</div> }
);

export default function MapPage() {
  return (
    <div>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Карта движения</h1>
          <p className="text-gray-500 mt-1">
            Красные точки — города, где зарегистрированы участницы движения
          </p>
        </div>
      </div>
      <MapComponent />
    </div>
  );
}
