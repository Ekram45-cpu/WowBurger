import React from "react";
import { Language } from "../types";

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LanguageSelector({
  currentLanguage,
  onLanguageChange
}: LanguageSelectorProps) {
  return (
    <div id="language-selector" className="flex items-center space-x-1 bg-amber-50 dark:bg-zinc-900 border border-amber-200/50 dark:border-zinc-800 p-1 rounded-full text-xs">
      <button
        id="btn-lang-en"
        onClick={() => onLanguageChange("en")}
        className={`px-3 py-1.5 rounded-full font-medium transition-all ${
          currentLanguage === "en"
            ? "bg-amber-500 text-white shadow-sm"
            : "text-amber-900 hover:bg-amber-100/50"
        }`}
      >
        🇬🇧 EN
      </button>
      <button
        id="btn-lang-am"
        onClick={() => onLanguageChange("am")}
        className={`px-3 py-1.5 rounded-full font-medium transition-all font-sans ${
          currentLanguage === "am"
            ? "bg-amber-500 text-white shadow-sm"
            : "text-amber-900 hover:bg-amber-100/50"
        }`}
      >
        🇪🇹 አማ
      </button>
    </div>
  );
}
