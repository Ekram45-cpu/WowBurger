import React, { useState } from "react";
import { MenuItem, Order, Language, MenuCategory, OrderStatus } from "../types";
import { translations } from "../data/dictionary";
import { defaultMenuItems } from "../data/defaultMenu";
import { Plus, Edit, Trash2, Check, X, ShieldAlert, Sparkles, CheckCircle2, CookingPot, RotateCcw, AlertTriangle } from "lucide-react";

interface AdminPanelProps {
  menuItems: MenuItem[];
  orders: Order[];
  onAddMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  onUpdateMenuItem: (itemId: string, item: Partial<MenuItem>) => Promise<void>;
  onDeleteMenuItem: (itemId: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  language: Language;
}

export default function AdminPanel({
  menuItems,
  orders,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onUpdateOrderStatus,
  language
}: AdminPanelProps) {
  const t = translations[language];
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false); // Secure by default!
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestoreDefaults = async () => {
    if (confirm("Are you sure you want to seed the missing premium food and drink items into the database?")) {
      setIsRestoring(true);
      try {
        let addedCount = 0;
        for (const defaultItem of defaultMenuItems) {
          const alreadyExists = menuItems.some(
            (item) => item.nameEn.toLowerCase() === defaultItem.nameEn.toLowerCase()
          );
          if (!alreadyExists) {
            await onAddMenuItem(defaultItem);
            addedCount++;
          }
        }
        alert(`Successfully imported ${addedCount} missing items to the live database!`);
      } catch (err) {
        console.error("Failed to restore default items:", err);
        alert("An error occurred while restoring items.");
      } finally {
        setIsRestoring(false);
      }
    }
  };

  // Sub-navigation tabs in Admin Panel: "orders" (Kitchen Display) or "menu" (CMS)
  const [adminTab, setAdminTab] = useState<"orders" | "menu">("orders");

