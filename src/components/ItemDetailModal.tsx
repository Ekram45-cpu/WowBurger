import React, { useState } from "react";
import { MenuItem, Language } from "../types";
import { X, Heart, Sparkles, AlertTriangle, Plus, Minus, ShoppingBag } from "lucide-react";
import { translations } from "../data/dictionary";

interface ItemDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (itemId: string) => void;
  onAddToCart: (item: MenuItem, quantity: number, notes: string) => void;
}

export default function ItemDetailModal({
  item,
  isOpen,
  onClose,
  language,
  isFavorite,
  onToggleFavorite,
  onAddToCart
}: ItemDetailModalProps) {
  if (!isOpen || !item) return null;

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const t = translations[language];

  const name = language === "en" ? item.nameEn : item.nameAm;
  const description = language === "en" ? item.descriptionEn : item.descriptionAm;
  const ingredients = language === "en" ? item.ingredientsEn : item.ingredientsAm;
  const allergens = language === "en" ? item.allergensEn : item.allergensAm;

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAdd = () => {
    onAddToCart(item, quantity, notes);
    onClose();
    // Reset state
    setQuantity(1);
    setNotes("");
  };

  return (
    <div id="detail-modal-overlay" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div 
        id="detail-modal-container"
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-t-[2rem] sm:rounded-3xl overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl border-t sm:border border-amber-100/50 dark:border-zinc-900 animate-in fade-in slide-in-from-bottom-8 duration-300"
      >
        {/* Header/Close bar (for mobile dragging vibe) */}
        <div className="sm:hidden flex justify-center py-2 bg-zinc-50 dark:bg-zinc-950">
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-full" onClick={onClose}></div>
        </div>

        {/* Close Button & Favorite Button (overlayed) */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
          <button
            id="modal-btn-fav"
            onClick={() => onToggleFavorite(item.id)}
            className="p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full shadow-md text-zinc-600 dark:text-zinc-400 hover:text-amber-500 active:scale-95 transition-all"
          >
            <Heart
              size={18}
              className={`${
                isFavorite ? "fill-red-500 stroke-red-500 text-red-500" : ""
              }`}
            />
          </button>
          <button
            id="modal-btn-close"
            onClick={onClose}
            className="p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full shadow-md text-zinc-600 dark:text-zinc-400 hover:text-amber-500 active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Contents */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Main Large Image */}
          <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900">
            <img
              src={item.image}
              alt={name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80";
              }}
            />
            {item.isChefSpecial && (
              <div className="absolute bottom-4 left-4 flex items-center space-x-1 px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase rounded-full shadow-lg">
                <Sparkles size={12} className="animate-pulse" />
                <span>{t.chefSpecial}</span>
              </div>
            )}
            {!item.isAvailable && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="px-4 py-2 bg-zinc-900 text-white text-sm font-bold tracking-wider uppercase rounded-full border border-zinc-700">
                  {t.unavailable}
                </span>
              </div>
            )}
          </div>

          {/* Info Details Section */}
          <div className="p-5 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{name}</h2>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className="text-xs text-zinc-400 tracking-wider uppercase font-mono">ETB</span>
                <span className="text-xl font-extrabold text-amber-500 font-mono">
                  {item.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Ingredients */}
            {ingredients && ingredients.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  {t.ingredients}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {ingredients.map((ingredient, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-amber-50 text-amber-900 dark:bg-zinc-900 dark:text-amber-400 text-xs font-medium rounded-lg border border-amber-200/30 dark:border-zinc-800"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens Warning */}
            {allergens && allergens.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start space-x-2.5">
                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider font-mono">
                    {t.allergens}
                  </h4>
                  <p className="text-xs text-red-600 dark:text-red-300">
                    {allergens.join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Special Instructions Notes */}
            {item.isAvailable && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono block">
                  {t.notes}
                </label>
                <textarea
                  id="textarea-modal-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={2}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/35 focus:border-amber-500 transition-all text-zinc-800 dark:text-zinc-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Bottom Tray (Sticky) */}
        {item.isAvailable && (
          <div className="absolute bottom-0 inset-x-0 p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between space-x-3 z-10">
            {/* Quantity Selector */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/55 dark:border-zinc-800 rounded-2xl p-1 shrink-0">
              <button
                id="modal-btn-qty-minus"
                onClick={handleDecrement}
                className="p-2 hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl active:scale-90 transition-all"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-bold text-sm text-zinc-900 dark:text-zinc-50 font-mono">
                {quantity}
              </span>
              <button
                id="modal-btn-qty-plus"
                onClick={handleIncrement}
                className="p-2 hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl active:scale-90 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add to Tray Button */}
            <button
              id="modal-btn-add-to-tray"
              onClick={handleAdd}
              className="flex-1 flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-amber-500/20 transition-all text-sm cursor-pointer"
            >
              <ShoppingBag size={16} />
              <span>{t.addToCart}</span>
              <span className="font-mono text-amber-100 bg-amber-600/40 px-2 py-0.5 rounded-md text-xs">
                {(item.price * quantity).toLocaleString()} ETB
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
