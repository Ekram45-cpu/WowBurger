import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { MenuItem, Order, CartItem, Language, MenuCategory, OrderStatus, OrderItem } from "./types";
import { defaultMenuItems } from "./data/defaultMenu";
import { translations } from "./data/dictionary";

// Components
import LanguageSelector from "./components/LanguageSelector";
import MenuItemCard from "./components/MenuItemCard";
import ItemDetailModal from "./components/ItemDetailModal";
import BottomNavBar, { TabType } from "./components/BottomNavBar";
import CartDrawer from "./components/CartDrawer";
import AdminPanel from "./components/AdminPanel";
import QRGenerator from "./components/QRGenerator";

// Icons
import { Search, Heart, ShoppingBag, BookOpen, Utensils, Sparkles, MapPin, QrCode, Database, RefreshCw, Star } from "lucide-react";

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("Table 3");
  const [loading, setLoading] = useState(true);

  const t = translations[language];

  const hasSeeded = useRef(false);

  // 1. Fetch Menu Items (with Real-time sync + auto seed if empty)
  useEffect(() => {
    const q = query(collection(db, "menu_items"), orderBy("price", "asc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MenuItem);
      });

      if (items.length === 0) {
        if (!hasSeeded.current) {
          hasSeeded.current = true;
          console.log("Database is empty, auto-seeding default menu items...");
          try {
            for (const item of defaultMenuItems) {
              await addDoc(collection(db, "menu_items"), {
                ...item,
                createdAt: new Date().toISOString()
              });
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, "menu_items");
          }
        }
      } else {
        // Filter unique items by nameEn to display in state immediately
        const uniqueItems: MenuItem[] = [];
        const seenNames = new Set<string>();
        items.forEach((item) => {
          const nameKey = item.nameEn.toLowerCase().trim();
          if (!seenNames.has(nameKey)) {
            seenNames.add(nameKey);
            uniqueItems.push(item);
          }
        });

        // Trigger background deletion of any actual duplicate documents in Firestore
        const duplicates = items.filter((item) => {
          const nameKey = item.nameEn.toLowerCase().trim();
          const firstMatch = items.find((i) => i.nameEn.toLowerCase().trim() === nameKey);
          return firstMatch && firstMatch.id !== item.id;
        });

        if (duplicates.length > 0) {
          console.log(`Background cleaning ${duplicates.length} duplicate items...`);
          duplicates.forEach(async (dup) => {
            try {
              await deleteDoc(doc(db, "menu_items", dup.id));
            } catch (err) {
              console.error(`Failed to delete duplicate item ${dup.id}:`, err);
            }
          });
        }

        setMenuItems(uniqueItems);
        setLoading(false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "menu_items");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Active Orders in Real-time (Kitchen Display + status tracking)
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeOrders: Order[] = [];
      snapshot.forEach((doc) => {
        activeOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(activeOrders);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "orders");
    });

    return () => unsubscribe();
  }, []);

  // 3. Load Favorites from LocalStorage
  useEffect(() => {
    const storedFavs = localStorage.getItem("wow_burger_favorites");
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }
  }, []);

  // Toggle Favorite Handler
  const handleToggleFavorite = (itemId: string) => {
    let updated: string[];
    if (favorites.includes(itemId)) {
      updated = favorites.filter((id) => id !== itemId);
    } else {
      updated = [...favorites, itemId];
    }
    setFavorites(updated);
    localStorage.setItem("wow_burger_favorites", JSON.stringify(updated));
  };

  // 4. Cart (Tray) Actions
  const handleAddToCart = (item: MenuItem, quantity: number, notes: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prevCart.map((ci) =>
          ci.menuItem.id === item.id
            ? { ...ci, quantity: ci.quantity + quantity, notes: notes || ci.notes }
            : ci
        );
      }
      return [...prevCart, { menuItem: item, quantity, notes }];
    });
  };

  const handleQuickAdd = (item: MenuItem) => {
    handleAddToCart(item, 1, "");
  };

  const handleUpdateCartQuantity = (menuItemId: string, change: number) => {
    setCart((prevCart) =>
      prevCart
        .map((ci) => {
          if (ci.menuItem.id === menuItemId) {
            const nextQty = ci.quantity + change;
            return { ...ci, quantity: nextQty };
          }
          return ci;
        })
        .filter((ci) => ci.quantity > 0)
    );
  };

  const handleRemoveFromCart = (menuItemId: string) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.menuItem.id !== menuItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // 5. Place Kitchen Order in Firestore
  const handlePlaceOrder = async (selectedTable: string): Promise<boolean> => {
    if (cart.length === 0) return false;

    setTableNumber(selectedTable);

    const orderItems: OrderItem[] = cart.map((ci) => ({
      menuItemId: ci.menuItem.id,
      nameEn: ci.menuItem.nameEn,
      nameAm: ci.menuItem.nameAm,
      quantity: ci.quantity,
      price: ci.menuItem.price,
      notes: ci.notes || ""
    }));

    const totalAmount = cart.reduce((acc, ci) => acc + ci.menuItem.price * ci.quantity, 0);

    const newOrder = {
      tableNumber: selectedTable,
      items: orderItems,
      status: "pending" as OrderStatus,
      totalAmount,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "orders"), newOrder);
      // Store locally so customer can track their active orders on My Tray tab
      const deviceOrders = JSON.parse(localStorage.getItem("wow_burger_device_orders") || "[]");
      deviceOrders.push(newOrder);
      localStorage.setItem("wow_burger_device_orders", JSON.stringify(deviceOrders));

      setCart([]); // Clear cart after ordering
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "orders");
      return false;
    }
  };

  // 6. Admin Panel CMS Hooks (writes directly to Firestore)
  const handleAddMenuItem = async (item: Omit<MenuItem, "id">) => {
    try {
      await addDoc(collection(db, "menu_items"), {
        ...item,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "menu_items");
    }
  };

  const handleUpdateMenuItem = async (itemId: string, item: Partial<MenuItem>) => {
    try {
      const itemRef = doc(db, "menu_items", itemId);
      await updateDoc(itemRef, item);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `menu_items/${itemId}`);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      const itemRef = doc(db, "menu_items", itemId);
      await deleteDoc(itemRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `menu_items/${itemId}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleOpenItemDetails = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  // Filters logic
  const filteredItems = menuItems.filter((item) => {
    // 1. Category check
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }

    // 2. Search check (multi-language search match!)
    if (searchQuery.trim() !== "") {
      const queryLower = searchQuery.toLowerCase();
      const matchEn = item.nameEn.toLowerCase().includes(queryLower) || item.descriptionEn.toLowerCase().includes(queryLower);
      const matchAm = item.nameAm.toLowerCase().includes(queryLower) || item.descriptionAm.toLowerCase().includes(queryLower);
      return matchEn || matchAm;
    }

    return true;
  });

  // Active Device orders list
  const activeDeviceOrders = orders.filter((o) => o.tableNumber === tableNumber);

  return (
    <div id="app-root-container" className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-800 dark:text-zinc-200 selection:bg-amber-500 selection:text-white transition-all duration-300">
      {/* 1. Header (Navbar) */}
      <header id="main-header" className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-amber-100/40 dark:border-zinc-900 shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActiveTab("home"); setSelectedCategory("all"); }}>
            {/* Wow Burger Logo */}
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/15 transform hover:rotate-12 transition-transform duration-300">
              <span className="text-white text-xl font-black italic tracking-tighter">W</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-zinc-950 dark:text-white flex items-center space-x-1.5 leading-none">
                <span>{t.appName}</span>
                <span className="text-amber-500 font-extrabold text-xs">Menu</span>
              </h1>
              <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 mt-1 font-mono">
                Sitlawi Digital Menu
              </p>
            </div>
          </div>

          {/* Quick Info & Actions (Desktop and Mobile) */}
          <div className="flex items-center space-x-3">
            {/* Table Badge */}
            <div className="flex items-center space-x-1.5 bg-amber-50 dark:bg-zinc-900 border border-amber-100/60 dark:border-zinc-800 px-3 py-1.5 rounded-full text-xs font-bold text-amber-900 dark:text-amber-400 font-mono">
              <MapPin size={13} className="text-amber-500 shrink-0" />
              <span>{tableNumber}</span>
            </div>

            {/* Language Selector */}
            <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main id="main-content-layout" className="max-w-7xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* DESKTOP SIDEBAR PANEL (QR Generator & Interactive Testing) - Hidden on Mobile */}
        <section id="desktop-sidebar-pane" className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Table Selection / QR Generator */}
            <QRGenerator
              language={language}
              onSelectTable={(tbl) => { setTableNumber(tbl); setActiveTab("home"); }}
              activeTable={tableNumber}
            />

            {/* Restaurant Stats Badge */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-5 text-white shadow-xl shadow-amber-500/15 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform translate-x-4 -translate-y-4"></div>
              <div className="flex items-center space-x-2">
                <Star size={16} className="fill-white" />
                <span className="text-[10px] uppercase font-bold tracking-widest">WOW Special</span>
              </div>
              <h4 className="text-base font-extrabold leading-tight">Taste the Original Ethiopian Burger Craft!</h4>
              <p className="text-[11px] text-amber-50/80 leading-relaxed">
                Made with premium grass-fed local beef, hand-cut potatoes, and locally sourced vegetables.
              </p>
            </div>
          </div>
        </section>

        {/* MAIN FEED AREA (Menu, Search, Categories, Details) */}
        <section id="main-feed-pane" className="lg:col-span-6 space-y-6">
          {/* SEARCH BAR (Immediately visible on Top) */}
          {(activeTab === "home" || activeTab === "favorites") && (
            <div id="search-input-wrapper" className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors duration-200" size={18} />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-950 border border-amber-100/40 dark:border-zinc-900 rounded-2xl shadow-[0_2px_12px_-4px_rgba(245,158,11,0.06)] focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 text-sm transition-all text-zinc-800 dark:text-zinc-100 font-sans"
              />
              {searchQuery && (
                <button
                  id="btn-clear-search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* ACTIVE CONTENT RENDERING */}
          {activeTab === "home" && (
            <div className="space-y-6">
              {/* CATEGORY TABS (Scrollable Horizontally, Sticky-ready) */}
              <div id="category-tabs-row" className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
                <button
                  id="btn-cat-all"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === "all"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/15"
                      : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-amber-100/30 dark:border-zinc-900 hover:bg-amber-50/50"
                  }`}
                >
                  {t.all}
                </button>
                <button
                  id="btn-cat-food"
                  onClick={() => setSelectedCategory("food")}
                  className={`px-4.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === "food"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/15"
                      : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-amber-100/30 dark:border-zinc-900 hover:bg-amber-50/50"
                  }`}
                >
                  {t.food}
                </button>
                <button
                  id="btn-cat-drinks"
                  onClick={() => setSelectedCategory("drinks")}
                  className={`px-4.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === "drinks"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/15"
                      : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-amber-100/30 dark:border-zinc-900 hover:bg-amber-50/50"
                  }`}
                >
                  {t.drinks}
                </button>
                <button
                  id="btn-cat-specials"
                  onClick={() => setSelectedCategory("specials")}
                  className={`px-4.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === "specials"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/15"
                      : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-amber-100/30 dark:border-zinc-900 hover:bg-amber-50/50"
                  }`}
                >
                  {t.specials}
                </button>
              </div>

              {/* MENU ITEMS GRID - ALWAYS 2-columns on mobile as prioritized! */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="h-8 w-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-zinc-400 font-mono">Syncing Menu with Cloud Firestore...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-900">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No matching items found. Please search something else!</p>
                </div>
              ) : (
                <div id="menu-grid" className="grid grid-cols-2 gap-3 md:gap-4">
                  {filteredItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      language={language}
                      isFavorite={favorites.includes(item.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenDetails={handleOpenItemDetails}
                      onQuickAdd={handleQuickAdd}
                      isAdded={cart.some((ci) => ci.menuItem.id === item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
                <Heart size={18} className="text-red-500 fill-red-500" />
                <span>{t.favorites}</span>
              </h3>

              {favorites.length === 0 ? (
                <div className="bg-white dark:bg-zinc-950 rounded-2xl p-10 text-center border border-zinc-100 dark:border-zinc-900 space-y-3">
                  <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-red-500">
                    <Heart size={20} />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                    {t.noFavorites}
                  </p>
                </div>
              ) : (
                <div id="favorites-grid" className="grid grid-cols-2 gap-3 md:gap-4">
                  {menuItems
                    .filter((item) => favorites.includes(item.id))
                    .map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        language={language}
                        isFavorite={true}
                        onToggleFavorite={handleToggleFavorite}
                        onOpenDetails={handleOpenItemDetails}
                        onQuickAdd={handleQuickAdd}
                        isAdded={cart.some((ci) => ci.menuItem.id === item.id)}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "tray" && (
            <CartDrawer
              cart={cart}
              language={language}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onPlaceOrder={handlePlaceOrder}
              onClearCart={handleClearCart}
              recentOrders={activeDeviceOrders}
            />
          )}

          {activeTab === "admin" && (
            <AdminPanel
              menuItems={menuItems}
              orders={orders}
              onAddMenuItem={handleAddMenuItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              language={language}
            />
          )}
        </section>

        {/* DESKTOP RIGHT DRAWER (Floating Cart & Recent Table Orders) - Hidden on Mobile */}
        <section id="desktop-cart-pane" className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="sticky top-24 space-y-6">
            <CartDrawer
              cart={cart}
              language={language}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onPlaceOrder={handlePlaceOrder}
              onClearCart={handleClearCart}
              recentOrders={activeDeviceOrders}
            />
          </div>
        </section>
      </main>

      {/* 3. Detail Popup Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        language={language}
        isFavorite={selectedItem ? favorites.includes(selectedItem.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
      />

      {/* 4. Bottom Tab Navigation (Mobile Only) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          // Auto filter search if tab corresponds to categories
          if (tab === "home") {
            setSelectedCategory("all");
          }
        }}
        language={language}
        favoritesCount={favorites.length}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
      />
    </div>
  );
}
