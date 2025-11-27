"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Sparkles, ThumbsUp, Send, Home } from "lucide-react"
import Cookies from "js-cookie"
import UserMenu from "@/components/user-menu"

export default function FeedbackPage() {
  const router = useRouter()
  const [satisfaction, setSatisfaction] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const homeLink = Cookies.get("access_token") ? "/recommendations" : "/"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="border-b py-4 bg-white/80 backdrop-blur-sm">
        <div className="container flex justify-between items-center">
          <Link href={homeLink} className="flex items-center gap-2 group">
            <Sparkles className="h-6 w-6 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">StarTrail</span>
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-lg mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-indigo-100">
          {!submitted ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Как вам наши рекомендации?
                </h1>
                <p className="text-neutral-700">
                  Ваш отзыв поможет AI-системе улучшить качество рекомендаций
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <h2 className="font-medium">Насколько вы довольны предложенными местами?</h2>
                  <RadioGroup value={satisfaction || ""} onValueChange={setSatisfaction}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very-satisfied" id="very-satisfied" />
                      <Label htmlFor="very-satisfied">Очень доволен</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="satisfied" id="satisfied" />
                      <Label htmlFor="satisfied">Доволен</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="neutral" id="neutral" />
                      <Label htmlFor="neutral">Нейтрально</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dissatisfied" id="dissatisfied" />
                      <Label htmlFor="dissatisfied">Не доволен</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very-dissatisfied" id="very-dissatisfied" />
                      <Label htmlFor="very-dissatisfied">Очень не доволен</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <h2 className="font-medium">Что понравилось или не понравилось в рекомендациях?</h2>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Поделитесь своими впечатлениями..."
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="font-medium">Какие места вы посетили?</h2>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="place1" className="rounded" />
                      <Label htmlFor="place1">Музей современного искусства</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="place2" className="rounded" />
                      <Label htmlFor="place2">Старинная библиотека</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="place3" className="rounded" />
                      <Label htmlFor="place3">Кафе 'Литературное'</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="place4" className="rounded" />
                      <Label htmlFor="place4">Сквер Тукая</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="place5" className="rounded" />
                      <Label htmlFor="place5">Галерея 'Смена'</Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
                  Отправить отзыв
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ThumbsUp className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Спасибо за ваш отзыв!
              </h1>
              <p className="text-neutral-700 mb-8">
                AI-система учтет ваши комментарии для улучшения рекомендаций
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto border-indigo-200 hover:bg-indigo-50">
                    <Home className="h-4 w-4" />
                    На главную
                  </Button>
                </Link>
                <Link href="/search">
                  <Button className="gap-2 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
                    Новый поиск
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
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
