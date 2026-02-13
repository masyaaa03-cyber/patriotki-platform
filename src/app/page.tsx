import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-800 to-red-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Патриотки всея Руси
          </h1>
          <p className="text-xl md:text-2xl text-red-100 mb-10 max-w-3xl mx-auto">
            Объединяем неравнодушных женщин по всей стране. Участвуй в
            мероприятиях, получай достижения, становись частью большого движения.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-red-800 font-bold rounded-lg text-lg hover:bg-red-50 transition-colors shadow-lg"
            >
              Присоединиться
            </Link>
            <Link
              href="/map"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg text-lg hover:bg-white/10 transition-colors"
            >
              Карта движения
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
            Как это работает
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Регистрация
              </h3>
              <p className="text-gray-600">
                Заполни короткую анкету, укажи свой город и регион. Твоя точка
                появится на карте движения.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Мероприятия
              </h3>
              <p className="text-gray-600">
                Узнавай о мероприятиях в своём регионе, записывайся и участвуй.
                Мы проводим события по всей России.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Достижения
              </h3>
              <p className="text-gray-600">
                За каждое посещённое мероприятие ты получаешь достижение.
                Собирай коллекцию и следи за своим путём.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            Стань частью движения
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Уже сотни участниц по всей стране. Присоединяйся и ты!
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-red-700 text-white font-bold rounded-lg text-lg hover:bg-red-800 transition-colors shadow-lg"
          >
            Зарегистрироваться
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 Патриотки всея Руси. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
