'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

const interestsList = [
  'Музеи',
  'Искусство',
  'История',
  'Архитектура',
  'Природа',
  'Парки',
  'Кафе',
  'Рестораны',
  'Шоппинг',
  'Спорт',
  'Активный отдых',
  'Отдых',
  'Ночная жизнь',
  'Местные места',
  'Местная кухня',
  'Фотография',
  'Тихие места',
  'Интересные места',
];

const interestsMap: Record<string, string> = {
  'Музеи': 'museums',
  'Искусство': 'art',
  'История': 'history',
  'Архитектура': 'architecture',
  'Природа': 'nature',
  'Парки': 'parks',
  'Кафе': 'cafes',
  'Рестораны': 'restaurants',
  'Шоппинг': 'shopping',
  'Спорт': 'sports',
  'Активный отдых': 'active',
  'Отдых': 'recreation',
  'Местные места': 'local',
  'Интересные места': 'places',
  'Ночная жизнь': 'nightlife',
  'Местная кухня': 'cuisine',
  'Фотография': 'photography',
  'Тихие места': 'quiet',
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const homeLink = Cookies.get('access_token') ? '/recommendations' : '/';

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');

  // Step 2
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [preferences, setPreferences] = useState('');

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev =>
        prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Import services
      const { UserService, TokenService, ApiError } = await import('@/lib/api-config');
      
      // Register user
      const user = await UserService.registerEndpointApiUserRegisterPost({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        city,
        about_me: bio,
        interests: selectedInterests.map((i) => interestsMap[i]).filter(Boolean) as any,
        additional_interests: preferences || "",
      });

      console.log('Registered user:', user);

      // Automatic login
      try {
        const tokens = await TokenService.loginForAccessTokenApiTokenGetTokenPost({
          username: email,
          password: password,
        });
        
        Cookies.set('access_token', tokens.access_token, { expires: 7 });
        toast.success('Добро пожаловать в StarTrail!', {
          description: 'Вы успешно зарегистрировались',
        });
        router.push('/recommendations');
      } catch (loginErr) {
        toast.warning('Регистрация успешна', {
          description: 'Но не удалось войти автоматически. Попробуйте войти вручную.',
        });
        router.push('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      const { ApiError } = await import('@/lib/api-config');
      if (err instanceof ApiError) {
        const detail = err.body?.detail;
        let errorMessage = 'Ошибка при регистрации';
        
        if (Array.isArray(detail)) {
          // Validation errors from FastAPI
          errorMessage = detail.map((e: any) => {
            const field = e.loc?.slice(1).join('.') || 'unknown';
            return `${field}: ${e.msg}`;
          }).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
        
        console.error('Validation errors:', detail);
        toast.error('Ошибка валидации', {
          description: errorMessage,
        });
      } else {
        toast.error('Ошибка подключения', {
          description: 'Не удалось подключиться к серверу',
        });
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
            <Link href="/login">
              <Button variant="outline" size="sm">Войти</Button>
            </Link>
          </div>
        </header>

        <main className="relative flex-1 container py-12">
          <div className="max-w-md mx-auto bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-2xl p-8 rounded-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {step === 1 ? 'Создайте аккаунт' : 'Ваши интересы'}
              </h1>
              <p className="text-neutral-600">
                {step === 1
                    ? 'AI-система подберет места специально для вас на основе ваших предпочтений'
                    : 'Выберите интересы для получения персонализированных рекомендаций'}
              </p>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step >= 1 
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' 
                          : 'bg-gray-200 text-neutral-600'
                    }`}
                >
                  1
                </div>
                <div className="h-1 w-12 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`} />
                </div>
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step >= 2 
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' 
                          : 'bg-gray-200 text-neutral-600'
                    }`}
                >
                  2
                </div>
              </div>
              <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Шаг {step} из 2
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Имя</Label>
                        <Input
                            id="firstName"
                            placeholder="Иван"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Фамилия</Label>
                        <Input
                            id="lastName"
                            placeholder="Иванов"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                          id="email"
                          type="email"
                          placeholder="example@mail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Пароль</Label>
                      <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Город проживания</Label>
                      <Input
                          id="city"
                          placeholder="Москва"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">О себе (необязательно)</Label>
                      <Textarea
                          id="bio"
                          placeholder="Расскажите немного о себе и своих предпочтениях в путешествиях"
                          className="resize-none"
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                      />
                    </div>

                    <Button type="button" className="w-full" onClick={() => setStep(2)}>
                      Продолжить
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
              ) : (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base mb-3 block">Выберите ваши интересы</Label>
                      <div className="flex flex-wrap gap-2">
                        {interestsList.map((interest) => (
                            <Badge
                                key={interest}
                                variant={selectedInterests.includes(interest) ? "default" : "outline"}
                                className={`cursor-pointer text-sm py-1.5 px-3 ${
                                    selectedInterests.includes(interest)
                                        ? "bg-neutral-900 hover:bg-neutral-700"
                                        : "hover:bg-neutral-100"
                                }`}
                                onClick={() => handleInterestToggle(interest)}
                            >
                              {interest}
                            </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferences">Дополнительные предпочтения</Label>
                      <Textarea
                          id="preferences"
                          placeholder="Расскажите о других предпочтениях, которые помогут нам лучше подобрать места для вас"
                          className="resize-none"
                          rows={3}
                          value={preferences}
                          onChange={(e) => setPreferences(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад
                      </Button>
                      <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
                        Завершить
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
              )}
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
