import React, { useMemo, useState } from 'react';
import { Heart, Search, SlidersHorizontal, X } from 'lucide-react';
import { Brand, Language, Product } from '../types';
import { TranslationKeys } from '../data/translations';
import { DeviceArtwork } from './DeviceArtwork';

interface ProductCatalogProps {
  lang: Language;
  t: TranslationKeys;
  products: Product[];
  selectedBrand: Brand | 'All';
  onSelectBrand: (brand: Brand | 'All') => void;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product, preselectedColorIndex?: number) => void;
}

const BRAND_LIST: Array<Brand | 'All'> = ['All', 'Samsung', 'iPhone', 'Xiaomi', 'Other', 'Accessories'];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  lang,
  t,
  products,
  selectedBrand,
  onSelectBrand,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ramFilter, setRamFilter] = useState<string>('All');
  const [storageFilter, setStorageFilter] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<'All' | 'under250' | '250to600' | 'over600'>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'low' | 'high'>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [cardColorSelection, setCardColorSelection] = useState<Record<string, number>>({});

  const ramOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.ram && p.ram.trim()) set.add(p.ram.trim());
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const storageOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.storageOptions.forEach((s) => {
        if (s.trim()) set.add(s.trim());
      });
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
      if (ramFilter !== 'All' && (p.ram || '').trim() !== ramFilter) return false;
      if (storageFilter !== 'All' && !p.storageOptions.includes(storageFilter)) return false;
      if (priceFilter === 'under250' && p.price >= 250) return false;
      if (priceFilter === '250to600' && (p.price < 250 || p.price > 600)) return false;
      if (priceFilter === 'over600' && p.price <= 600) return false;
      if (q) {
        const haystack = [
          p.name,
          p.nameAr || '',
          p.brand,
          p.ram || '',
          p.storageOptions.join(' '),
          p.description || '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'low') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'high') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [products, selectedBrand, ramFilter, storageFilter, priceFilter, searchQuery, sortBy]);

  const hasActiveFilters =
    selectedBrand !== 'All' ||
    ramFilter !== 'All' ||
    storageFilter !== 'All' ||
    priceFilter !== 'All' ||
    searchQuery.trim() !== '';

  const resetAll = () => {
    onSelectBrand('All');
    setRamFilter('All');
    setStorageFilter('All');
    setPriceFilter('All');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <section id="catalog" className="py-12 sm:py-16 border-t border-black/[0.06] bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
              {t.catalogTitle}
            </h2>
            <p className="text-sm text-[#111111]/65 mt-1">{t.catalogSub}</p>
          </div>
          <span className="text-xs font-medium text-[#111111]/55 tabular-nums">
            {filteredProducts.length} {t.itemsCount}
          </span>
        </div>

        {/* Brand Shortcuts */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-5">
          {BRAND_LIST.map((brand) => {
            const active = selectedBrand === brand;
            const label = brand === 'All' ? t.allBrands : t.brands[brand];
            return (
              <button
                key={brand}
                type="button"
                onClick={() => onSelectBrand(brand)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'bg-[#EEF0F3] text-[#111111]/80 hover:bg-[#E2E5EA] hover:text-[#111111]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search + Filter Toggle Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#111111]/45 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full h-11 ps-10 pe-9 rounded-xl bg-[#EEF0F3] text-sm text-[#111111] placeholder:text-[#111111]/45 focus:outline-none focus:ring-2 focus:ring-[#E0322B]/35 transition-shadow"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-[#111111]/50 hover:text-[#111111]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`h-11 px-4 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
                showFilters || ramFilter !== 'All' || storageFilter !== 'All' || priceFilter !== 'All'
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#EEF0F3] text-[#111111] hover:bg-[#E2E5EA]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>
                {t.filterRam} · {t.filterStorage} · {t.filterPrice}
              </span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'low' | 'high')}
              aria-label={t.sortLabel}
              className="h-11 px-3.5 rounded-xl bg-[#EEF0F3] text-sm font-medium text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E0322B]/35"
            >
              <option value="featured">{t.sortFeatured}</option>
              <option value="low">{t.sortLowHigh}</option>
              <option value="high">{t.sortHighLow}</option>
            </select>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="mb-7 p-4 sm:p-5 rounded-2xl bg-[#EEF0F3] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111]/65 mb-1.5">
                {t.filterRam}
              </label>
              <select
                value={ramFilter}
                onChange={(e) => setRamFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white text-sm text-[#111111] border border-black/[0.06] focus:outline-none"
              >
                {ramOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? t.allOption : opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111]/65 mb-1.5">
                {t.filterStorage}
              </label>
              <select
                value={storageFilter}
                onChange={(e) => setStorageFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white text-sm text-[#111111] border border-black/[0.06] focus:outline-none"
              >
                {storageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? t.allOption : opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111]/65 mb-1.5">
                {t.filterPrice}
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as typeof priceFilter)}
                className="w-full h-10 px-3 rounded-lg bg-white text-sm text-[#111111] border border-black/[0.06] focus:outline-none"
              >
                <option value="All">{t.allOption}</option>
                <option value="under250">{t.priceUnder250}</option>
                <option value="250to600">{t.price250to600}</option>
                <option value="over600">{t.priceOver600}</option>
              </select>
            </div>
          </div>
        )}

        {/* Product Poster Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-[#EEF0F3] rounded-2xl px-6">
            <p className="text-base font-medium text-[#111111]/75 mb-4">{t.noResults}</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAll}
                className="px-5 py-2.5 rounded-xl bg-[#111111] text-white text-sm font-medium hover:bg-[#E0322B] transition-colors"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const displayName = lang === 'ar' ? product.nameAr || product.name : product.name;
              const isWished = wishlistIds.includes(product.id);
              const colorIdx = cardColorSelection[product.id] ?? 0;
              const activeColor = product.colors[colorIdx] || product.colors[0];

              return (
                <article
                  key={product.id}
                  className="group bg-[#EEF0F3] rounded-2xl p-5 flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(17,17,17,0.06)] border border-black/[0.04]"
                >
                  {/* Top Poster Header: Brand + Badge + Wishlist Heart */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#111111]/55">
                          {t.brands[product.brand]}
                        </span>
                        {product.isSale ? (
                          <span className="text-[11px] font-semibold text-[#E0322B]">
                            · {t.saleBadge}
                          </span>
                        ) : product.isNew ? (
                          <span className="text-[11px] font-semibold text-[#E0322B]">
                            · {t.newBadge}
                          </span>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product.id);
                        }}
                        className="w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors shrink-0"
                        aria-label={isWished ? 'Remove from wishlist' : 'Save to wishlist'}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isWished ? 'fill-[#E0322B] text-[#E0322B]' : 'text-[#111111]/70'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Poster Image Frame */}
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product, colorIdx)}
                      className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#E0322B]"
                    >
                      <DeviceArtwork
                        src={product.images[0]}
                        alt={displayName}
                        brand={product.brand}
                        colorHex={activeColor?.hex || '#232528'}
                      />
                    </button>

                    {/* Title & Price Row */}
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product, colorIdx)}
                      className="w-full text-start flex items-start justify-between gap-3 mb-2"
                    >
                      <h3 className="font-display text-lg font-semibold text-[#111111] leading-snug group-hover:text-[#E0322B] transition-colors">
                        {displayName}
                      </h3>
                      <div className="text-end shrink-0 tabular-nums">
                        <span className="text-lg font-bold text-[#111111]">${product.price}</span>
                        {product.oldPrice && product.oldPrice > product.price && (
                          <span className="block text-xs text-[#111111]/45 line-through">
                            ${product.oldPrice}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Specs: RAM & Storage */}
                    <div className="text-xs text-[#111111]/65 mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
                      {product.ram && <span>{product.ram} {t.ramLabel}</span>}
                      {product.ram && product.storageOptions.length > 0 && (
                        <span aria-hidden="true">·</span>
                      )}
                      {product.storageOptions.length > 0 && (
                        <span>{product.storageOptions.join(' / ')}</span>
                      )}
                    </div>
                  </div>

                  {/* Poster Footer: Color Dots + Stock Status */}
                  <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      {product.colors.map((color, idx) => {
                        const selected = idx === colorIdx;
                        return (
                          <button
                            key={`${product.id}-${color.name}-${idx}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardColorSelection((prev) => ({ ...prev, [product.id]: idx }));
                            }}
                            title={color.name}
                            aria-label={color.name}
                            className={`w-5 h-5 rounded-full border transition-transform ${
                              selected
                                ? 'scale-110 ring-2 ring-[#111111] ring-offset-1 ring-offset-[#EEF0F3] border-white'
                                : 'border-black/15 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.hex }}
                          />
                        );
                      })}
                    </div>

                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        product.inStock ? 'text-[#111111]' : 'text-[#E0322B]'
                      }`}
                    >
                      {product.inStock ? t.inStock : t.soldOut}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
