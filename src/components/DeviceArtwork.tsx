import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { Brand } from '../types';

interface DeviceArtworkProps {
  src?: string;
  alt: string;
  brand?: Brand;
  colorHex?: string;
  className?: string;
  variant?: 'card' | 'hero' | 'thumb';
}

function getShadePair(hex: string) {
  const clean = hex || '#232528';
  return {
    body: clean,
    rim: clean.toLowerCase() === '#f3f4f6' || clean.toLowerCase() === '#ede7dc' ? '#D1D5DB' : '#111111',
  };
}

export const StudioPhoneRender: React.FC<{
  brand?: Brand;
  studioKey?: string;
  colorHex?: string;
  variant?: 'card' | 'hero' | 'thumb';
}> = ({ brand = 'Samsung', studioKey = '', colorHex = '#232528', variant = 'card' }) => {
  const { body } = getShadePair(colorHex);
  const isAccessory = brand === 'Accessories' || studioKey.includes('accessories');
  const isApple = brand === 'iPhone' || studioKey.includes('iphone');
  const isXiaomi = brand === 'Xiaomi' || studioKey.includes('xiaomi');
  const isUltra = studioKey.includes('ultra');
  const isHero = variant === 'hero';

  if (isAccessory) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 select-none">
        <svg viewBox="0 0 240 200" className="w-full h-full max-h-full drop-shadow-md" aria-hidden="true">
          {/* Travel Adapter */}
          <g transform="translate(36, 36)">
            <rect x="0" y="0" width="74" height="106" rx="14" fill={body === '#1F2024' ? '#1F2024' : '#FFFFFF'} stroke="#D5D8DD" strokeWidth="2" />
            <rect x="18" y="106" width="8" height="22" rx="4" fill="#9CA3AF" />
            <rect x="48" y="106" width="8" height="22" rx="4" fill="#9CA3AF" />
            <rect x="27" y="18" width="20" height="8" rx="4" fill="#374151" />
            <circle cx="37" cy="56" r="14" fill="none" stroke="#E0322B" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.65" />
            <text x="37" y="60" textAnchor="middle" fontSize="9" fontWeight="700" fill={body === '#1F2024' ? '#FFFFFF' : '#111111'}>25W</text>
          </g>
          {/* Coiled USB-C Cable */}
          <g transform="translate(132, 46)">
            <rect x="0" y="18" width="66" height="82" rx="18" fill="none" stroke="#111111" strokeWidth="7" opacity="0.88" />
            <rect x="8" y="26" width="50" height="66" rx="12" fill="none" stroke="#D1D5DB" strokeWidth="2" />
            <rect x="24" y="0" width="18" height="20" rx="4" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
            <rect x="28" y="-8" width="10" height="9" rx="2" fill="#9CA3AF" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center ${isHero ? 'p-4 sm:p-8' : 'p-4'} select-none`}>
      <svg
        viewBox={isHero ? '0 0 360 300' : '0 0 260 220'}
        className="w-full h-full max-h-full drop-shadow-[0_18px_28px_rgba(17,17,17,0.14)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`screenGrad-${studioKey}-${body.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B2234" />
            <stop offset="45%" stopColor="#2B4878" />
            <stop offset="78%" stopColor={isApple ? '#B6896B' : '#4E7AA8'} />
            <stop offset="100%" stopColor="#111318" />
          </linearGradient>
          <linearGradient id={`glassBack-${studioKey}-${body.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={body} />
            <stop offset="65%" stopColor={body} />
            <stop offset="100%" stopColor="#0D0E11" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <g transform={isHero ? 'translate(52, 16) scale(1.18)' : 'translate(22, 10)'}>
          {/* Back Phone (shows selected color finish & camera layout) */}
          <g transform="translate(8, 12)">
            <rect
              x="0"
              y="0"
              width="98"
              height="182"
              rx={isUltra ? '8' : '18'}
              fill={`url(#glassBack-${studioKey}-${body.replace('#', '')})`}
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1.5"
            />
            {/* Camera Module */}
            {isApple ? (
              <g transform="translate(10, 12)">
                <rect x="0" y="0" width="38" height="38" rx="10" fill="rgba(0,0,0,0.28)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <circle cx="11" cy="11" r="6" fill="#0B0C0E" stroke="#4B5563" strokeWidth="1.5" />
                <circle cx="11" cy="27" r="6" fill="#0B0C0E" stroke="#4B5563" strokeWidth="1.5" />
                <circle cx="27" cy="19" r="6" fill="#0B0C0E" stroke="#4B5563" strokeWidth="1.5" />
              </g>
            ) : isXiaomi ? (
              <g transform="translate(10, 12)">
                <rect x="0" y="0" width="40" height="40" rx="8" fill="#111215" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <circle cx="12" cy="12" r="5.5" fill="#060708" stroke="#6B7280" strokeWidth="1.2" />
                <circle cx="28" cy="12" r="5.5" fill="#060708" stroke="#6B7280" strokeWidth="1.2" />
                <circle cx="12" cy="28" r="5.5" fill="#060708" stroke="#6B7280" strokeWidth="1.2" />
                <circle cx="28" cy="28" r="3" fill="#E5E7EB" />
              </g>
            ) : (
              /* Samsung vertical camera rings */
              <g transform="translate(13, 14)">
                <circle cx="8" cy="8" r="6.5" fill="#0B0C0F" stroke="#71717A" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="2.6" fill="#1E3A5F" />
                <circle cx="8" cy="26" r="6.5" fill="#0B0C0F" stroke="#71717A" strokeWidth="1.5" />
                <circle cx="8" cy="26" r="2.6" fill="#1E3A5F" />
                <circle cx="8" cy="44" r="6.5" fill="#0B0C0F" stroke="#71717A" strokeWidth="1.5" />
                <circle cx="8" cy="44" r="2.6" fill="#1E3A5F" />
                {isUltra && (
                  <>
                    <circle cx="24" cy="17" r="4" fill="#0B0C0F" stroke="#71717A" strokeWidth="1.2" />
                    <circle cx="24" cy="34" r="4" fill="#0B0C0F" stroke="#71717A" strokeWidth="1.2" />
                  </>
                )}
              </g>
            )}
          </g>

          {/* Front Phone (bezel-less AMOLED display) */}
          <g transform="translate(92, 4)">
            <rect
              x="0"
              y="0"
              width="106"
              height="194"
              rx={isUltra ? '8' : '19'}
              fill="#111111"
              stroke={body}
              strokeWidth="2.5"
            />
            <rect
              x="4"
              y="4"
              width="98"
              height="186"
              rx={isUltra ? '5' : '15'}
              fill={`url(#screenGrad-${studioKey}-${body.replace('#', '')})`}
            />
            {/* Subtle luminous wave wallpaper arc */}
            <path
              d="M4 128 C 36 92, 68 152, 102 104 L 102 190 L 4 190 Z"
              fill="rgba(255,255,255,0.09)"
            />
            <circle cx="53" cy="96" r="26" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
            {/* Front camera / island */}
            {isApple ? (
              <rect x="37" y="10" width="32" height="8" rx="4" fill="#08090B" />
            ) : (
              <circle cx="53" cy="11" r="2.5" fill="#08090B" />
            )}
            {/* S Pen detail for Ultra */}
            {isUltra && (
              <rect x="-12" y="42" width="5" height="132" rx="2.5" fill={body} stroke="#3F3F46" strokeWidth="0.8" />
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};

export const DeviceArtwork: React.FC<DeviceArtworkProps> = ({
  src,
  alt,
  brand = 'Samsung',
  colorHex = '#232528',
  className = '',
  variant = 'card',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const isStudio = !src || src.startsWith('studio://');

  if (isStudio) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#EEF0F3] ${className}`}>
        <StudioPhoneRender
          brand={brand}
          studioKey={src || ''}
          colorHex={colorHex}
          variant={variant}
        />
      </div>
    );
  }

  if (imgFailed) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-[#EEF0F3] text-[#111111]/60 p-4 ${className}`}>
        <Smartphone className="w-8 h-8 mb-2 stroke-[1.5]" />
        <span className="text-xs font-medium text-center line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setImgFailed(true)}
      className={`w-full h-full object-contain ${className}`}
    />
  );
};
