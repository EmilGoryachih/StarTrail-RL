"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MapPin, List, MapIcon, ArrowRight } from "lucide-react"
import Cookies from "js-cookie"
import UserMenu from "@/components/user-menu"

// Динамические импорты Leaflet без SSR
import dynamic from "next/dynamic"
import 'leaflet/dist/leaflet.css'

const MapContainer = dynamic(
    () => import('react-leaflet').then(mod => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then(mod => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then(mod => mod.Marker),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then(mod => mod.Popup),
    { ssr: false }
)

// Моковые данные
const resultsData = [
  { id: 1, name: "Музей современного искусства", image: "/placeholder.svg?height=200&width=400", description: "Небольшой музей с коллекцией современного искусства местных художников. Здесь редко бывает много посетителей.", tags: ["Музей","Искусство","Тихое место"], location: "ул. Пушкина, 15", rating: 4.7, coordinates: { lat: 55.796127, lng: 49.106414 } },
  { id: 2, name: "Старинная библиотека", image: "/placeholder.svg?height=200&width=400", description: "Историческое здание с уникальной архитектурой и тихими залами для чтения и работы.", tags: ["История","Архитектура","Тихое место"], location: "пр. Университетский, 5", rating: 4.9, coordinates: { lat: 55.790127, lng: 49.116414 } },
  { id: 3, name: "Кафе 'Литературное'", image: "/placeholder.svg?height=200&width=400", description: "Уютное кафе с книжными полками и отличным кофе. Популярно среди местных жителей, но не у туристов.", tags: ["Кафе","Книги","Местная атмосфера"], location: "ул. Баумана, 42", rating: 4.8, coordinates: { lat: 55.786127, lng: 49.126414 } },
  { id: 4, name: "Сквер Тукая", image: "/placeholder.svg?height=200&width=400", description: "Тихий сквер с фонтаном и скамейками, где можно отдохнуть от городской суеты.", tags: ["Парк","Тихое место","Природа"], location: "пл. Тукая", rating: 4.6, coordinates: { lat: 55.782127, lng: 49.122414 } },
  { id: 5, name: "Галерея 'Смена'", image: "/placeholder.svg?height=200&width=400", description: "Небольшая галерея с выставками современного искусства и инсталляциями.", tags: ["Искусство","Выставки","Современность"], location: "ул. Бурхана Шахиди, 7", rating: 4.5, coordinates: { lat: 55.788127, lng: 49.112414 } },
]

export default function ResultsPage() {
  const [viewMode, setViewMode] = useState<'list'|'map'>('list')
  const center: [number, number] = [resultsData[0].coordinates.lat, resultsData[0].coordinates.lng]

  // Инициализация иконок Leaflet (только на клиенте)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet')
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
      })
    }
  }, [])

  const homeLink = Cookies.get("access_token") ? "/recommendations" : "/"

  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="border-b py-4 bg-white/80 backdrop-blur-sm">
          <div className="container flex justify-between items-center">
            <Link href={homeLink} className="flex items-center gap-2 group">
              <Sparkles className="h-6 w-6 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">StarTrail</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/search">
                <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50">
                  Изменить запрос
                </Button>
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="flex-1 container py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Результаты поиска
              </h1>
              <p className="text-neutral-700">AI нашел {resultsData.length} идеальных мест для вас</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode==='list'?'default':'outline'} 
                size="sm" 
                onClick={()=>setViewMode('list')} 
                className={`gap-2 ${viewMode==='list' ? 'bg-gradient-to-r from-indigo-600 to-blue-600' : 'border-indigo-200'}`}
              >
                <List className="h-4 w-4" />Список
              </Button>
              <Button 
                variant={viewMode==='map'?'default':'outline'} 
                size="sm" 
                onClick={()=>setViewMode('map')} 
                className={`gap-2 ${viewMode==='map' ? 'bg-gradient-to-r from-indigo-600 to-blue-600' : 'border-indigo-200'}`}
              >
                <MapIcon className="h-4 w-4" />Карта
              </Button>
            </div>
          </div>

          {/* Карта */}
          {viewMode==='map' && (
              <div className="bg-neutral-100 rounded-lg overflow-hidden mb-6">
                <div className="h-[500px] w-full">
                  <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }} attributionControl={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
                    {resultsData.map(place => (
                        <Marker key={place.id} position={[place.coordinates.lat, place.coordinates.lng]}>
                          <Popup><strong>{place.name}</strong><br />{place.location}</Popup>
                        </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
          )}

          {/* Список результатов */}
          <div className="space-y-6 mb-6">
            {resultsData.map(place => (
                <Card key={place.id} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3 relative h-48 md:h-auto">
                      <Image src={place.image} alt={place.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                    <CardContent className="p-5 md:w-2/3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{place.name}</h3>
                      </div>
                      <div className="flex items-center text-neutral-600 text-sm mb-3">
                        <MapPin className="h-3.5 w-3.5 mr-1" />{place.location}
                      </div>
                      <p className="text-neutral-600 mb-4">{place.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {place.tags.map(tag => <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>)}
                      </div>
                      <div className="flex justify-between">
                        <Button variant="ghost" size="sm">Сохранить</Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
            ))}
          </div>

          {/* Кнопка оценки */}
          <div className="flex justify-center mt-10">
            <Link href="/feedback">
              <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
                Оценить результаты<ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>

        <footer className="border-t py-6 bg-white/80 backdrop-blur-sm">
          <div className="container text-center text-neutral-500 text-sm">
            © 2025 StarTrail AI. Intelligent POI Search & Recommendations.
          </div>
        </footer>
      </div>
  )
}