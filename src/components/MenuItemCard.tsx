import React from "react";
import { MenuItem, Language } from "../types";
import { Heart, Plus, Sparkles, Check } from "lucide-react";

interface MenuItemCardProps {
  key?: string | number;
  item: MenuItem;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (itemId: string) => void;
  onOpenDetails: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  isAdded: boolean;
}

export default function MenuItemCard({
  item,
  language,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  onQuickAdd,
  isAdded
}: MenuItemCardProps) {
  const name = language === "en" ? item.nameEn : item.nameAm;
  const description = language === "en" ? item.descriptionEn : item.descriptionAm;

  return (
    <div
      id={`menu-item-card-${item.id}`}
      className="group relative flex flex-col justify-between bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden border border-amber-100/40 dark:border-zinc-900 shadow-[0_2px_12px_-3px_rgba(245,158,11,0.08)] hover:shadow-[0_8px_24px_-6px_rgba(245,158,11,0.15)] transition-all duration-300 transform active:scale-[0.98]"
    >
      {/* Favorite Button (floating) */}
      <button
        id={`btn-fav-${item.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(item.id);
        }}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white dark:hover:bg-zinc-900 transition-colors duration-200"
      >
        <Heart
          id={`heart-icon-${item.id}`}
          size={16}
          className={`transition-transform active:scale-125 ${
            isFavorite ? "fill-red-500 stroke-red-500" : "text-zinc-400 dark:text-zinc-500"
          }`}
        />
      </button>

      {/* Chef's Special Badge */}
      {item.isChefSpecial && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center space-x-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold tracking-wide uppercase rounded-full shadow-sm">
          <Sparkles size={10} className="animate-pulse" />
          <span>Special</span>
        </div>
      )}

      {/* Item Image & Info */}
      <div 
        id={`card-click-area-${item.id}`}
        onClick={() => onOpenDetails(item)} 
        className="cursor-pointer flex-1"
      >
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          <img
            src={item.image}
            alt={name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback image in case the main one fails
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80";
            }}
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-3 py-1 bg-zinc-900 text-white text-[11px] font-bold tracking-wider uppercase rounded-full border border-zinc-700">
                {language === "en" ? "Sold Out" : "ያለቀ"}
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-3">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 line-clamp-1 group-hover:text-amber-600 transition-colors duration-200">
            {name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Bottom price and action */}
      <div className="p-3 pt-0 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">ETB</span>
          <span className="font-bold text-base text-zinc-900 dark:text-zinc-50 font-mono">
            {item.price.toLocaleString()}
          </span>
        </div>

        <button
          id={`btn-add-tray-${item.id}`}
          disabled={!item.isAvailable}
          onClick={() => onQuickAdd(item)}
          className={`flex items-center justify-center p-2 rounded-xl transition-all ${
            !item.isAvailable
              ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
              : isAdded
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-md shadow-amber-500/10"
          }`}
          title="Add to tray"
        >
          {isAdded ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>
    </div>
  );
}
