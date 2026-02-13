"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { REGIONS } from "@/lib/cities";
import type { Profile } from "@/lib/types";
import * as XLSX from "xlsx";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [regionFilter, setRegionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers(data || []);
      setFiltered(data || []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let result = users;
    if (regionFilter) {
      result = result.filter((u) => u.region === regionFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.city.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.telegram?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [users, regionFilter, searchQuery]);

  const exportToExcel = () => {
    const data = filtered.map((u) => ({
      ФИО: u.full_name,
      Телефон: u.phone || "",
      Email: u.email || "",
      Telegram: u.telegram || "",
      VK: u.vk || "",
      Регион: u.region,
      Город: u.city,
      "Дата регистрации": new Date(u.created_at).toLocaleDateString("ru-RU"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Участницы");
    XLSX.writeFile(wb, `patriotki_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) {
    return <p className="text-gray-500">Загрузка...</p>;
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск по имени, городу, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
        />
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
        >
          <option value="">Все регионы</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
        >
          📥 Экспорт в Excel
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Показано: {filtered.length} из {users.length}
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ФИО
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Контакты
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Регион
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Город
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Дата
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {u.full_name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  <div>{u.phone}</div>
                  <div className="text-xs">{u.telegram}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{u.region}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{u.city}</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(u.created_at).toLocaleDateString("ru-RU")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
