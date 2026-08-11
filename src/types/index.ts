export type Category =
  | "accessories"
  | "buds"
  | "laptop"
  | "led-signage"
  | "mobile"
  | "monitors"
  | "projectors"
  | "sound-devices"
  | "tablets"
  | "tv-av"
  | "watches"
  | "discounted";

  export interface ProductSize {
    label: string;
    price: number;
    originalPrice?: number;
    inStock: boolean;
  }
  
  export interface ColorSwatch {
    name: string;
    hex: string;
  }

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  images?: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  sizes?: ProductSize[];
  colors?: string[];
  colorSwatches?: ColorSwatch[];
  isDailyHighlight?: boolean;
  highlightExpiresAt?: string;
  isPopularPick?: boolean;
  isPopularPickBanner?: boolean;
  isBigSavings?: boolean;
  discountPercent?: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

export interface Order {
  id: string;
  items: OrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    emirate: string;
  };
  subtotal: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "accessories", label: "Accessories", icon: "🔌" },
  { id: "buds", label: "Buds", icon: "🎧" },
  { id: "laptop", label: "Laptop", icon: "💻" },
  { id: "led-signage", label: "LED Signage", icon: "📺" },
  { id: "mobile", label: "Mobile", icon: "📱" },
  { id: "monitors", label: "Monitors", icon: "🖥️" },
  { id: "projectors", label: "Projectors", icon: "📽️" },
  { id: "sound-devices", label: "Sound Devices", icon: "🔊" },
  { id: "tablets", label: "Tablets", icon: "📲" },
  { id: "tv-av", label: "TV & AV", icon: "📺" },
  { id: "watches", label: "Watches", icon: "⌚" },
  { id: "discounted", label: "Discounted", icon: "🏷️" },
];

export const BRANDS = [
  { id: "Apple",   name: "Apple",   logo: "/brands/apple.svg" },
  { id: "Samsung", name: "Samsung", logo: "/brands/samsung.svg" },
  { id: "Sony",    name: "Sony",    logo: "/brands/sony.svg" },
  { id: "LG",      name: "LG",      logo: "/brands/lg.svg" },
  { id: "Huawei",  name: "Huawei",  logo: "/brands/huawei.svg" },
  { id: "Philips", name: "Philips", logo: "/brands/philips.svg" },
  { id: "HP",      name: "HP",      logo: "/brands/hp.svg" },
  { id: "Dell",    name: "Dell",    logo: "/brands/dell.svg" },
  { id: "Xiaomi",  name: "Xiaomi",  logo: "/brands/xiaomi.svg" },
  { id: "Lenovo",  name: "Lenovo",  logo: "/brands/lenovo.svg" },
];

export interface HeroBanner {
  slot: 1 | 2;
  heading: string;
  subheading?: string;
  buttonText: string;
  linkHref: string;
  imageUrl: string;
}

export interface AnnouncementMessage {
  id: string;
  text: string;
  displayOrder: number;
}