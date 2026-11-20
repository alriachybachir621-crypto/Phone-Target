import React from 'react';
import { Heart, Trash2, X } from 'lucide-react';
import { Language, Product } from '../types';
import { TranslationKeys } from '../data/translations';
import { DeviceArtwork } from './DeviceArtwork';

interface WishlistDrawerProps {
  isOpen: boolean;
  lang: Language;
  t: TranslationKeys;
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  lang,
  t,
  products,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onClose,
}) => {
  if (!isOpen) return null;

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.wishlistTitle}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-s border-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-[#E0322B] fill-[#E0322B]" />
            <h2 className="font-display text-lg font-bold text-[#111111]">{t.wishlistTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EEF0F3] hover:bg-[#E2E5EA] flex items-center justify-center text-[#111111] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {savedProducts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF0F3] flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-[#111111]/40" />
              </div>
              <p className="text-sm text-[#111111]/65 max-w-xs mx-auto leading-relaxed">
                {t.wishlistEmpty}
              </p>
            </div>
          ) : (
            savedProducts.map((product) => {
              const displayName = lang === 'ar' ? product.nameAr || product.name : product.name;
              return (
                <div
                  key={product.id}
                  className="rounded-2xl bg-[#EEF0F3] p-3.5 flex items-center gap-3.5"
                >
                  <div className="w-16 h-16 rounded-xl bg-white p-1.5 shrink-0 overflow-hidden">
                    <DeviceArtwork
                      src={product.images[0]}
                      alt={displayName}
                      brand={product.brand}
                      colorHex={product.colors[0]?.hex || '#232528'}
                      variant="thumb"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm font-semibold text-[#111111] truncate">
                      {displayName}
                    </h3>
                    <p className="text-xs font-bold text-[#111111] tabular-nums mt-0.5">
                      ${product.price}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectProduct(product);
                        }}
                        className="text-xs font-semibold text-[#E0322B] hover:underline"
                      >
                        {t.viewDevice}
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleWishlist(product.id)}
                        className="text-xs font-medium text-[#111111]/55 hover:text-[#111111] inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{t.remove}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
