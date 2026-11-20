import React, { useRef } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Language } from '../types';
import { TranslationKeys } from '../data/translations';

interface NavbarProps {
  lang: Language;
  t: TranslationKeys;
  onToggleLang: () => void;
  wishlistCount: number;
  cartCount: number;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onSecretLogoTrigger: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  t,
  onToggleLang,
  wishlistCount,
  cartCount,
  onOpenWishlist,
  onOpenCart,
  onSecretLogoTrigger,
}) => {
  const tapTimesRef = useRef<number[]>([]);

  const handleLogoClick = () => {
    const now = Date.now();
    const recent = tapTimesRef.current.filter((ts) => now - ts < 3000);
    recent.push(now);
    tapTimesRef.current = recent;
    if (recent.length >= 5) {
      tapTimesRef.current = [];
      onSecretLogoTrigger();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/[0.06]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand lockup with official untouched logo (5 taps opens hidden PIN modal) */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E0322B] rounded-lg select-none"
          aria-label="Phone Target"
        >
          <img
            src="/logo.png"
            alt="Phone Target"
            className="w-10 h-10 rounded-full object-contain border border-black/[0.08] bg-white shrink-0"
          />
          <span className="font-display text-base sm:text-lg font-semibold tracking-tight text-[#111111] whitespace-nowrap">
            {t.brandName}
          </span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#111111]/75">
          <a
            href="#catalog"
            className="hover:text-[#111111] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#E0322B]"
          >
            {t.navCatalog}
          </a>
          <a
            href="#new-arrivals"
            className="hover:text-[#111111] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#E0322B]"
          >
            {t.navNew}
          </a>
          <a
            href="#delivery"
            className="hover:text-[#111111] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#E0322B]"
          >
            {t.navDelivery}
          </a>
          <a
            href="#contact"
            className="hover:text-[#111111] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#E0322B]"
          >
            {t.navContact}
          </a>
        </nav>

        {/* Zone 3: Wishlist, Bag, Language Switch */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenWishlist}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg text-[#111111] hover:bg-[#EEF0F3] transition-colors focus-visible:outline-2 focus-visible:outline-[#E0322B]"
            aria-label={t.wishlistTitle}
          >
            <Heart className="w-[18px] h-[18px] stroke-[1.8]" />
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 end-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#111111] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg text-[#111111] hover:bg-[#EEF0F3] transition-colors focus-visible:outline-2 focus-visible:outline-[#E0322B]"
            aria-label={t.cartTitle}
          >
            <ShoppingBag className="w-[18px] h-[18px] stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 end-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E0322B] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            className="h-9 px-3 rounded-lg bg-[#EEF0F3] hover:bg-[#E2E5EA] text-[#111111] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#E0322B]"
          >
            {lang === 'en' ? 'العربية' : 'EN'}
          </button>
        </div>
      </div>
    </header>
  );
};
