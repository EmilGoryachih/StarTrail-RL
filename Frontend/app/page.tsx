'use client'

import Link from 'next/link'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'
import { ArrowRight, MapPin, Sparkles, User } from 'lucide-react'
import UserMenu from '@/components/user-menu'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function HomePage() {
  const loggedIn = Boolean(Cookies.get('access_token'))

  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        {/* Header */}
        <header className="relative border-b border-white/20 py-4 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 sticky top-0 z-50 shadow-sm">
          <div className="container flex justify-between items-center">
            {/* Логотип */}
            <Link href="/" className="flex items-center gap-2 group">
              <Sparkles className="h-6 w-6 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">StarTrail</span>
            </Link>

            {/* Навигация и авторизация */}
            <div className="flex items-center gap-4">
              {loggedIn ? (
                  <>
                    {/* Основные разделы */}
                    <nav className="hidden md:flex items-center gap-6">
                      <Link
                          href="/search"
                          className="text-neutral-600 hover:text-neutral-900"
                      >
                        Поиск
                      </Link>
                      <Link
                          href="/recommendations"
                          className="text-neutral-600 hover:text-neutral-900"
                      >
                        Рекомендации
                      </Link>
                    </nav>
                    {/* Переключатель языка */}
                    <LanguageSwitcher />
                    {/* Пользовательское меню */}
                    <UserMenu />
                  </>
              ) : (
                  <>
                    {/* Переключатель языка */}
                    <LanguageSwitcher />
                    {/* Кнопки входа/регистрации */}
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Войти
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="outline" size="sm" className="gap-2">
                        <User className="h-4 w-4" />
                        Регистрация
                      </Button>
                    </Link>
                  </>
              )}
            </div>
          </div>
        </header>

        {/* Main Hero */}
        <main className="flex-1 container py-12 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Откройте мир идеальных мест
            </h1>
            <p className="text-xl text-neutral-700 mb-10 leading-relaxed">
              <span className="font-semibold text-indigo-600">StarTrail</span> использует искусственный интеллект для поиска достопримечательностей и мест, которые идеально соответствуют вашим интересам и предпочтениям.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {loggedIn ? (
                  <>
                    <Link href="/recommendations">
                      <Button size="lg" className="gap-2 w-full sm:w-auto">
                        К рекомендациям
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/search">
                      <Button
                          variant="outline"
                          size="lg"
                          className="gap-2 w-full sm:w-auto"
                      >
                        <MapPin className="h-4 w-4" />
                        Искать места
                      </Button>
                    </Link>
                  </>
              ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="gap-2 w-full sm:w-auto">
                        Начать
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                          variant="secondary"
                          size="lg"
                          className="gap-2 w-full sm:w-auto"
                      >
                        Войти
                      </Button>
                    </Link>
                    {/* Убрали поиск для неавторизованных */}
                  </>
              )}
            </div>
          </div>

          {/* Блок преимуществ */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-xl p-8 rounded-2xl hover:shadow-3xl hover:scale-105 hover:bg-white/70 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-indigo-600 transition-colors">
                AI-персонализация
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Искусственный интеллект анализирует ваши интересы и подбирает места, которые вам действительно понравятся.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-xl p-8 rounded-2xl hover:shadow-3xl hover:scale-105 hover:bg-white/70 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                Семантический поиск
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Опишите желаемое место своими словами — система понимает контекст и находит идеальные варианты.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-xl p-8 rounded-2xl hover:shadow-3xl hover:scale-105 hover:bg-white/70 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">
                Умные рекомендации
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Откройте как популярные достопримечательности, так и скрытые жемчужины на основе ваших предпочтений.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t py-6 bg-white/80 backdrop-blur-sm">
          <div className="container text-center text-neutral-500 text-sm">
            © 2025 StarTrail AI. Intelligent POI Search & Recommendations.
          </div>
        </footer>
      </div>
  )
}
