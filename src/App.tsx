import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { Brand, CartItem, Language, Product, ShopSettings } from './types';
import { translations } from './data/translations';
import { DEFAULT_PRODUCTS, DEFAULT_SHOP_SETTINGS } from './data/defaultCatalog';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { NewArrivalsStrip } from './components/NewArrivalsStrip';
import { ProductCatalog } from './components/ProductCatalog';
import { DeliverySection } from './components/DeliverySection';
import { WhyPhoneTarget } from './components/WhyPhoneTarget';
import { GallerySection } from './components/GallerySection';
import { ContactFooter } from './components/ContactFooter';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { ADMIN_EMAIL, AdminPinModal } from './components/AdminPinModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary, WhatsAppIcon } from './components/TargetMotif';
import { buildWhatsAppHref } from './utils/whatsapp';

const WISHLIST_KEY = 'pt_wishlist_v1';
const CART_KEY = 'pt_cart_v1';
const LANG_KEY = 'pt_lang_v1';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      return saved === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });

  const [cloudProducts, setCloudProducts] = useState<Product[] | null>(null);
  const [hasFirestoreShopDoc, setHasFirestoreShopDoc] = useState(false);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);

  const [selectedBrand, setSelectedBrand] = useState<Brand | 'All'>('All');
  const [activeModalState, setActiveModalState] = useState<{
    product: Product;
    colorIndex: number;
  } | null>(null);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Hidden Admin state (never surfaced in public UI)
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const t = translations[lang];

  // Sync HTML dir & lang attributes for full RTL/LTR support
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  // Persist wishlist & cart in browser
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Listen to Firebase Auth session
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAdminUser(Boolean(user && user.email === ADMIN_EMAIL));
    });
    return () => unsub();
  }, []);

  // Listen to public Firestore catalog & shop settings
  useEffect(() => {
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        const list: Product[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, 'id'>),
        }));
        setCloudProducts(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'products');
      }
    );

    const unsubShop = onSnapshot(
      doc(db, 'settings', 'shop'),
      (snap) => {
        if (snap.exists()) {
          setHasFirestoreShopDoc(true);
          setShopSettings({
            ...DEFAULT_SHOP_SETTINGS,
            ...(snap.data() as Partial<ShopSettings>),
          });
        } else {
          setHasFirestoreShopDoc(false);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'settings/shop');
      }
    );

    return () => {
      unsubProducts();
      unsubShop();
    };
  }, []);

  // If Firestore shop doc exists, cloud is authoritative; otherwise show starter catalog until initialized
  const products =
    cloudProducts && (cloudProducts.length > 0 || hasFirestoreShopDoc)
      ? cloudProducts
      : DEFAULT_PRODUCTS;

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleAddToCart = ({
    product,
    storage,
    colorName,
    colorHex,
  }: {
    product: Product;
    storage: string;
    colorName: string;
    colorHex: string;
  }) => {
    const key = `${product.id}__${storage}__${colorName}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          nameAr: product.nameAr,
          brand: product.brand,
          price: product.price,
          storage,
          colorName,
          colorHex,
          image: product.images[0] || '',
          freeGifts: product.freeGifts,
          freeGiftsAr: product.freeGiftsAr,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateCartQty = (key: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.key === key ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleSecretLogoTrigger = () => {
    if (isAdminUser) {
      setIsDashboardOpen(true);
    } else {
      setIsPinModalOpen(true);
    }
  };

  const handleAdminAuthenticated = async (isFirstTimeSetup: boolean) => {
    setIsPinModalOpen(false);
    setIsDashboardOpen(true);

    // On first-time setup, seed default settings & starter catalog into Firestore
    if (isFirstTimeSetup || !hasFirestoreShopDoc) {
      try {
        await setDoc(doc(db, 'settings', 'shop'), {
          ...shopSettings,
          updatedAt: Date.now(),
        });
        if (!cloudProducts || cloudProducts.length === 0) {
          for (const item of DEFAULT_PRODUCTS) {
            const { id, ...rest } = item;
            await setDoc(doc(db, 'products', id), { ...rest, updatedAt: Date.now() });
          }
        }
      } catch (err) {
        console.error('Initial seed warning:', err);
      }
    }
  };

  const totalCartQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const floatingWaHref = buildWhatsAppHref(
    shopSettings.whatsappNumber,
    lang === 'ar' ? 'مرحباً Phone Target، لدي استفسار.' : 'Hello Phone Target, I have a question.'
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-[#111111]">
        <Navbar
          lang={lang}
          t={t}
          onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
          wishlistCount={wishlistIds.length}
          cartCount={totalCartQty}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onSecretLogoTrigger={handleSecretLogoTrigger}
        />

        <main>
          <Hero lang={lang} t={t} settings={shopSettings} />

          <NewArrivalsStrip
            lang={lang}
            t={t}
            products={products}
            onSelectProduct={(product) => setActiveModalState({ product, colorIndex: 0 })}
          />

          <ProductCatalog
            lang={lang}
            t={t}
            products={products}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={(product, colorIndex = 0) =>
              setActiveModalState({ product, colorIndex })
            }
          />

          <DeliverySection lang={lang} t={t} settings={shopSettings} />

          <WhyPhoneTarget t={t} />

          <GallerySection
            lang={lang}
            t={t}
            settings={shopSettings}
            products={products}
            onSelectProduct={(product) => setActiveModalState({ product, colorIndex: 0 })}
          />

          <ContactFooter lang={lang} t={t} settings={shopSettings} />
        </main>

        {/* Floating WhatsApp Button on every page */}
        <a
          href={floatingWaHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="fixed bottom-5 end-5 z-40 w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 text-white shadow-[0_10px_28px_rgba(0,0,0,0.22)] flex items-center justify-center transition-all"
        >
          <WhatsAppIcon className="w-7 h-7" />
        </a>

        {/* Product Detail Modal */}
        <ProductModal
          product={activeModalState?.product || null}
          initialColorIndex={activeModalState?.colorIndex ?? 0}
          lang={lang}
          t={t}
          whatsappNumber={shopSettings.whatsappNumber}
          isWished={
            activeModalState ? wishlistIds.includes(activeModalState.product.id) : false
          }
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onClose={() => setActiveModalState(null)}
        />

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          lang={lang}
          t={t}
          items={cartItems}
          settings={shopSettings}
          onUpdateQty={handleUpdateCartQty}
          onRemoveItem={(key) => setCartItems((prev) => prev.filter((i) => i.key !== key))}
          onClearCart={() => setCartItems([])}
          onClose={() => setIsCartOpen(false)}
        />

        {/* Wishlist Drawer */}
        <WishlistDrawer
          isOpen={isWishlistOpen}
          lang={lang}
          t={t}
          products={products}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onSelectProduct={(product) => setActiveModalState({ product, colorIndex: 0 })}
          onClose={() => setIsWishlistOpen(false)}
        />

        {/* Hidden 4-Digit PIN Modal (5 logo taps) */}
        <AdminPinModal
          isOpen={isPinModalOpen}
          hasFirestoreShopDoc={hasFirestoreShopDoc}
          onClose={() => setIsPinModalOpen(false)}
          onAuthenticated={handleAdminAuthenticated}
        />

        {/* Authenticated Store Manager */}
        <AdminDashboard
          isOpen={isDashboardOpen && isAdminUser}
          products={products}
          settings={shopSettings}
          onClose={() => setIsDashboardOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
