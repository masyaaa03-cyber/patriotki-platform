"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  regionBreakdown: { region: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const [
        { count: totalUsers },
        { count: totalEvents },
        { count: totalRegistrations },
        { data: profiles },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase
          .from("event_registrations")
          .select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("region"),
      ]);

      const regionMap: Record<string, number> = {};
      (profiles || []).forEach((p) => {
        regionMap[p.region] = (regionMap[p.region] || 0) + 1;
      });
      const regionBreakdown = Object.entries(regionMap)
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalUsers: totalUsers || 0,
        totalEvents: totalEvents || 0,
        totalRegistrations: totalRegistrations || 0,
        regionBreakdown,
      });
    }
    load();
  }, []);

  if (!stats) {
    return <p className="text-gray-500">Загрузка статистики...</p>;
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Участниц" value={stats.totalUsers} icon="👥" />
        <StatCard label="Мероприятий" value={stats.totalEvents} icon="📅" />
        <StatCard
          label="Регистраций на мероприятия"
          value={stats.totalRegistrations}
          icon="✍️"
        />
      </div>

      {/* Region breakdown */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">По регионам</h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Регион
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Участниц
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.regionBreakdown.map((r) => (
              <tr key={r.region} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">{r.region}</td>
                <td className="px-6 py-3 text-sm text-gray-700 text-right font-medium">
                  {r.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
