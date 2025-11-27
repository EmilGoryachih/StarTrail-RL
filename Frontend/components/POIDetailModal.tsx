'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, X, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

interface POI {
  id: string;
  name: string;
  type: string;
  city: string;
  lat: number;
  lon: number;
  score: number;
  description: string;
}

interface POIDetailModalProps {
  poi: POI | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (id: string) => void;
}

export default function POIDetailModal({ poi, open, onOpenChange, onSave }: POIDetailModalProps) {
  if (!poi) return null;

  // Generate gradient based on type
  const typeGradients: Record<string, string> = {
    'museums': 'from-indigo-200 via-purple-200 to-pink-200',
    'art': 'from-pink-200 via-rose-200 to-red-200',
    'parks': 'from-green-200 via-emerald-200 to-teal-200',
    'restaurants': 'from-orange-200 via-amber-200 to-yellow-200',
    'cafes': 'from-amber-200 via-yellow-200 to-orange-200',
  };
  const gradient = typeGradients[poi.type] || 'from-blue-200 via-indigo-200 to-purple-200';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-3xl backdrop-saturate-200 border-2 border-white/30 shadow-2xl">
        {/* Hero Image/Gradient */}
        <div className={`-mx-6 -mt-6 mb-6 h-48 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <Sparkles className="h-20 w-20 text-white/80 relative z-10" />
        </div>

        <DialogHeader className="-mt-2">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent pr-8">
            {poi.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location */}
          <div className="flex items-center gap-2 text-neutral-700">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-lg font-medium">{poi.city}</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1.5">
              {poi.type}
            </Badge>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1.5">
              <Sparkles className="h-3 w-3 mr-1" />
              {(poi.score * 100).toFixed(0)}% совпадение
            </Badge>
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Описание</h3>
            <p className="text-neutral-700 leading-relaxed">{poi.description}</p>
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden border-2 border-indigo-100 shadow-lg">
            <div className="h-64 w-full">
              <MapContainer
                center={[poi.lat, poi.lon]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution=""
                />
                <Marker position={[poi.lat, poi.lon]} />
              </MapContainer>
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Широта</p>
              <p className="font-mono text-sm text-gray-900">{poi.lat.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Долгота</p>
              <p className="font-mono text-sm text-gray-900">{poi.lon.toFixed(6)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onSave && (
              <Button
                onClick={() => onSave(poi.id)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg"
              >
                <Heart className="h-4 w-4 mr-2" />
                Добавить в избранное
              </Button>
            )}
            <Button
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lon}`,
                  '_blank'
                );
              }}
              variant="outline"
              className={`border-indigo-200 hover:bg-indigo-50 ${!onSave ? 'flex-1' : ''}`}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Открыть в картах
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

