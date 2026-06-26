import React from "react";
import { Home, Heart, ShoppingBag, BookOpen, Database } from "lucide-react";
import { Language } from "../types";
import { translations } from "../data/dictionary";

export type TabType = "home" | "food" | "drinks" | "favorites" | "tray" | "admin";

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: Language;
  favoritesCount: number;
  cartCount: number;
}

export default function BottomNavBar({
  activeTab,
  onTabChange,
  language,
  favoritesCount,
  cartCount
}: BottomNavBarProps) {
  const t = translations[language];

  return (
    <nav
      id="mobile-bottom-navbar"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-amber-100/50 dark:border-zinc-900 shadow-[0_-4px_24px_-4px_rgba(245,158,11,0.06)] px-4 py-2"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Menu (Home) Tab */}
        <button
          id="nav-tab-home"
          onClick={() => onTabChange("home")}
          className={`flex flex-col items-center justify-center p-1.5 rounded-2xl w-14 transition-all relative ${
            activeTab === "home"
              ? "text-amber-500 scale-105"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
        >
          <BookOpen size={20} className={activeTab === "home" ? "stroke-[2.5px]" : "stroke-2"} />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Menu</span>
        </button>

        {/* Favorites Tab */}
        <button
          id="nav-tab-favorites"
          onClick={() => onTabChange("favorites")}
          className={`flex flex-col items-center justify-center p-1.5 rounded-2xl w-14 transition-all relative ${
            activeTab === "favorites"
              ? "text-amber-500 scale-105"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
        >
          <div className="relative">
            <Heart size={20} className={activeTab === "favorites" ? "stroke-[2.5px]" : "stroke-2"} />
            {favoritesCount > 0 && (
              <span id="nav-fav-badge" className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                {favoritesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Saved</span>
        </button>

        {/* Tray Tab */}
        <button
          id="nav-tab-tray"
          onClick={() => onTabChange("tray")}
          className={`flex flex-col items-center justify-center p-1.5 rounded-2xl w-14 transition-all relative ${
            activeTab === "tray"
              ? "text-amber-500 scale-105"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
        >
          <div className="relative">
            <ShoppingBag size={20} className={activeTab === "tray" ? "stroke-[2.5px]" : "stroke-2"} />
            {cartCount > 0 && (
              <span id="nav-cart-badge" className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-1 tracking-tight">My Tray</span>
        </button>

        {/* Admin Tab */}
        <button
          id="nav-tab-admin"
          onClick={() => onTabChange("admin")}
          className={`flex flex-col items-center justify-center p-1.5 rounded-2xl w-14 transition-all relative ${
            activeTab === "admin"
              ? "text-amber-500 scale-105"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
        >
          <Database size={20} className={activeTab === "admin" ? "stroke-[2.5px]" : "stroke-2"} />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Admin</span>
        </button>
      </div>
    </nav>
  );
}
