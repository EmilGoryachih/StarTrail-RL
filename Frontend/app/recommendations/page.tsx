// frontend/pages/recommendations.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ArrowRight, Sparkles, MapPin, Heart, Star } from "lucide-react";
import UserMenu from "@/components/user-menu";
import POIDetailModal from "@/components/POIDetailModal";
import { toast } from "sonner";

interface Poi {
  id: string;
  name: string;
  type: string;
  city: string;
  lat: number;
  lon: number;
  score: number;
  description: string;
}

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [recs, setRecs] = useState<Poi[]>([]);
  const [favorites, setFavorites] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const limit = 10;
  const homeLink = Cookies.get("access_token") ? "/recommendations" : "/";

  const handleSave = async (id: string) => {
    const token = Cookies.get('access_token');
    if (!token) return;
    
    try {
      const { UserService } = await import('@/lib/api-config');
      await UserService.addPoiToFavoritesEndpointApiUserFavoritesPoiIdPost(id);
      toast.success('Добавлено в избранное!', {
        description: 'Место сохранено в вашем списке избранного',
      });
      // Refresh favorites
      fetchFavorites();
    } catch (e) {
      console.error(e);
      toast.error('Не удалось добавить в избранное');
    }
  };

  const handleCardClick = (poi: Poi) => {
    setSelectedPoi(poi);
    setDetailOpen(true);
  };

  const fetchFavorites = async () => {
    const token = Cookies.get('access_token');
    if (!token) return;
    
    try {
      const { UserService } = await import('@/lib/api-config');
      const data = await UserService.getUserFavoritesEndpointApiUserFavoritesGet();
      setFavorites(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFavorites(false);
    }
  };

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = Cookies.get("access_token");
        if (!token) throw new Error("Войдите в систему, чтобы увидеть рекомендации");
        
        const { PoiService } = await import('@/lib/api-config');
        const data = await PoiService.recommendPoiApiPoiRecommendationsGet(limit);
        setRecs(data);
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить рекомендации");
      } finally {
        setLoading(false);
      }
    };
    
    const fetchInterests = async () => {
      const token = Cookies.get('access_token');
      if (!token) return;
      
      try {
        const { UserService } = await import('@/lib/api-config');
        const data = await UserService.getUserInterestsEndpointApiUserInterestsGet(3);
        setUserInterests(data);
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchRecs();
    fetchInterests();
    fetchFavorites();
  }, []);

  const renderCard = (place: Poi, isFavorite = false) => {
    // Генерируем разные градиенты для разнообразия
    const gradients = [
      'from-indigo-200 via-purple-200 to-pink-200',
      'from-blue-200 via-indigo-200 to-purple-200',
      'from-purple-200 via-pink-200 to-rose-200',
      'from-cyan-200 via-blue-200 to-indigo-200',
      'from-violet-200 via-purple-200 to-fuchsia-200',
    ];
    const gradientIndex = Math.abs(place.id.charCodeAt(0)) % gradients.length;
    const gradient = isFavorite 
      ? 'from-rose-200 via-pink-200 to-fuchsia-200'
      : gradients[gradientIndex];

    return (
      <Card 
        key={place.id} 
        className="overflow-hidden bg-white/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 hover:shadow-2xl hover:scale-[1.03] hover:bg-white/60 transition-all duration-300 cursor-pointer group"
        onClick={() => handleCardClick(place)}
      >
        <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
          {isFavorite && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
              </div>
            </div>
          )}
          <Sparkles className="h-16 w-16 text-indigo-500/60 group-hover:scale-110 group-hover:rotate-12 transition-all" />
        </div>
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
              {place.name}
            </h3>
          </div>
          <div className="flex items-center text-neutral-600 text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1 text-indigo-600" />
            {place.city}
          </div>
          <p className="text-neutral-700 mb-4 text-sm leading-relaxed line-clamp-3">
            {place.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
              {place.type}
            </Badge>
            <Badge variant="outline" className="text-xs border-indigo-200">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {(place.score * 100).toFixed(0)}%
            </Badge>
          </div>
          {!isFavorite && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleSave(place.id);
              }}
              className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200"
            >
              <Heart className="h-4 w-4 mr-2" />
              Добавить в избранное
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderList = (list: Poi[]) => {
    if (loading) return (
      <div className="text-center py-12">
        <Sparkles className="h-12 w-12 text-indigo-600 animate-pulse mx-auto mb-4" />
        <p className="text-neutral-600">Подбираем лучшие места для вас...</p>
      </div>
    );
    if (error) return (
      <div className="bg-red-50/80 backdrop-blur-xl border border-red-200 text-red-700 p-6 rounded-2xl">
        {error}
      </div>
    );
    if (list.length === 0) return (
      <div className="text-center py-12 bg-white/60 backdrop-blur-xl rounded-2xl border border-indigo-100">
        <p className="text-neutral-600">Нет рекомендаций. Попробуйте обновить свои интересы в профиле.</p>
      </div>
    );
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((place) => renderCard(place))}
        </div>
    );
  };

  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-rose-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        </div>
        {/* Header */}
        <header className="relative border-b border-white/20 py-4 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 sticky top-0 z-50 shadow-sm">
          <div className="container flex justify-between items-center">
            <Link href={homeLink} className="flex items-center gap-2 group">
              <Sparkles className="h-6 w-6 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">StarTrail</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/search">
                <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50">
                  Поиск
                </Button>
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="relative flex-1 container py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Главная
              </h1>
              <p className="text-neutral-700 text-lg">
                Ваши избранные места и персональные рекомендации
              </p>
            </div>
            <Link href="/search">
              <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg">
                <Sparkles className="h-4 w-4" />
                Новый поиск
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-2 rounded-xl">
                  <Heart className="h-6 w-6 text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Избранное</h2>
                  <p className="text-neutral-600 text-sm">Места, которые вы сохранили</p>
                </div>
              </div>
              
              {loadingFavorites ? (
                <div className="text-center py-8">
                  <Heart className="h-10 w-10 text-rose-400 animate-pulse mx-auto mb-3" />
                  <p className="text-neutral-600">Загрузка избранного...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {favorites.slice(0, 4).map((place) => renderCard(place, true))}
                </div>
              )}
              
              {favorites.length > 4 && (
                <div className="text-center">
                  <Link href="/favorites">
                    <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50">
                      Показать все ({favorites.length})
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Рекомендации для вас</h2>
                <p className="text-neutral-600 text-sm">AI подобрал места на основе ваших интересов</p>
              </div>
            </div>

            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="bg-white/50 backdrop-blur-xl backdrop-saturate-150 border border-white/20 mb-6 shadow-lg">
                <TabsTrigger value="all">Все</TabsTrigger>
                {userInterests.map((i) => (
                  <TabsTrigger key={i} value={i}>{i}</TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">{renderList(recs)}</TabsContent>
              {userInterests.map((i) => (
                <TabsContent key={i} value={i}>
                  {renderList(recs.filter((p) => p.type === i))}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>

        {/* POI Detail Modal */}
        <POIDetailModal
          poi={selectedPoi}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onSave={handleSave}
        />

        {/* Footer */}
        <footer className="border-t py-6 bg-white/80 backdrop-blur-sm">
          <div className="container text-center text-neutral-500 text-sm">
            © 2025 StarTrail AI. Intelligent POI Search & Recommendations.
          </div>
        </footer>
      </div>
  );
}
