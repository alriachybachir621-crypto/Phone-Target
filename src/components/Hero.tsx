import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { Language, ShopSettings } from '../types';
import { TranslationKeys } from '../data/translations';
import { DeviceArtwork } from './DeviceArtwork';
import { TargetArrowMotif, WhatsAppIcon } from './TargetMotif';
import { buildWhatsAppHref } from '../utils/whatsapp';

interface HeroProps {
  lang: Language;
  t: TranslationKeys;
  settings: ShopSettings;
}

export const Hero: React.FC<HeroProps> = ({ lang, t, settings }) => {
  const images = settings.heroImages && settings.heroImages.length > 0
    ? settings.heroImages
    : ['studio://hero-s24-ultra'];
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    if (slideIdx >= images.length) {
      setSlideIdx(0);
    }
  }, [images.length, slideIdx]);

  const title = lang === 'ar' ? settings.heroTitleAr || settings.heroTitle : settings.heroTitle;
  const subtitle = lang === 'ar' ? settings.heroSubtitleAr || settings.heroSubtitle : settings.heroSubtitle;
  const perk = lang === 'ar' ? settings.perkBannerAr || settings.perkBanner : settings.perkBanner;

  const whatsappHref = buildWhatsAppHref(
    settings.whatsappNumber,
    lang === 'ar'
      ? 'مرحباً Phone Target، أود الاستفسار عن الهواتف المتوفرة.'
      : 'Hello Phone Target, I would like to inquire about available phones.'
  );

  const DirectionalArrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="bg-white pt-6 sm:pt-10 pb-10 sm:pb-14">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Typography & CTA Column */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2 sm:py-4">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/logo.png"
                  alt="Phone Target"
                  className="w-12 h-12 rounded-full border border-black/[0.08] bg-white object-contain"
                />
                <div className="flex items-center gap-2 text-xs font-medium text-[#111111]/70">
                  <TargetArrowMotif className="w-4 h-4 shrink-0" />
                  <span>{lang === 'ar' ? settings.addressAr : settings.address}</span>
                </div>
              </div>

              <h1
                className="font-display font-bold tracking-tight text-[#111111] leading-[1.08] mb-5 max-w-xl"
                style={{ fontSize: 'clamp(2.15rem, 4.2vw, 3.5rem)', textWrap: 'balance' }}
              >
                {title}
              </h1>

              <p className="text-base sm:text-lg text-[#111111]/70 leading-relaxed max-w-lg mb-8">
                {subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#E0322B] hover:bg-[#c82923] active:scale-[0.98] text-white text-sm font-semibold transition-all duration-150 whitespace-nowrap shadow-sm"
                >
                  <span>{t.shopNow}</span>
                  <DirectionalArrow className="w-4 h-4" />
                </a>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#EEF0F3] hover:bg-[#E2E5EA] active:scale-[0.98] text-[#111111] text-sm font-semibold transition-all duration-150 whitespace-nowrap"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#111111]" />
                  <span>{t.orderWhatsApp}</span>
                </a>
              </div>
            </div>

            {/* Perk Banner */}
            <div className="rounded-xl bg-[#EEF0F3] border border-black/[0.06] px-4 py-3.5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#E0322B] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#111111]/85 leading-relaxed font-medium">
                {perk}
              </p>
            </div>
          </div>

          {/* Right Hero Showcase Stage (Replaceable from Admin) */}
          <div className="lg:col-span-6 relative bg-[#EEF0F3] rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[400px] lg:min-h-[460px] flex items-center justify-center border border-black/[0.04]">
            <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
              <DeviceArtwork
                src={images[slideIdx]}
                alt={title}
                brand="Samsung"
                colorHex={slideIdx % 2 === 0 ? '#232528' : '#B9D6E8'}
                variant="hero"
                className="max-h-[380px] transition-transform duration-300"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSlideIdx((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#111111] flex items-center justify-center shadow-sm transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSlideIdx((prev) => (prev + 1) % images.length)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#111111] flex items-center justify-center shadow-sm transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlideIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === slideIdx ? 'w-6 bg-[#E0322B]' : 'w-1.5 bg-[#111111]/25'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
