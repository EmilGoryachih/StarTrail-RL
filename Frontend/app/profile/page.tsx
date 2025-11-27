"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import UserMenu from "@/components/user-menu";
import { toast } from "sonner";

interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    city: string;
    about_me: string;
    additional_interests: string;
    interests: string[];
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [city, setCity] = useState("");
    const [aboutMe, setAboutMe] = useState("");
    const [additionalInterests, setAdditionalInterests] = useState("");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const homeLink = Cookies.get("access_token") ? "/recommendations" : "/";

    const availableInterests = [
        'museums', 'art', 'history', 'architecture', 'nature', 'parks',
        'cafes', 'restaurants', 'shopping', 'sports', 'active', 'recreation',
        'nightlife', 'local', 'cuisine', 'photography', 'quiet', 'places'
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            const token = Cookies.get("access_token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const { TokenService } = await import('@/lib/api-config');
                const data = await TokenService.readUsersMeApiTokenCurrentUserGet();
                
                setProfile(data);
                setCity(data.city || "");
                setAboutMe(data.about_me || "");
                setAdditionalInterests(data.additional_interests || "");
                setSelectedInterests(data.interests || []);
            } catch (err) {
                console.error("Failed to load profile:", err);
                setError("Не удалось загрузить профиль");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleSave = async () => {
        if (!profile) return;
        
        setSaving(true);
        setError(null);
        
        const token = Cookies.get("access_token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const { UserService, TokenService } = await import('@/lib/api-config');
            
            // Update city
            if (city !== profile.city) {
                await UserService.updateCityEndpointApiUserUpdateCityPut(city);
            }

            // Update about_me
            if (aboutMe !== profile.about_me) {
                await UserService.updateAboutMeEndpointApiUserupdateAboutMePut(aboutMe);
            }

            // Update additional_interests
            if (additionalInterests !== profile.additional_interests) {
                await UserService.updateAdditionalInterestsEndpointApiUserupdateAdditionalInterestsPut(additionalInterests);
            }

            // Update interests
            if (JSON.stringify(selectedInterests) !== JSON.stringify(profile.interests)) {
                await UserService.updateInterestsEndpointApiUserUpdateInterestsPut(selectedInterests as any);
            }

            // Reload profile
            const updatedData = await TokenService.readUsersMeApiTokenCurrentUserGet();
            setProfile(updatedData);
            
            toast.success("Профиль обновлен!", {
              description: "Ваши изменения успешно сохранены",
            });
        } catch (err) {
            console.error("Failed to save profile:", err);
            setError("Не удалось сохранить изменения");
            toast.error("Ошибка сохранения", {
              description: "Не удалось сохранить изменения",
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-neutral-600">Загрузка профиля...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="text-center bg-red-50 border border-red-200 p-8 rounded-2xl">
                    <p className="text-red-700">Не удалось загрузить профиль</p>
                    <Button onClick={() => router.push("/login")} className="mt-4">
                        Войти снова
                    </Button>
                </div>
            </div>
        );
    }

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
                    <UserMenu />
                </div>
            </header>

            <main className="relative flex-1 container py-12">
                <div className="max-w-2xl mx-auto bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-2xl p-8 rounded-2xl">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        Мой профиль
                    </h1>
                    <p className="text-neutral-600 mb-8">Управляйте своими данными и предпочтениями</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Имя</Label>
                                <Input value={profile.first_name} disabled className="bg-gray-50" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Фамилия</Label>
                                <Input value={profile.last_name} disabled className="bg-gray-50" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Email</Label>
                            <Input value={profile.email} disabled className="bg-gray-50" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-sm font-medium text-gray-700">Город</Label>
                            <Input
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Москва"
                                className="border-indigo-200 focus:border-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="about" className="text-sm font-medium text-gray-700">О себе</Label>
                            <Textarea
                                id="about"
                                value={aboutMe}
                                onChange={(e) => setAboutMe(e.target.value)}
                                placeholder="Расскажите о себе..."
                                rows={3}
                                className="border-indigo-200 focus:border-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="additional" className="text-sm font-medium text-gray-700">
                                Дополнительные интересы
                            </Label>
                            <Textarea
                                id="additional"
                                value={additionalInterests}
                                onChange={(e) => setAdditionalInterests(e.target.value)}
                                placeholder="Опишите дополнительные предпочтения..."
                                rows={2}
                                className="border-indigo-200 focus:border-indigo-500"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">Категории интересов</Label>
                            <div className="flex flex-wrap gap-2">
                                {availableInterests.map((interest) => (
                                    <Badge
                                        key={interest}
                                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                                        className={`cursor-pointer transition-all ${
                                            selectedInterests.includes(interest)
                                                ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                                                : "hover:bg-indigo-50 hover:border-indigo-300"
                                        }`}
                                        onClick={() => toggleInterest(interest)}
                                    >
                                        {interest}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <Button 
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700" 
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Сохранение...
                                </>
                            ) : (
                                "Сохранить изменения"
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/recommendations")}
                            className="border-indigo-200 hover:bg-indigo-50"
                        >
                            К рекомендациям
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
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
