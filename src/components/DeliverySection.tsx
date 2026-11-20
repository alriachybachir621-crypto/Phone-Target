import React, { useState } from 'react';
import { MapPin, Truck } from 'lucide-react';
import { Language, ShopSettings } from '../types';
import { TranslationKeys } from '../data/translations';
import { WhatsAppIcon } from './TargetMotif';
import { buildDeliveryFormMessage, buildWhatsAppHref } from '../utils/whatsapp';

interface DeliverySectionProps {
  lang: Language;
  t: TranslationKeys;
  settings: ShopSettings;
}

export const DeliverySection: React.FC<DeliverySectionProps> = ({ lang, t, settings }) => {
  const [customerName, setCustomerName] = useState('');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const deliveryArea = lang === 'ar' ? settings.deliveryAreaAr || settings.deliveryArea : settings.deliveryArea;
  const deliveryNote = lang === 'ar' ? settings.deliveryNoteAr || settings.deliveryNote : settings.deliveryNote;

  const waHref = buildWhatsAppHref(
    settings.whatsappNumber,
    buildDeliveryFormMessage({ lang, customerName, area, phone, notes })
  );

  return (
    <section id="delivery" className="py-12 sm:py-16 border-t border-black/[0.06] bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="bg-[#EEF0F3] rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Info */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-xs">
                <Truck className="w-5 h-5 text-[#E0322B]" />
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] mb-3">
                {t.deliveryHeading}
              </h2>

              <p className="text-sm sm:text-base text-[#111111]/75 leading-relaxed mb-6">
                {deliveryNote}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-black/[0.08]">
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-semibold text-[#111111]/55 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E0322B]" />
                  {t.deliveryAreaLabel}
                </span>
                <span className="text-sm font-semibold text-[#111111] text-end">
                  {deliveryArea}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-[#111111]/55">
                  {t.deliveryFeeLabel}
                </span>
                <span className="text-sm font-bold text-[#111111] tabular-nums">
                  {!settings.deliveryAvailable
                    ? '—'
                    : settings.deliveryFee === 0
                    ? t.freeLabel
                    : `$${settings.deliveryFee}`}
                </span>
              </div>
            </div>
          </div>

          {/* Right Quick Delivery Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-7 border border-black/[0.05]">
            <h3 className="font-display text-lg font-semibold text-[#111111] mb-4">
              {t.deliveryFormTitle}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111]/70 mb-1.5">
                  {t.formName}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t.formNamePh}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#EEF0F3] text-sm text-[#111111] placeholder:text-[#111111]/40 focus:outline-none focus:ring-2 focus:ring-[#E0322B]/35"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111]/70 mb-1.5">
                  {t.formPhone}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.formPhonePh}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#EEF0F3] text-sm text-[#111111] placeholder:text-[#111111]/40 focus:outline-none focus:ring-2 focus:ring-[#E0322B]/35"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#111111]/70 mb-1.5">
                {t.formArea}
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder={t.formAreaPh}
                className="w-full h-11 px-3.5 rounded-xl bg-[#EEF0F3] text-sm text-[#111111] placeholder:text-[#111111]/40 focus:outline-none focus:ring-2 focus:ring-[#E0322B]/35"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-[#111111]/70 mb-1.5">
                {t.formNotes}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.formNotesPh}
                className="w-full p-3.5 rounded-xl bg-[#EEF0F3] text-sm text-[#111111] placeholder:text-[#111111]/40 focus:outline-none focus:ring-2 focus:ring-[#E0322B]/35 resize-none"
              />
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-[#111111] hover:bg-[#E0322B] active:scale-[0.99] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>{t.sendDeliveryWhatsApp}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
