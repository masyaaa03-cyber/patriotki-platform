"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Event, EventRegistration } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const [{ data: eventsData }, { data: regsData }] = await Promise.all([
          supabase
            .from("events")
            .select("*")
            .eq("is_active", true)
            .order("date", { ascending: true }),
          supabase
            .from("event_registrations")
            .select("event_id")
            .eq("user_id", user.id),
        ]);
        setEvents(eventsData || []);
        setMyRegistrations((regsData || []).map((r) => r.event_id));
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleRegister = async (eventId: string) => {
    if (!userId) return;
    const { error } = await supabase.from("event_registrations").insert({
      user_id: userId,
      event_id: eventId,
    });
    if (!error) {
      setMyRegistrations((prev) => [...prev, eventId]);
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("user_id", userId)
      .eq("event_id", eventId);
    if (!error) {
      setMyRegistrations((prev) => prev.filter((id) => id !== eventId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Загрузка мероприятий...</p>
      </div>
    );
  }

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Мероприятия</h1>
      <p className="text-gray-500 mb-8">
        Записывайся на предстоящие мероприятия движения
      </p>

      {/* Upcoming */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Предстоящие</h2>
      {upcoming.length === 0 ? (
        <p className="text-gray-400 mb-8">Пока нет запланированных мероприятий</p>
      ) : (
        <div className="space-y-4 mb-10">
          {upcoming.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              registered={myRegistrations.includes(event.id)}
              onRegister={() => handleRegister(event.id)}
              onUnregister={() => handleUnregister(event.id)}
            />
          ))}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Прошедшие</h2>
          <div className="space-y-4 opacity-70">
            {past.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                registered={myRegistrations.includes(event.id)}
                isPast
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EventCard({
  event,
  registered,
  isPast,
  onRegister,
  onUnregister,
}: {
  event: Event;
  registered: boolean;
  isPast?: boolean;
  onRegister?: () => void;
  onUnregister?: () => void;
}) {
  const date = new Date(event.date);
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row md:items-center gap-4">
      {/* Date badge */}
      <div className="flex-shrink-0 w-16 h-16 bg-red-50 rounded-lg flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-red-700">
          {date.getDate()}
        </span>
        <span className="text-xs text-red-500 uppercase">
          {date.toLocaleDateString("ru-RU", { month: "short" })}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
        {event.description && (
          <p className="text-gray-500 text-sm mt-1">{event.description}</p>
        )}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
          {event.city && <span>📍 {event.city}</span>}
          {event.location && <span>🏛️ {event.location}</span>}
          <span>
            🕐{" "}
            {date.toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Action */}
      {!isPast && (
        <div className="flex-shrink-0">
          {registered ? (
            <button
              onClick={onUnregister}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium"
            >
              Отменить запись
            </button>
          ) : (
            <button
              onClick={onRegister}
              className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 text-sm font-medium"
            >
              Записаться
            </button>
          )}
        </div>
      )}
      {isPast && registered && (
        <span className="text-green-600 text-sm font-medium">✓ Вы были</span>
      )}
    </div>
  );
}
