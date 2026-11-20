import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Language, Product } from '../types';
import { TranslationKeys } from '../data/translations';
import { DeviceArtwork } from './DeviceArtwork';
import { TargetArrowMotif } from './TargetMotif';

interface NewArrivalsStripProps {
  lang: Language;
  t: TranslationKeys;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const NewArrivalsStrip: React.FC<NewArrivalsStripProps> = ({
  lang,
  t,
  products,
  onSelectProduct,
}) => {
  const newItems = products.filter((p) => p.isNew);
  if (newItems.length === 0) return null;

  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section id="new-arrivals" className="py-10 sm:py-12 border-t border-black/[0.06] bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <TargetArrowMotif className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E0322B]">
                {t.newBadge}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
              {t.newArrivalsTitle}
            </h2>
            <p className="text-sm text-[#111111]/65 mt-1">{t.newArrivalsSub}</p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {newItems.map((product) => {
            const displayName = lang === 'ar' ? product.nameAr || product.name : product.name;
            const defaultColor = product.colors[0]?.hex || '#232528';
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelectProduct(product)}
                className="group snap-start shrink-0 w-[240px] sm:w-[270px] bg-[#EEF0F3] hover:bg-[#E7EAEF] rounded-2xl p-4 text-start transition-all duration-150 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-[#111111]/60 uppercase tracking-wider">
                    {t.brands[product.brand]}
                  </span>
                  <span className="text-[11px] font-semibold text-[#E0322B]">
                    {t.newBadge}
                  </span>
                </div>

                <div className="h-44 w-full rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                  <DeviceArtwork
                    src={product.images[0]}
                    alt={displayName}
                    brand={product.brand}
                    colorHex={defaultColor}
                  />
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-semibold text-[#111111] truncate">
                      {displayName}
                    </h3>
                    <p className="text-xs text-[#111111]/60 mt-0.5 truncate">
                      {[product.ram, product.storageOptions.join(' / ')].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-bold text-[#111111] tabular-nums">
                      ${product.price}
                    </span>
                    <ArrowIcon className="w-3.5 h-3.5 text-[#E0322B] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
