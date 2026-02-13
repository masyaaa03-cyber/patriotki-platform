"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { REGIONS, getCitiesByRegion } from "@/lib/cities";
import type { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!data) {
        router.push("/register");
        return;
      }
      setProfile(data);
      setForm(data);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        telegram: form.telegram,
        vk: form.vk,
      })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, ...form } as Profile);
      setEditing(false);
    }
    setSaving(false);
  };

  const cities = form.region ? getCitiesByRegion(form.region) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
          <p className="text-gray-500 mt-1">Карточка участницы движения</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            Редактировать
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header card */}
        <div className="bg-gradient-to-r from-red-700 to-red-800 p-6 text-white">
          <h2 className="text-2xl font-bold">{profile.full_name}</h2>
          <p className="text-red-200 mt-1">
            {profile.city}, {profile.region}
          </p>
          <p className="text-red-300 text-sm mt-2">
            Участница с{" "}
            {new Date(profile.created_at).toLocaleDateString("ru-RU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Profile fields */}
        <div className="p-6 space-y-4">
          {editing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ФИО
                </label>
                <input
                  type="text"
                  value={form.full_name || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={form.phone || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telegram
                  </label>
                  <input
                    type="text"
                    value={form.telegram || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        telegram: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VK
                  </label>
                  <input
                    type="text"
                    value={form.vk || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, vk: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  onClick={() => {
                    setForm(profile);
                    setEditing(false);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField label="Телефон" value={profile.phone} />
              <ProfileField label="Email" value={profile.email} />
              <ProfileField label="Telegram" value={profile.telegram} />
              <ProfileField label="VK" value={profile.vk} />
              <ProfileField label="Регион" value={profile.region} />
              <ProfileField label="Город" value={profile.city} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-900 font-medium">{value || "—"}</p>
    </div>
  );
}
