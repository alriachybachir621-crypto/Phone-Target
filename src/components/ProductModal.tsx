import React, { useEffect, useState } from 'react';
import { Check, Gift, Heart, ShoppingBag, X } from 'lucide-react';
import { Language, Product } from '../types';
import { TranslationKeys } from '../data/translations';
import { DeviceArtwork } from './DeviceArtwork';
import { WhatsAppIcon } from './TargetMotif';
import { buildProductOrderMessage, buildWhatsAppHref } from '../utils/whatsapp';

interface ProductModalProps {
  product: Product | null;
  initialColorIndex?: number;
  lang: Language;
  t: TranslationKeys;
  whatsappNumber: string;
  isWished: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (params: {
    product: Product;
    storage: string;
    colorName: string;
    colorHex: string;
  }) => void;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  initialColorIndex = 0,
  lang,
  t,
  whatsappNumber,
  isWished,
  onToggleWishlist,
  onAddToCart,
  onClose,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(initialColorIndex);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    setActiveImageIdx(0);
    setSelectedStorage(product.storageOptions[0] || '');
    setSelectedColorIdx(initialColorIndex < product.colors.length ? initialColorIndex : 0);
    setJustAdded(false);
  }, [product, initialColorIndex]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const displayName = lang === 'ar' ? product.nameAr || product.name : product.name;
  const description = lang === 'ar' ? product.descriptionAr || product.description : product.description;
  const freeGifts = lang === 'ar' ? product.freeGiftsAr || product.freeGifts : product.freeGifts;
  const activeColor = product.colors[selectedColorIdx] || { name: '', hex: '#232528' };
  const images = product.images.length > 0 ? product.images : ['studio://default'];

  const waMessage = buildProductOrderMessage({
    lang,
    name: displayName,
    storage: selectedStorage,
    color: activeColor.name,
    price: product.price,
    freeGifts: freeGifts || undefined,
  });
  const waHref = buildWhatsAppHref(whatsappNumber, waMessage);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    onAddToCart({
      product,
      storage: selectedStorage,
      colorName: activeColor.name,
      colorHex: activeColor.hex,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={displayName}
    >
      <div
        className="bg-white w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl border border-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-5 sm:px-7 py-4 border-b border-black/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#111111]/60">
            <span>{t.brands[product.brand]}</span>
            {product.isSale && <span className="text-[#E0322B]">· {t.saleBadge}</span>}
            {!product.isSale && product.isNew && <span className="text-[#E0322B]">· {t.newBadge}</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleWishlist(product.id)}
              className="w-9 h-9 rounded-full bg-[#EEF0F3] hover:bg-[#E2E5EA] flex items-center justify-center transition-colors"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWished ? 'fill-[#E0322B] text-[#E0322B]' : 'text-[#111111]'}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#EEF0F3] hover:bg-[#E2E5EA] flex items-center justify-center text-[#111111] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          {/* Gallery Left */}
          <div className="md:col-span-6 flex flex-col gap-3">
            <div className="aspect-square rounded-2xl bg-[#EEF0F3] overflow-hidden flex items-center justify-center p-4">
              <DeviceArtwork
                src={images[activeImageIdx]}
                alt={displayName}
                brand={product.brand}
                colorHex={activeColor.hex}
                variant="hero"
              />
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIdx(i)}
                    className={`w-16 h-16 rounded-xl bg-[#EEF0F3] overflow-hidden shrink-0 border-2 transition-all p-1 ${
                      i === activeImageIdx ? 'border-[#E0322B]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <DeviceArtwork
                      src={img}
                      alt={`${displayName} ${i + 1}`}
                      brand={product.brand}
                      colorHex={activeColor.hex}
                      variant="thumb"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Module Right */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="font-display text-2xl font-bold text-[#111111] leading-tight">
                  {displayName}
                </h2>
                <span
                  className={`text-xs font-semibold shrink-0 mt-1 ${
                    product.inStock ? 'text-[#111111]' : 'text-[#E0322B]'
                  }`}
                >
                  {product.inStock ? t.inStock : t.soldOut}
                </span>
              </div>

              <div className="flex items-baseline gap-2.5 mb-4 tabular-nums">
                <span className="text-2xl font-bold text-[#111111]">${product.price}</span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-base text-[#111111]/45 line-through">${product.oldPrice}</span>
                )}
                {product.ram && (
                  <span className="text-xs font-medium text-[#111111]/60 ms-auto">
                    {product.ram} {t.ramLabel}
                  </span>
                )}
              </div>

              {description && (
                <p className="text-sm text-[#111111]/75 leading-relaxed mb-5">
                  {description}
                </p>
              )}

              {/* Storage Selector */}
              {product.storageOptions.length > 0 && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#111111]/65 mb-2">
                    {t.selectStorage}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.storageOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedStorage(opt)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          selectedStorage === opt
                            ? 'bg-[#111111] text-white'
                            : 'bg-[#EEF0F3] text-[#111111] hover:bg-[#E2E5EA]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#111111]/65">
                      {t.selectColor}
                    </span>
                    <span className="text-xs font-medium text-[#111111]">
                      {activeColor.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {product.colors.map((c, idx) => (
                      <button
                        key={`${c.name}-${idx}`}
                        type="button"
                        onClick={() => setSelectedColorIdx(idx)}
                        className={`w-8 h-8 rounded-full border transition-transform ${
                          idx === selectedColorIdx
                            ? 'scale-110 ring-2 ring-[#E0322B] ring-offset-2 border-white'
                            : 'border-black/15 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        aria-label={c.name}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Free Gifts Box */}
              {freeGifts && (
                <div className="mb-6 rounded-2xl bg-[#EEF0F3] p-4 flex items-start gap-3">
                  <Gift className="w-5 h-5 text-[#E0322B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#111111] mb-0.5">
                      {t.freeGiftsTitle}
                    </p>
                    <p className="text-xs text-[#111111]/75 leading-relaxed">
                      {freeGifts}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                className={`flex-1 h-12 px-5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all ${
                  !product.inStock
                    ? 'bg-[#EEF0F3] text-[#111111]/40 cursor-not-allowed'
                    : justAdded
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#EEF0F3] hover:bg-[#E2E5EA] text-[#111111]'
                }`}
              >
                {justAdded ? <Check className="w-4 h-4 text-[#E0322B]" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{justAdded ? t.addedToCart : t.addToCart}</span>
              </button>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-12 px-5 rounded-xl bg-[#E0322B] hover:bg-[#c82923] active:scale-[0.98] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>{t.orderWhatsApp}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
