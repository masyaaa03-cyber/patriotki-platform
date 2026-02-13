"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Achievement, Profile, Event } from "@/lib/types";

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "🏆",
    event_id: "",
  });

  // Award modal
  const [awardModal, setAwardModal] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchUser, setSearchUser] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: achData }, { data: evData }, { data: usData }] =
      await Promise.all([
        supabase
          .from("achievements")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("events").select("*").order("date", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, full_name, city, region")
          .order("full_name"),
      ]);
    setAchievements(achData || []);
    setEvents(evData || []);
    setUsers((usData as Profile[]) || []);
    setLoading(false);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("achievements").insert({
      title: form.title,
      description: form.description || null,
      icon: form.icon,
      event_id: form.event_id || null,
    });
    setForm({ title: "", description: "", icon: "🏆", event_id: "" });
    setShowForm(false);
    loadData();
  };

  const handleAward = async () => {
    if (!awardModal || selectedUsers.length === 0) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const inserts = selectedUsers.map((userId) => ({
      user_id: userId,
      achievement_id: awardModal,
      awarded_by: user?.id,
    }));

    await supabase.from("user_achievements").upsert(inserts, {
      onConflict: "user_id,achievement_id",
    });

    setAwardModal(null);
    setSelectedUsers([]);
    setSearchUser("");
  };

  const filteredUsers = searchUser
    ? users.filter(
        (u) =>
          u.full_name.toLowerCase().includes(searchUser.toLowerCase()) ||
          u.city.toLowerCase().includes(searchUser.toLowerCase())
      )
    : users;

  if (loading) return <p className="text-gray-500">Загрузка...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Достижения ({achievements.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800"
        >
          + Создать достижение
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 text-gray-900">
            Новое достижение
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Иконка
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, icon: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-2xl text-center"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="Участница форума 2026"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Привязка к мероприятию (опционально)
              </label>
              <select
                value={form.event_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, event_id: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              >
                <option value="">Без привязки</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({new Date(ev.date).toLocaleDateString("ru-RU")})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800"
              >
                Создать
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Achievements list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((ach) => (
          <div key={ach.id} className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{ach.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{ach.title}</h3>
                {ach.description && (
                  <p className="text-sm text-gray-500">{ach.description}</p>
                )}
              </div>
              <button
                onClick={() => setAwardModal(ach.id)}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Выдать
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Award modal */}
      {awardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                Выдать достижение
              </h3>
              <input
                type="text"
                placeholder="Поиск по имени или городу..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {filteredUsers.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers((prev) => [...prev, u.id]);
                      } else {
                        setSelectedUsers((prev) =>
                          prev.filter((id) => id !== u.id)
                        );
                      }
                    }}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {u.full_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {u.city}, {u.region}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="p-4 border-t flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Выбрано: {selectedUsers.length}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setAwardModal(null);
                    setSelectedUsers([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAward}
                  disabled={selectedUsers.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Выдать достижение
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