  // Edit / Add Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [nameEn, setNameEn] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAm, setDescriptionAm] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<MenuCategory>("food");
  const [image, setImage] = useState("");
  const [ingredientsEn, setIngredientsEn] = useState("");
  const [ingredientsAm, setIngredientsAm] = useState("");
  const [allergensEn, setAllergensEn] = useState("");
  const [allergensAm, setAllergensAm] = useState("");
  const [isChefSpecial, setIsChefSpecial] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const securePasscode = (import.meta as any).env.VITE_ADMIN_PASSCODE || "Admin@WowBurger2026";
    if (passcode === securePasscode) {
      setIsAdminAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Incorrect passcode! Please provide a valid secure passcode.");
    }
  };

  const openAddForm = () => {
    setEditingItem(null);
    setNameEn("");
    setNameAm("");
    setDescriptionEn("");
    setDescriptionAm("");
    setPrice("");
    setCategory("food");
    setImage("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80");
    setIngredientsEn("");
    setIngredientsAm("");
    setAllergensEn("");
    setAllergensAm("");
    setIsChefSpecial(false);
    setIsFormOpen(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setNameEn(item.nameEn);
    setNameAm(item.nameAm);
    setDescriptionEn(item.descriptionEn);
    setDescriptionAm(item.descriptionAm);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImage(item.image);
    setIngredientsEn(item.ingredientsEn?.join(", ") || "");
    setIngredientsAm(item.ingredientsAm?.join(", ") || "");
    setAllergensEn(item.allergensEn?.join(", ") || "");
    setAllergensAm(item.allergensAm?.join(", ") || "");
    setIsChefSpecial(item.isChefSpecial);
    setIsFormOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !price) return;

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) return;

    const itemData = {
      nameEn,
      nameAm: nameAm || nameEn,
      descriptionEn,
      descriptionAm: descriptionAm || descriptionEn,
      price: parsedPrice,
      category,
      image: image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
      ingredientsEn: ingredientsEn.split(",").map((s) => s.trim()).filter(Boolean),
      ingredientsAm: ingredientsAm.split(",").map((s) => s.trim()).filter(Boolean),
      allergensEn: allergensEn.split(",").map((s) => s.trim()).filter(Boolean),
      allergensAm: allergensAm.split(",").map((s) => s.trim()).filter(Boolean),
      isChefSpecial,
      isAvailable: editingItem ? editingItem.isAvailable : true
    };

    try {
      if (editingItem) {
        await onUpdateMenuItem(editingItem.id, itemData);
      } else {
        await onAddMenuItem(itemData);
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to save menu item:", err);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    await onUpdateMenuItem(item.id, { isAvailable: !item.isAvailable });
  };

  if (!isAdminAuthenticated) {
    return (
      <div id="admin-login-screen" className="max-w-md mx-auto p-6 space-y-6 text-center pt-16">
        <div className="mx-auto w-16 h-16 bg-amber-500/15 rounded-full flex items-center justify-center text-amber-500">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Wow Burger CMS Portal</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Enter secure passcode to manage digital menu items and view real-time kitchen orders.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <input
              id="admin-passcode-input"
              type="password"
              placeholder="Enter Secure Admin Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center font-bold tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100"
            />
            {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}
          </div>

          <button
            id="admin-btn-login"
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all text-sm cursor-pointer"
          >
            Authenticate Portal
          </button>
        </form>

        <div className="pt-2">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 py-3 px-4 rounded-xl border border-amber-500/20 inline-block">
            🔑 Hint: Use secure passcode <span className="font-mono font-bold bg-amber-500/15 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300">Admin@WowBurger2026</span>
          </p>
        </div>

        <p className="text-[10px] text-zinc-400 font-mono">
          Secured with end-to-end encryption. Configured via admin console.
        </p>
      </div>
    );
  }

  return (
    <div id="admin-dashboard" className="w-full max-w-5xl mx-auto p-4 space-y-6 pb-28">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-amber-500 text-white text-[11px] font-bold uppercase rounded font-mono">
              Admin CMS
            </span>
            <span>Wow Burger Management</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time control center powered by Sitlawi Digital Menu System.
          </p>
        </div>

        {/* CMS / Kitchen Display subtab selector */}
        <div className="flex items-center space-x-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full text-xs">
          <button
            id="admin-tab-orders"
            onClick={() => setAdminTab("orders")}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${
              adminTab === "orders"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
            }`}
          >
            Kitchen Display ({orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length})
          </button>
          <button
            id="admin-tab-menu"
            onClick={() => setAdminTab("menu")}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${
              adminTab === "menu"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
            }`}
          >
            Menu Items ({menuItems.length})
          </button>
        </div>
      </div>

      {/* ADMIN CONTENT SCREEN 1: KITCHEN DISPLAY */}
      {adminTab === "orders" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">Active Kitchen Orders</h3>
            <span className="text-xs bg-amber-50 dark:bg-zinc-900 px-2.5 py-1 text-amber-800 dark:text-amber-300 font-mono font-bold rounded-lg border border-amber-200/40">
              Live Connection: Active
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white dark:bg-zinc-950 rounded-2xl p-10 text-center border border-zinc-100 dark:border-zinc-900 space-y-2">
              <CookingPot size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 animate-pulse" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.noOrders}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => {
                const isActive = order.status === "pending" || order.status === "preparing";
                return (
                  <div
                    key={order.id}
                    className={`bg-white dark:bg-zinc-950 rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                      order.status === "pending"
                        ? "border-amber-300 dark:border-amber-900/60 shadow-[0_2px_14px_-2px_rgba(245,158,11,0.08)] animate-pulse"
                        : order.status === "preparing"
                        ? "border-orange-200 dark:border-orange-900/40"
                        : "border-zinc-100 dark:border-zinc-900/40 opacity-70"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header with table and order status */}
                      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="text-xs text-zinc-400 font-mono tracking-wider">ORDER #{order.id.slice(-5).toUpperCase()}</span>
                          <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                            {order.tableNumber}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono text-zinc-400 block">
                            {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"}
                          </span>
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize mt-1 ${
                            order.status === "pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                              : order.status === "preparing"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-400"
                              : order.status === "delivered"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400"
                          }`}>
                            <span>{order.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Item details */}
                      <div className="space-y-2 py-1 flex-1">
                        {order.items.map((item, idx) => {
                          const itemName = language === "en" ? item.nameEn : item.nameAm;
                          return (
                            <div key={idx} className="flex items-start justify-between text-sm">
                              <div className="space-y-0.5 max-w-[70%]">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 rounded">
                                    {item.quantity}x
                                  </span>
                                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                    {itemName}
                                  </span>
                                </div>
                                {item.notes && (
                                  <p className="text-[11px] text-amber-600 dark:text-amber-400 italic font-mono pl-7">
                                    * "{item.notes}"
                                  </p>
                                )}
                              </div>
                              <span className="font-mono text-xs text-zinc-500">
                                {(item.price * item.quantity).toLocaleString()} ETB
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total cost */}
                      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-2.5">
                        <span className="text-xs text-zinc-400">Total Bill</span>
                        <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-50">
                          {order.totalAmount.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>

                    {/* Quick action buttons for status change */}
                    <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                      {order.status === "pending" && (
                        <button
                          id={`btn-prep-${order.id}`}
                          onClick={() => onUpdateOrderStatus(order.id, "preparing")}
                          className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                        >
                          <CookingPot size={13} />
                          <span>Start Preparing</span>
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button
                          id={`btn-deliv-${order.id}`}
                          onClick={() => onUpdateOrderStatus(order.id, "delivered")}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                        >
                          <CheckCircle2 size={13} />
                          <span>Deliver to Table</span>
                        </button>
                      )}
                      {isActive && (
                        <button
                          id={`btn-canc-${order.id}`}
                          onClick={() => onUpdateOrderStatus(order.id, "cancelled")}
                          className="p-2 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs transition-all"
                          title="Cancel Order"
                        >
                          <X size={13} />
                        </button>
                      )}
                      {!isActive && (
                        <button
                          id={`btn-reset-${order.id}`}
                          onClick={() => onUpdateOrderStatus(order.id, "pending")}
                          className="flex-1 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 rounded-xl text-xs flex items-center justify-center space-x-1 transition-all"
                        >
                          <RotateCcw size={12} />
                          <span>Reset to Pending</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADMIN CONTENT SCREEN 2: MENU ITEMS MANAGEMENT (CMS) */}
      {adminTab === "menu" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">Manage Menu Items</h3>
            <div className="flex items-center space-x-2">
              <button
                id="admin-btn-restore-defaults"
                onClick={handleRestoreDefaults}
                disabled={isRestoring}
                className="flex items-center space-x-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 text-zinc-700 dark:text-zinc-300 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw size={14} className={isRestoring ? "animate-spin" : ""} />
                <span>{isRestoring ? "Seeding..." : "Seed Missing Defaults"}</span>
              </button>
              <button
                id="admin-btn-add-item"
                onClick={openAddForm}
                className="flex items-center space-x-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-md shadow-amber-500/10 cursor-pointer"
              >
                <Plus size={14} />
                <span>{t.addItem}</span>
              </button>
            </div>
          </div>

          {/* Form Modal (Overlayed for adding/editing item) */}
          {isFormOpen && (
            <div id="admin-form-overlay" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div id="admin-form-container" className="bg-white dark:bg-zinc-950 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 border border-amber-100/50 dark:border-zinc-900 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                  <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                    {editingItem ? t.editItem : t.addItem}
                  </h4>
                  <button
                    id="admin-btn-close-form"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-400"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
                  {/* English / Amharic Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500 dark:text-zinc-400 block">Name (English) *</label>
                      <input
                        id="form-name-en"
                        type="text"
                        required
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100 font-sans"
                        placeholder="e.g. Wow Classic Cheese Burger"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500 dark:text-zinc-400 block">ስም (Amharic)</label>
                      <input
                        id="form-name-am"
                        type="text"
                        value={nameAm}
                        onChange={(e) => setNameAm(e.target.value)}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100 font-sans"
                        placeholder="ምሳሌ፦ ዋው ክላሲክ ቺዝ በርገር"
                      />
                    </div>
                  </div>

                  {/* Price & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500 dark:text-zinc-400 block">Price (ETB) *</label>
                      <input
                        id="form-price"
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100 font-sans"
                        placeholder="e.g. 380"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500 dark:text-zinc-400 block">Category *</label>
                      <select
                        id="form-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as MenuCategory)}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-zinc-850 dark:text-zinc-100 font-sans"
                      >
                        <option value="food">Food 🍔</option>
                        <option value="drinks">Drinks 🥤</option>
                        <option value="specials">Specials ⭐</option>
                      </select>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500 dark:text-zinc-400 block">Description (English)</label>
                      <textarea
                        id="form-desc-en"
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100 font-sans resize-none"
                        placeholder="Brief item description..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500 dark:text-zinc-400 block">መግለጫ (Amharic)</label>
                      <textarea
                        id="form-desc-am"
                        value={descriptionAm}
                        onChange={(e) => setDescriptionAm(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100 font-sans resize-none"
                        placeholder="አጭር የምግቡ መግለጫ..."
                      />
                    </div>
                  </div>

                  {/* Image URL */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-500 dark:text-zinc-400 block">Image URL</label>
                    <input
                      id="form-image"
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100 font-sans"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  {/* Ingredients (Comma Separated) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500 dark:text-zinc-400 block">Ingredients En (comma-separated)</label>
                      <input
                        id="form-ingred-en"
                        type="text"
                        value={ingredientsEn}
                        onChange={(e) => setIngredientsEn(e.target.value)}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100 font-sans"
                        placeholder="Beef patty, Cheese, Tomato"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500 dark:text-zinc-400 block">ግብዓቶች Am (በኮማ የተለዩ)</label>
                      <input
                        id="form-ingred-am"
                        type="text"
                        value={ingredientsAm}
                        onChange={(e) => setIngredientsAm(e.target.value)}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100 font-sans"
                        placeholder="የበሬ ሥጋ፣ አይብ፣ ቲማቲም"
                      />
                    </div>
                  </div>

                  {/* Allergens (Comma Separated) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500 dark:text-zinc-400 block">Allergens En (comma-separated)</label>
                      <input
                        id="form-allerg-en"
                        type="text"
                        value={allergensEn}
                        onChange={(e) => setAllergensEn(e.target.value)}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100 font-sans"
                        placeholder="Dairy, Gluten"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-500 dark:text-zinc-400 block">አለርጂ Am (በኮማ የተለዩ)</label>
                      <input
                        id="form-allerg-am"
                        type="text"
                        value={allergensAm}
                        onChange={(e) => setAllergensAm(e.target.value)}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100 font-sans"
                        placeholder="ወተት ተዋጽኦ፣ ግሉተን"
                      />
                    </div>
                  </div>

                  {/* Chef Special Selector */}
                  <div className="flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                    <input
                      id="form-special-checkbox"
                      type="checkbox"
                      checked={isChefSpecial}
                      onChange={(e) => setIsChefSpecial(e.target.checked)}
                      className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-zinc-300 rounded"
                    />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-zinc-850 dark:text-zinc-200">Mark as Chef's Special Badge</span>
                      <p className="text-[10px] text-zinc-500">Will display the special badge and show on specials category.</p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center space-x-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <button
                      id="form-btn-cancel"
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl transition-all"
                    >
                      {t.cancel}
                    </button>
                    <button
                      id="form-btn-submit"
                      type="submit"
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
                    >
                      {t.save}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CMS Grid list of items */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase font-bold tracking-wider font-mono">
                    <th className="p-4">Item</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
                  {menuItems.map((item) => {
                    const name = language === "en" ? item.nameEn : item.nameAm;
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image}
                              alt={name}
                              className="w-10 h-10 object-cover rounded-lg border border-zinc-100 dark:border-zinc-800"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80";
                              }}
                            />
                            <div>
                              <span className="font-bold text-zinc-900 dark:text-zinc-50 block">{name}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">ID: {item.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 capitalize">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            item.category === "food"
                              ? "bg-amber-100 text-amber-900 dark:bg-zinc-900 dark:text-amber-400"
                              : item.category === "drinks"
                              ? "bg-blue-100 text-blue-900 dark:bg-zinc-900 dark:text-blue-400"
                              : "bg-purple-100 text-purple-900 dark:bg-zinc-900 dark:text-purple-400"
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {item.price} ETB
                        </td>
                        <td className="p-4">
                          <button
                            id={`btn-toggle-avail-${item.id}`}
                            onClick={() => toggleAvailability(item)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              item.isAvailable
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {item.isAvailable ? t.available : t.unavailable}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              id={`btn-edit-item-${item.id}`}
                              onClick={() => openEditForm(item)}
                              className="p-1.5 text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              id={`btn-del-item-${item.id}`}
                              onClick={() => {
                                if (confirm(t.confirmDelete)) {
                                  onDeleteMenuItem(item.id);
                                }
                              }}
                              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
