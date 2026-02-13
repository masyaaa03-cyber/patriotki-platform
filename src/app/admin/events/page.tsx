"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { REGIONS } from "@/lib/cities";
import type { Event } from "@/lib/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "12:00",
    city: "",
    region: "",
    location: "",
    max_participants: "",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  }

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      time: "12:00",
      city: "",
      region: "",
      location: "",
      max_participants: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      title: form.title,
      description: form.description || null,
      date: new Date(`${form.date}T${form.time}`).toISOString(),
      city: form.city || null,
      region: form.region || null,
      location: form.location || null,
      max_participants: form.max_participants
        ? parseInt(form.max_participants)
        : null,
    };

    if (editingId) {
      await supabase.from("events").update(eventData).eq("id", editingId);
    } else {
      await supabase.from("events").insert(eventData);
    }

    resetForm();
    loadEvents();
  };

  const handleEdit = (event: Event) => {
    const d = new Date(event.date);
    setForm({
      title: event.title,
      description: event.description || "",
      date: d.toISOString().slice(0, 10),
      time: d.toTimeString().slice(0, 5),
      city: event.city || "",
      region: event.region || "",
      location: event.location || "",
      max_participants: event.max_participants?.toString() || "",
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить мероприятие?")) return;
    await supabase.from("events").delete().eq("id", id);
    loadEvents();
  };

  if (loading) return <p className="text-gray-500">Загрузка...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Мероприятия ({events.length})
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800"
        >
          + Создать мероприятие
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 text-gray-900">
            {editingId ? "Редактирование" : "Новое мероприятие"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Время
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, time: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Регион
                </label>
                <select
                  value={form.region}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, region: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="">—</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Город
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, city: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Место проведения
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="ДК Культуры, ул. Ленина 15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Макс. участников
                </label>
                <input
                  type="number"
                  value={form.max_participants}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      max_participants: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800"
              >
                {editingId ? "Сохранить" : "Создать"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events list */}
      <div className="space-y-3">
        {events.map((event) => {
          const d = new Date(event.date);
          return (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-gray-900">{event.title}</h3>
                <p className="text-sm text-gray-500">
                  {d.toLocaleDateString("ru-RU")} ·{" "}
                  {event.city || "Без города"} · {event.region || "—"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
