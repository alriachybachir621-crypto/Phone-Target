import React, { useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem, Language, ShopSettings } from '../types';
import { TranslationKeys } from '../data/translations';
import { DeviceArtwork } from './DeviceArtwork';
import { WhatsAppIcon } from './TargetMotif';
import { buildCartOrderMessage, buildWhatsAppHref } from '../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  lang: Language;
  t: TranslationKeys;
  items: CartItem[];
  settings: ShopSettings;
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  lang,
  t,
  items,
  settings,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onClose,
}) => {
  const [includeDelivery, setIncludeDelivery] = useState(true);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = includeDelivery && settings.deliveryAvailable ? settings.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const waHref = buildWhatsAppHref(
    settings.whatsappNumber,
    buildCartOrderMessage(items, settings, lang, includeDelivery)
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.cartTitle}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-s border-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#111111]" />
            <h2 className="font-display text-lg font-bold text-[#111111]">{t.cartTitle}</h2>
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
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF0F3] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6 text-[#111111]/45" />
              </div>
              <p className="text-sm text-[#111111]/65 mb-5">{t.cartEmpty}</p>
              <a
                href="#catalog"
                onClick={onClose}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-[#E0322B] transition-colors"
              >
                {t.cartBrowse}
              </a>
            </div>
          ) : (
            items.map((item) => {
              const displayName = lang === 'ar' ? item.nameAr || item.name : item.name;
              return (
                <div
                  key={item.key}
                  className="rounded-2xl bg-[#EEF0F3] p-3.5 flex gap-3.5 items-center"
                >
                  <div className="w-16 h-16 rounded-xl bg-white p-1.5 shrink-0 overflow-hidden">
                    <DeviceArtwork
                      src={item.image}
                      alt={displayName}
                      brand={item.brand}
                      colorHex={item.colorHex}
                      variant="thumb"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm font-semibold text-[#111111] truncate">
                      {displayName}
                    </h3>
                    <p className="text-xs text-[#111111]/60 truncate">
                      {[item.storage, item.colorName].filter(Boolean).join(' · ')}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-[#111111] tabular-nums">
                        ${item.price * item.quantity}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.key, -1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-[#111111] hover:text-white flex items-center justify-center text-[#111111] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.key, 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-[#111111] hover:text-white flex items-center justify-center text-[#111111] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          className="w-7 h-7 rounded-lg text-[#111111]/45 hover:text-[#E0322B] flex items-center justify-center ms-1"
                          aria-label={t.remove}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-black/[0.06] bg-white space-y-4">
            {settings.deliveryAvailable && (
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#EEF0F3]">
                <button
                  type="button"
                  onClick={() => setIncludeDelivery(true)}
                  className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                    includeDelivery ? 'bg-white text-[#111111] shadow-xs' : 'text-[#111111]/60'
                  }`}
                >
                  {t.cartDeliveryToggle} ({settings.deliveryFee === 0 ? t.freeLabel : `$${settings.deliveryFee}`})
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeDelivery(false)}
                  className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                    !includeDelivery ? 'bg-white text-[#111111] shadow-xs' : 'text-[#111111]/60'
                  }`}
                >
                  {t.cartPickupToggle}
                </button>
              </div>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-[#111111]/70">
                <span>{t.subtotal}</span>
                <span className="tabular-nums font-medium">${subtotal}</span>
              </div>
              {includeDelivery && settings.deliveryAvailable && (
                <div className="flex items-center justify-between text-[#111111]/70">
                  <span>{t.deliveryFeeLabel}</span>
                  <span className="tabular-nums font-medium">
                    {deliveryFee === 0 ? t.freeLabel : `$${deliveryFee}`}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-base font-bold text-[#111111] pt-2 border-t border-black/[0.06]">
                <span>{t.total}</span>
                <span className="tabular-nums">${total}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl bg-[#E0322B] hover:bg-[#c82923] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>{t.sendCartWhatsApp}</span>
              </a>
              <button
                type="button"
                onClick={onClearCart}
                className="w-full py-2 text-xs font-medium text-[#111111]/55 hover:text-[#E0322B] transition-colors"
              >
                {t.clearBag}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
