import React from 'react';
import { Gift, ShieldCheck, Zap } from 'lucide-react';
import { TranslationKeys } from '../data/translations';

interface WhyPhoneTargetProps {
  t: TranslationKeys;
}

export const WhyPhoneTarget: React.FC<WhyPhoneTargetProps> = ({ t }) => {
  const icons = [Gift, ShieldCheck, Zap];

  return (
    <section className="py-12 sm:py-16 border-t border-black/[0.06] bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
            {t.whyTitle}
          </h2>
          <p className="text-sm text-[#111111]/65 mt-1">{t.whySub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.whyCards.map((card, index) => {
            const Icon = icons[index] || ShieldCheck;
            return (
              <div
                key={index}
                className="rounded-2xl bg-[#EEF0F3] p-6 border border-black/[0.04] flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-5 shadow-xs">
                  <Icon className="w-5 h-5 text-[#E0322B]" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-[#111111] mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#111111]/70 leading-relaxed">
                    {card.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
