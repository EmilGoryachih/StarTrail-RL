"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Heart, Loader2, Star } from "lucide-react";
import UserMenu from "@/components/user-menu";
import POIDetailModal from "@/components/POIDetailModal";

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

export default function FavoritesPage() {
  const [items, setItems] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const token = Cookies.get("access_token");
  const homeLink = token ? "/recommendations" : "/";

  useEffect(() => {
    const fetchFavs = async () => {
      if (!token) return;
      
      try {
        const { UserService } = await import('@/lib/api-config');
        const data = await UserService.getUserFavoritesEndpointApiUserFavoritesGet();
        setItems(data);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };
    fetchFavs();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-rose-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/30 to-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
      </div>
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
            <Link href="/recommendations">
              <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50">
                Рекомендации
              </Button>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="relative flex-1 container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Избранные места
          </h1>
          <p className="text-neutral-700">Места, которые вы сохранили для посещения</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Загрузка избранного...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-indigo-100">
            <Heart className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
            <p className="text-neutral-600 text-lg mb-4">У вас пока нет избранных мест</p>
            <Link href="/search">
              <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
                Найти интересные места
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((place, index) => {
              const gradients = [
                'from-rose-200 via-pink-200 to-fuchsia-200',
                'from-pink-200 via-rose-200 to-red-200',
                'from-fuchsia-200 via-pink-200 to-purple-200',
                'from-red-200 via-rose-200 to-pink-200',
              ];
              const gradient = gradients[index % gradients.length];
              
              return (
                <Card 
                  key={place.id} 
                  className="overflow-hidden bg-white/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 hover:shadow-2xl hover:scale-[1.03] hover:bg-white/60 transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    setSelectedPoi(place);
                    setDetailOpen(true);
                  }}
                >
                  <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                        <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                      </div>
                    </div>
                    <Heart className="h-20 w-20 text-rose-400/50 fill-rose-400/50 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-rose-600 transition-colors">
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                      <p className="text-neutral-600 text-sm">{place.city}</p>
                    </div>
                    <p className="text-neutral-700 text-sm leading-relaxed line-clamp-3 mb-4">
                      {place.description}
                    </p>
                    <Badge className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                      {place.type}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* POI Detail Modal - no save button for favorites */}
        <POIDetailModal
          poi={selectedPoi}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </main>

      <footer className="border-t py-6 bg-white/80 backdrop-blur-sm">
        <div className="container text-center text-neutral-500 text-sm">
          © 2025 StarTrail AI. Intelligent POI Search & Recommendations.
        </div>
      </footer>
    </div>
  );
}
