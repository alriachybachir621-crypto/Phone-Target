import React from 'react';
import { ArrowUpRight, Instagram } from 'lucide-react';
import { Language, Product, ShopSettings } from '../types';
import { TranslationKeys } from '../data/translations';
import { DeviceArtwork } from './DeviceArtwork';
import { TikTokIcon } from './TargetMotif';

interface GallerySectionProps {
  lang: Language;
  t: TranslationKeys;
  settings: ShopSettings;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  lang,
  t,
  settings,
  products,
  onSelectProduct,
}) => {
  const showcaseItems = products.slice(0, 4);

  return (
    <section className="py-12 sm:py-16 border-t border-black/[0.06] bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
              {t.galleryTitle}
            </h2>
            <p className="text-sm text-[#111111]/65 mt-1">{t.gallerySub}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEF0F3] hover:bg-[#111111] hover:text-white text-[#111111] text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Instagram className="w-4 h-4 text-[#E0322B]" />
              <span>{t.followInstagram}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </a>

            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEF0F3] hover:bg-[#111111] hover:text-white text-[#111111] text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <TikTokIcon className="w-4 h-4" />
              <span>{t.followTikTok}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {showcaseItems.map((item) => {
            const displayName = lang === 'ar' ? item.nameAr || item.name : item.name;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectProduct(item)}
                className="group relative aspect-square rounded-2xl bg-[#EEF0F3] overflow-hidden p-4 text-start transition-transform duration-150 hover:-translate-y-0.5"
              >
                <DeviceArtwork
                  src={item.images[0]}
                  alt={displayName}
                  brand={item.brand}
                  colorHex={item.colors[0]?.hex || '#232528'}
                />
                <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 backdrop-blur-xs px-3 py-2 flex items-center justify-between gap-2 opacity-95 group-hover:opacity-100">
                  <span className="text-xs font-semibold text-[#111111] truncate">{displayName}</span>
                  <span className="text-xs font-bold text-[#E0322B] tabular-nums shrink-0">${item.price}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
