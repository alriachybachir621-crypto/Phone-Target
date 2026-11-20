import React from 'react';
import { Clock, ExternalLink, Instagram, MapPin, Phone } from 'lucide-react';
import { Language, ShopSettings } from '../types';
import { TranslationKeys } from '../data/translations';
import { TikTokIcon, WhatsAppIcon } from './TargetMotif';
import { buildWhatsAppHref } from '../utils/whatsapp';

interface ContactFooterProps {
  lang: Language;
  t: TranslationKeys;
  settings: ShopSettings;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({ lang, t, settings }) => {
  const address = lang === 'ar' ? settings.addressAr || settings.address : settings.address;
  const hours = lang === 'ar' ? settings.openingHoursAr || settings.openingHours : settings.openingHours;

  const waHref = buildWhatsAppHref(
    settings.whatsappNumber,
    lang === 'ar' ? 'مرحباً Phone Target!' : 'Hello Phone Target!'
  );

  return (
    <>
      <section id="contact" className="py-12 sm:py-16 border-t border-black/[0.06] bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
              {t.contactTitle}
            </h2>
            <p className="text-sm text-[#111111]/65 mt-1">{t.contactSub}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Contact Details */}
            <div className="lg:col-span-5 bg-[#EEF0F3] rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-5">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs">
                    <WhatsAppIcon className="w-5 h-5 text-[#E0322B]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#111111]/55">{t.whatsappLabel}</p>
                    <p className="text-base font-semibold text-[#111111] group-hover:text-[#E0322B] transition-colors tabular-nums" dir="ltr">
                      {settings.whatsappDisplay}
                    </p>
                  </div>
                </a>

                <a
                  href={`tel:${settings.phoneDisplay.replace(/\s+/g, '')}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs">
                    <Phone className="w-5 h-5 text-[#111111]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#111111]/55">{t.phoneLabel}</p>
                    <p className="text-base font-semibold text-[#111111] group-hover:text-[#E0322B] transition-colors tabular-nums" dir="ltr">
                      {settings.phoneDisplay}
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs">
                    <MapPin className="w-5 h-5 text-[#111111]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#111111]/55">{t.addressLabel}</p>
                    <p className="text-base font-semibold text-[#111111]">{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-5 h-5 text-[#111111]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#111111]/55">{t.hoursLabel}</p>
                    <p className="text-sm font-medium text-[#111111]">{hours}</p>
                  </div>
                </div>
              </div>

              <a
                href={settings.mapsLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-4 rounded-xl bg-white hover:bg-[#111111] hover:text-white text-[#111111] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors border border-black/[0.06]"
              >
                <span>{t.openInMaps}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Google Maps Embed */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden bg-[#EEF0F3] border border-black/[0.06] min-h-[300px] lg:min-h-full">
              <iframe
                title="Phone Target Location — Zahle - Haouch El Oumara"
                src={settings.mapsEmbedUrl}
                className="w-full h-full min-h-[300px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/[0.06] bg-white py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Phone Target"
              className="w-10 h-10 rounded-full border border-black/[0.08] bg-white object-contain"
            />
            <div>
              <p className="font-display text-sm font-semibold text-[#111111]">{t.brandName}</p>
              <p className="text-xs text-[#111111]/55">{t.footerTagline}</p>
            </div>
          </div>

          <p className="text-xs text-[#111111]/55 text-center">{t.footerRights}</p>

          <div className="flex items-center gap-2">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-lg bg-[#EEF0F3] hover:bg-[#111111] hover:text-white text-[#111111] flex items-center justify-center transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-9 h-9 rounded-lg bg-[#EEF0F3] hover:bg-[#111111] hover:text-white text-[#111111] flex items-center justify-center transition-colors"
            >
              <TikTokIcon className="w-4 h-4" />
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 rounded-lg bg-[#EEF0F3] hover:bg-[#E0322B] hover:text-white text-[#111111] flex items-center justify-center transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};
