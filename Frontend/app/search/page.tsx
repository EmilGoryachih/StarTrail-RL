"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Sparkles, Search as SearchIcon, MapPin, Tag } from "lucide-react";
import dynamic from "next/dynamic";
import 'leaflet/dist/leaflet.css';
import UserMenu from "@/components/user-menu";
import POIDetailModal from "@/components/POIDetailModal";
import { toast } from "sonner";

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });


const popularCities = [
  "Москва",
  "Санкт-Петербург",
  "Казань",
  "Екатеринбург",
  "Уфа",
  "Нижний Новгород",
];

const popularTags = [
  "Музеи",
  "Искусство",
  "История",
  "Архитектура",
  "Природа",
  "Парки",
  "Кафе",
  "Рестораны",
  "Шоппинг",
  "Спорт",
  "Активный отдых",
  "Отдых",
  "Ночная жизнь",
  "Местные места",
  "Местная кухня",
  "Фотография",
  "Тихие места",
  "Интересные места",
];

interface Poi {
  id: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
  score: number;
  description: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [results, setResults] = useState<Poi[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

    useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
      });
    }
  }, []);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!query.trim()) {
      toast.error("Введите поисковый запрос!");
      return;
    }

    const token = Cookies.get("access_token");
    if (!token) {
      toast.error("Для поиска нужно войти в систему");
      router.push("/login");
      return;
    }

    try {
      const { PoiService, ApiError } = await import('@/lib/api-config');
      const data = await PoiService.searchPoiApiPoiGet(
        query,
        selectedCity || null,
        10
      );
      setResults(data);
      toast.success(`Найдено ${data.length} мест!`);
    } catch (err: any) {
      console.error(err);
      const { ApiError } = await import('@/lib/api-config');
      if (err instanceof ApiError) {
        setError(err.body?.detail || 'Ошибка поиска');
        toast.error('Ошибка поиска', { description: err.body?.detail });
      } else {
        setError(err.message || 'Ошибка поиска');
        toast.error('Ошибка поиска');
      }
    }
  };

  const handleSave = async (id: string) => {
    const token = Cookies.get("access_token");
    if (!token) return;
    
    try {
      const { UserService } = await import('@/lib/api-config');
      await UserService.addPoiToFavoritesEndpointApiUserFavoritesPoiIdPost(id);
      toast.success('Добавлено в избранное!', {
        description: 'Место сохранено в вашем списке',
      });
    } catch (e) {
      console.error(e);
      toast.error('Не удалось добавить в избранное');
    }
  };

  const homeLink = Cookies.get("access_token") ? "/recommendations" : "/";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-rose-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
      </div>
      <header className="relative border-b border-white/20 py-4 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 sticky top-0 z-50 shadow-sm">
        <div className="container flex justify-between items-center">
          <Link href={homeLink} className="flex items-center gap-2 group">
            <Sparkles className="h-6 w-6 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">StarTrail</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/recommendations">
              <Button variant="ghost" size="sm">
                Рекомендации
              </Button>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="relative flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Семантический поиск
            </h1>
            <p className="text-neutral-700 text-lg">
              Опишите желаемое место своими словами — AI найдет идеальные варианты
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-2xl p-8 rounded-2xl">
            {/* Query Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <SearchIcon className="h-5 w-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-900">Ваш запрос</h2>
              </div>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Например: 'Хочу найти уютное кафе с видом в центре Москвы' или 'Покажи интересные музеи для детей'"
                className="min-h-[120px] text-base resize-none border-indigo-200 focus:border-indigo-500"
                required
              />
            </div>

            {/* City Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-900">Город или место</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите город" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {popularCities.slice(0, 4).map((city) => (
                  <Badge
                    key={city}
                    variant="outline"
                    className="cursor-pointer hover:bg-neutral-100"
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-5 w-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-900">Интересы и предпочтения</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                        : "hover:bg-indigo-50 hover:border-indigo-300"
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full py-6 text-base bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Найти идеальные места
              <SearchIcon className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {results.length > 0 && (
                        <>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((poi, index) => {
                  const gradients = [
                    'from-indigo-200 via-blue-200 to-cyan-200',
                    'from-purple-200 via-indigo-200 to-blue-200',
                    'from-blue-200 via-cyan-200 to-teal-200',
                    'from-violet-200 via-purple-200 to-indigo-200',
                  ];
                  const gradient = gradients[index % gradients.length];
                  
                  return (
                    <Card
                      key={poi.id} 
                      className="overflow-hidden bg-white/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-xl hover:shadow-2xl hover:scale-[1.02] hover:bg-white/60 transition-all duration-300 cursor-pointer group"
                      onClick={() => {
                        setSelectedPoi(poi);
                        setDetailOpen(true);
                      }}
                    >
                      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                        <Sparkles className="h-12 w-12 text-indigo-500/60 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                          {poi.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-indigo-600" />
                          <p className="text-sm text-neutral-600">{poi.city}</p>
                        </div>
                        <p className="text-base text-neutral-700 line-clamp-2 mb-4">
                          {poi.description}
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(poi.id);
                            }}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200"
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            В избранное
                          </Button>
                          <Badge variant="outline" className="text-xs border-indigo-200">
                            <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
                            {(poi.score * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="h-[400px] w-full mt-8">
                <MapContainer center={[results[0].lat, results[0].lon]} zoom={13} style={{ height: '100%', width: '100%' }} attributionControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
                  {results.map((poi) => (
                    <Marker key={poi.id} position={[poi.lat, poi.lon]}>
                      <Popup>
                        <strong>{poi.name}</strong>
                        <br />
                        {poi.city}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </>
          )}
        </div>
      </main>

      {/* POI Detail Modal */}
      <POIDetailModal
        poi={selectedPoi}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSave={handleSave}
      />

      <footer className="border-t py-6 bg-white/80 backdrop-blur-sm">
        <div className="container text-center text-neutral-500 text-sm">
          © 2025 StarTrail AI. Intelligent POI Search & Recommendations.
        </div>
      </footer>
    </div>
  );
}