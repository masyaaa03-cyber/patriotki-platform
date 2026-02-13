"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { UserAchievement } from "@/lib/types";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_achievements")
          .select("*, achievement:achievements(*)")
          .eq("user_id", user.id)
          .order("awarded_at", { ascending: false });
        setAchievements(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Загрузка достижений...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои достижения</h1>
      <p className="text-gray-500 mb-8">
        Коллекция значков за посещённые мероприятия
      </p>

      {achievements.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl">🏆</span>
          <p className="text-gray-400 mt-4 text-lg">
            Пока нет достижений. Участвуй в мероприятиях, чтобы получить первый
            значок!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map((ua) => (
            <div
              key={ua.id}
              className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <span className="text-5xl block mb-3">
                {ua.achievement?.icon || "🏆"}
              </span>
              <h3 className="font-bold text-gray-900 text-sm">
                {ua.achievement?.title}
              </h3>
              {ua.achievement?.description && (
                <p className="text-gray-400 text-xs mt-1">
                  {ua.achievement.description}
                </p>
              )}
              <p className="text-gray-300 text-xs mt-3">
                {new Date(ua.awarded_at).toLocaleDateString("ru-RU")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
