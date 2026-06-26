export type Language = "en" | "am";

export type MenuCategory = "food" | "drinks" | "specials";

export interface MenuItem {
  id: string;
  nameEn: string;
  nameAm: string;
  descriptionEn: string;
  descriptionAm: string;
  price: number; // in ETB
  category: MenuCategory;
  image: string;
  ingredientsEn: string[];
  ingredientsAm: string[];
  allergensEn: string[];
  allergensAm: string[];
  isChefSpecial: boolean;
  isAvailable: boolean;
  createdAt?: any;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface OrderItem {
  menuItemId: string;
  nameEn: string;
  nameAm: string;
  quantity: number;
  price: number;
  notes?: string;
}

export type OrderStatus = "pending" | "preparing" | "delivered" | "cancelled";

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: any;
}

export interface Dictionary {
  appName: string;
  searchPlaceholder: string;
  all: string;
  food: string;
  drinks: string;
  specials: string;
  favorites: string;
  cart: string;
  orderNow: string;
  emptyCart: string;
  total: string;
  notes: string;
  notesPlaceholder: string;
  allergens: string;
  ingredients: string;
  addToCart: string;
  addedToCart: string;
  orderSuccess: string;
  orderError: string;
  tableNumber: string;
  selectTable: string;
  placeOrder: string;
  chefSpecial: string;
  adminPanel: string;
  manageMenu: string;
  viewOrders: string;
  noOrders: string;
  noFavorites: string;
  available: string;
  unavailable: string;
  editItem: string;
  addItem: string;
  deleteItem: string;
  confirmDelete: string;
  statusPending: string;
  statusPreparing: string;
  statusDelivered: string;
  statusCancelled: string;
  save: string;
  cancel: string;
}
