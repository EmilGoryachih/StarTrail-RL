"use client";

import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Cookies from "js-cookie";

export default function UserMenu() {
  const router = useRouter();

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleFavorites = () => {
    router.push("/favorites");
  };


  const handleLogout = () => {
    Cookies.remove("access_token");
    if (typeof window !== "undefined") {
      localStorage.removeItem("profile");
    }
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-neutral-200 text-neutral-600">ИИ</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handleProfile}>Профиль</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleFavorites}>Избранное</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>Выйти</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}