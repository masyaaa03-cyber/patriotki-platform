"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { REGIONS, getCitiesByRegion, findCity } from "@/lib/cities";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    telegram: "",
    vk: "",
    region: "",
    city: "",
    consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"auth" | "profile">("auth");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [checking, setChecking] = useState(true);

  // Проверяем, залогинен ли пользователь уже
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setForm((prev) => ({ ...prev, email: user.email || "" }));
          setStep("profile");
        }
      } catch {
        // Не залогинен — показываем форму регистрации
      }
      setChecking(false);
    };
    checkSession();
  }, []);

  const cities = form.region ? getCitiesByRegion(form.region) : [];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setForm((prev) => ({ ...prev, email: authEmail }));
    setStep("profile");
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) {
      setError("Необходимо дать согласие на обработку персональных данных");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Сессия истекла. Перейдите на страницу входа и войдите заново.");
        setLoading(false);
        return;
      }

      const cityData = findCity(form.city);
      const { error: dbError } = await supabase.from("profiles").insert({
        id: user.id,
        full_name: form.full_name,
        phone: form.phone || null,
        email: form.email || null,
        telegram: form.telegram || null,
        vk: form.vk || null,
        region: form.region,
        city: form.city,
        latitude: cityData?.lat || null,
        longitude: cityData?.lng || null,
        consent: true,
        consent_date: new Date().toISOString(),
      });

      if (dbError) {
        setError("Ошибка сохранения: " + dbError.message);
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError("Ошибка соединения с сервером. Попробуйте ещё раз.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (step === "auth") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
            Регистрация
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Создайте аккаунт для участия в движении
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                placeholder="Минимум 6 символов"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Создание аккаунта..." : "Далее"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Уже есть аккаунт?{" "}
            <a href="/login" className="text-red-700 font-medium hover:underline">
              Войти
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
          Заполните профиль
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Эти данные нужны для вашей карточки участницы
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ФИО <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, full_name: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
              placeholder="Иванова Мария Петровна"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telegram
              </label>
              <input
                type="text"
                value={form.telegram}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, telegram: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                placeholder="@username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VK
              </label>
              <input
                type="text"
                value={form.vk}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, vk: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                placeholder="vk.com/username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Регион <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.region}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  region: e.target.value,
                  city: "",
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            >
              <option value="">Выберите регион</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Город <span className="text-red-500">*</span>
            </label>
            {cities.length > 0 ? (
              <select
                required
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
              >
                <option value="">Выберите город</option>
                {cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                placeholder="Введите название города"
              />
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, consent: e.target.checked }))
                }
                className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-600">
                Я даю согласие на обработку моих персональных данных в
                соответствии с{" "}
                <span className="text-red-700 underline">
                  Федеральным законом No 152-ФЗ &laquo;О персональных
                  данных&raquo;
                </span>
                . Мои данные будут использоваться исключительно в рамках
                деятельности движения &laquo;Патриотки всея Руси&raquo;.
                <span className="text-red-500"> *</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !form.consent}
            className="w-full py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Сохранение..." : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
}
