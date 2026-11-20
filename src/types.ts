export type Brand = 'Samsung' | 'iPhone' | 'Xiaomi' | 'Other' | 'Accessories';

export type Language = 'en' | 'ar';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  brand: Brand;
  price: number;
  oldPrice?: number | null;
  ram?: string;
  storageOptions: string[];
  colors: ColorOption[];
  images: string[];
  freeGifts?: string;
  freeGiftsAr?: string;
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
  description?: string;
  descriptionAr?: string;
  updatedAt?: number;
}

export interface ShopSettings {
  heroTitle: string;
  heroTitleAr: string;
  heroSubtitle: string;
  heroSubtitleAr: string;
  heroImages: string[];
  perkBanner: string;
  perkBannerAr: string;
  deliveryAvailable: boolean;
  deliveryArea: string;
  deliveryAreaAr: string;
  deliveryFee: number;
  deliveryNote: string;
  deliveryNoteAr: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  phoneDisplay: string;
  address: string;
  addressAr: string;
  mapsEmbedUrl: string;
  mapsLinkUrl: string;
  openingHours: string;
  openingHoursAr: string;
  instagramUrl: string;
  tiktokUrl: string;
  updatedAt?: number;
}

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  nameAr?: string;
  brand: Brand;
  price: number;
  storage: string;
  colorName: string;
  colorHex: string;
  image: string;
  freeGifts?: string;
  freeGiftsAr?: string;
  quantity: number;
}
