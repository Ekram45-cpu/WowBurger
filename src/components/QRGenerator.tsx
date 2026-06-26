import React, { useState } from "react";
import { QrCode, Clipboard, Check, Share2, BookOpen, ExternalLink } from "lucide-react";
import { Language } from "../types";
import { translations } from "../data/dictionary";

interface QRGeneratorProps {
  language: Language;
  onSelectTable: (table: string) => void;
  activeTable: string;
}

export default function QRGenerator({
  language,
  onSelectTable,
  activeTable
}: QRGeneratorProps) {
  const t = translations[language];
  const [selectedTable, setSelectedTable] = useState(activeTable || "Table 3");
  const [copied, setCopied] = useState(false);

  const tables = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5", "Table 6", "Bar 1", "Bar 2"];

  // Create a URL pointing directly to the table digital menu!
  const menuUrl = `${window.location.origin}?table=${encodeURIComponent(selectedTable)}`;
  const qrCodeImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=217-119-6&data=${encodeURIComponent(menuUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateScan = () => {
    onSelectTable(selectedTable);
    // Add a flash effect or confirmation message
    alert(`Success! Simulated scanning QR code for ${selectedTable}. Menu loaded!`);
  };

  return (
    <div id="qr-generator-card" className="bg-white dark:bg-zinc-950 border border-amber-100/50 dark:border-zinc-900 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex items-center space-x-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
          <QrCode size={18} />
        </div>
        <div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Table QR Generator</h3>
          <p className="text-[11px] text-zinc-400">Scan QR codes at tables to load the digital menu instantly.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* QR Display */}
        <div className="bg-amber-50/50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-amber-200/20 text-center shrink-0 flex flex-col items-center">
          <img
            id="qr-code-img"
            src={qrCodeImageSrc}
            alt={`QR Code for ${selectedTable}`}
            className="w-36 h-36 bg-white p-2 rounded-xl border border-amber-100 dark:border-zinc-800"
          />
          <span className="mt-2.5 font-bold text-xs text-amber-600 dark:text-amber-400 font-mono">
            {selectedTable}
          </span>
        </div>

        {/* Configurations */}
        <div className="flex-1 space-y-4 w-full">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono block">
              Generate for Table
            </label>
            <select
              id="qr-select-table"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100"
            >
              {tables.map((tbl) => (
                <option key={tbl} value={tbl}>
                  {tbl}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              When a diner scans this QR code at a table, it opens the digital menu and ties orders directly to <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedTable}</span> in our Kitchen Display System.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {/* Simulate Scan */}
              <button
                id="btn-simulate-scan"
                onClick={simulateScan}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                <BookOpen size={13} />
                <span>Simulate Scan</span>
              </button>

              {/* Copy Menu URL */}
              <button
                id="btn-copy-menu-url"
                onClick={handleCopy}
                className="flex items-center space-x-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-xs font-semibold transition-all"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Clipboard size={13} />}
                <span>{copied ? "Copied Link" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
