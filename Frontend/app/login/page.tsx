'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Cookies from 'js-cookie';
import { Sparkles } from 'lucide-react';
import { TokenService, ApiError } from '@/lib/api-config';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const loggedIn = Boolean(Cookies.get('access_token'));
  const homeLink = loggedIn ? '/recommendations' : '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const tokens = await TokenService.loginForAccessTokenApiTokenGetTokenPost({
        username: email,
        password: password,
      });
      
      Cookies.set("access_token", tokens.access_token, { expires: 7 });
      router.push("/recommendations");
    } catch (err) {
      console.error('Login error:', err);
      
      if (err instanceof ApiError) {
        setError(err.body?.detail || "Неверный email или пароль");
      } else {
        setError("Не удалось подключиться к серверу. Проверьте, что backend запущен.");
      }
    }
  };

  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <header className="relative border-b border-white/20 py-4 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 sticky top-0 z-50 shadow-sm">
          <div className="container flex justify-between items-center">
            <Link href={homeLink} className="flex items-center gap-2 group">
              <Sparkles className="h-6 w-6 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">StarTrail</span>
            </Link>
            {!loggedIn && (
                <Link href="/register">
                  <Button variant="outline" size="sm">Регистрация</Button>
                </Link>
            )}
          </div>
        </header>

        <main className="relative flex-1 container py-12">
          <div className="max-w-md mx-auto bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-2xl p-8 rounded-2xl">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Вход в систему</h1>
            <p className="text-neutral-600 mb-6">Войдите, чтобы получить персональные рекомендации</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <div className="text-center text-sm text-neutral-600">
                Нет аккаунта?{' '}
                <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                  Зарегистрируйтесь
                </Link>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">Войти</Button>
            </form>
          </div>
        </main>

        <footer className="border-t py-6 bg-white/80 backdrop-blur-sm">
          <div className="container text-center text-neutral-500 text-sm">
            © 2025 StarTrail AI. Intelligent POI Search & Recommendations.
          </div>
        </footer>
      </div>
  );
}