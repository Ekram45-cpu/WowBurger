import React, { useState } from "react";
import { CartItem, Language, MenuItem, Order } from "../types";
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, CheckCircle2, Clock, Check, CookingPot } from "lucide-react";
import { translations } from "../data/dictionary";

interface CartDrawerProps {
  cart: CartItem[];
  language: Language;
  onUpdateQuantity: (menuItemId: string, change: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onPlaceOrder: (tableNumber: string) => Promise<boolean>;
  onClearCart: () => void;
  recentOrders: Order[];
}

export default function CartDrawer({
  cart,
  language,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onClearCart,
  recentOrders
}: CartDrawerProps) {
  const t = translations[language];
  const [tableNumber, setTableNumber] = useState("Table 3");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedSuccess, setPlacedSuccess] = useState(false);

  const tables = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5", "Table 6", "Bar 1", "Bar 2"];

  const subtotal = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!tableNumber) return;
    setIsSubmitting(true);
    const success = await onPlaceOrder(tableNumber);
    setIsSubmitting(false);
    if (success) {
      setPlacedSuccess(true);
      setTimeout(() => {
        setPlacedSuccess(false);
      }, 5000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40";
      case "preparing":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200/40";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40";
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/40";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={12} className="animate-pulse" />;
      case "preparing":
        return <CookingPot size={12} className="animate-spin" />;
      case "delivered":
        return <CheckCircle2 size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return t.statusPending;
      case "preparing": return t.statusPreparing;
      case "delivered": return t.statusDelivered;
      case "cancelled": return t.statusCancelled;
      default: return status;
    }
  };

  return (
    <div id="cart-drawer-container" className="w-full max-w-2xl mx-auto p-4 space-y-6 pb-28">
      {/* Table Selector */}
      <div id="table-selector-card" className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-300 flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>{t.selectTable}</span>
          </h3>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
            Specify your table number to route food directly to your dining spot.
          </p>
        </div>
        <select
          id="select-table-dropdown"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100"
        >
          {tables.map((tbl) => (
            <option key={tbl} value={tbl}>
              {tbl}
            </option>
          ))}
        </select>
      </div>

      {/* Cart Items List */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl p-5 border border-amber-100/50 dark:border-zinc-900 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.04)] space-y-4">
        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
          <span>{t.cart}</span>
          {cart.length > 0 && (
            <button
              id="btn-clear-tray"
              onClick={onClearCart}
              className="text-xs text-red-500 hover:text-red-600 flex items-center space-x-1 font-medium bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-lg border border-red-100/50 dark:border-red-900/35 active:scale-95 transition-all"
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          )}
        </h3>

        {cart.length === 0 ? (
          <div className="text-center py-10 space-y-4">
            <div className="mx-auto w-16 h-16 bg-amber-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-amber-500">
              <ShoppingBag size={24} />
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              {t.emptyCart}
            </p>
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-900">
            {cart.map((item, index) => {
              const name = language === "en" ? item.menuItem.nameEn : item.menuItem.nameAm;
              return (
                <div
                  key={item.menuItem.id}
                  className={`flex items-start space-x-3.5 ${
                    index > 0 ? "pt-4" : ""
                  }`}
                >
                  <img
                    src={item.menuItem.image}
                    alt={name}
                    className="w-14 h-14 object-cover rounded-xl border border-zinc-100 dark:border-zinc-900"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80";
                    }}
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 leading-tight">
                      {name}
                    </h4>
                    {item.notes && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400/85 italic bg-amber-50/50 dark:bg-zinc-900/50 px-2 py-0.5 rounded-md inline-block">
                        "{item.notes}"
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-sm font-semibold text-amber-500">
                        {(item.menuItem.price * item.quantity).toLocaleString()} ETB
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg p-0.5">
                        <button
                          id={`btn-cart-dec-${item.menuItem.id}`}
                          onClick={() => onUpdateQuantity(item.menuItem.id, -1)}
                          className="p-1 text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 rounded-md active:scale-90 transition-all"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          id={`btn-cart-inc-${item.menuItem.id}`}
                          onClick={() => onUpdateQuantity(item.menuItem.id, 1)}
                          className="p-1 text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 rounded-md active:scale-90 transition-all"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    id={`btn-cart-del-${item.menuItem.id}`}
                    onClick={() => onRemoveItem(item.menuItem.id)}
                    className="text-zinc-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}

            {/* Total Block */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
              <div className="flex items-center justify-between text-zinc-800 dark:text-zinc-200">
                <span className="font-medium text-sm">{t.total}</span>
                <span className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50 font-mono">
                  {subtotal.toLocaleString()} ETB
                </span>
              </div>

              {placedSuccess && (
                <div id="cart-success-banner" className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center space-x-2 animate-bounce">
                  <Check size={16} className="text-emerald-500" />
                  <span>{t.orderSuccess}</span>
                </div>
              )}

              <button
                id="btn-place-kitchen-order"
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all text-sm cursor-pointer disabled:opacity-55"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{t.placeOrder}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Orders List for Live Tracking! */}
      {recentOrders.length > 0 && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl p-5 border border-amber-100/50 dark:border-zinc-900 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.04)] space-y-4">
          <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider font-mono">
            Live Order Status
          </h3>
          <div className="space-y-3.5">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {order.tableNumber}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      #{order.id.slice(-4).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {order.items.length} item(s) •{" "}
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">
                      {order.totalAmount.toLocaleString()} ETB
                    </span>
                  </p>
                </div>

                <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{getStatusText(order.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
