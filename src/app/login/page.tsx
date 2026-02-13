"use client";

import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function LoginPage() {
  const handleVkLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google", // Supabase не поддерживает VK напрямую — используем custom provider
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Telegram Login Widget
  useEffect(() => {
    const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
    if (!botName) return;

    const container = document.getElementById("telegram-login");
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;
    container.appendChild(script);

    (window as unknown as Record<string, unknown>).onTelegramAuth = async (
      user: Record<string, string>
    ) => {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
          Вход в платформу
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Войдите через VK или Telegram
        </p>

        <div className="space-y-4">
          {/* VK */}
          <button
            onClick={handleVkLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.455 2.27 4.606 2.862 4.606.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.168-3.624 2.168-3.624.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.78 1.203 1.253.746.864 1.322 1.592 1.473 2.084.17.508-.085.763-.576.763z" />
            </svg>
            Войти через VK
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">или</span>
            </div>
          </div>

          {/* Telegram widget */}
          <div id="telegram-login" className="flex justify-center"></div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Нет аккаунта?{" "}
          <a href="/register" className="text-red-700 font-medium hover:underline">
            Зарегистрируйтесь
          </a>
        </p>
      </div>
    </div>
  );
}
