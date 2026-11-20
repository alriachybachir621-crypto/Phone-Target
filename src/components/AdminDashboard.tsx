import React, { useState } from 'react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  Check,
  KeyRound,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType, storage } from '../firebase';
import { Brand, ColorOption, Product, ShopSettings } from '../types';
import { ADMIN_EMAIL, PASSCODE_SUFFIX } from './AdminPinModal';
import { DeviceArtwork } from './DeviceArtwork';
import { DEFAULT_PRODUCTS } from '../data/defaultCatalog';

interface AdminDashboardProps {
  isOpen: boolean;
  products: Product[];
  settings: ShopSettings;
  onClose: () => void;
}

const STUDIO_PRESETS = [
  { label: 'Samsung S24 Ultra', value: 'studio://samsung-s24-ultra' },
  { label: 'Samsung A55', value: 'studio://samsung-a55' },
  { label: 'Samsung S23 Ultra', value: 'studio://samsung-s23-ultra' },
  { label: 'Samsung S23 FE', value: 'studio://samsung-s23-fe' },
  { label: 'Samsung A34', value: 'studio://samsung-a34' },
  { label: 'Samsung A15', value: 'studio://samsung-a15' },
  { label: 'Samsung A05s', value: 'studio://samsung-a05s' },
  { label: 'iPhone 16 Pro', value: 'studio://iphone-16-pro' },
  { label: 'Xiaomi 14T', value: 'studio://xiaomi-14t' },
  { label: 'Accessories Kit', value: 'studio://accessories-kit' },
];

function slugifyId(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'item'}-${Date.now().toString(36)}`;
}

const EMPTY_PRODUCT: Product = {
  id: '',
  name: '',
  nameAr: '',
  brand: 'Samsung',
  price: 0,
  oldPrice: null,
  ram: '8 GB',
  storageOptions: ['128 GB', '256 GB'],
  colors: [{ name: 'Black', hex: '#232528' }],
  images: ['studio://samsung-a55'],
  freeGifts: 'Free protective screen, silicone case & original adapter',
  freeGiftsAr: 'شاشة حماية + كفر سيليكون + شاحن أصلي مجاناً',
  inStock: true,
  isNew: true,
  isSale: false,
  description: '',
  descriptionAr: '',
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  products,
  settings,
  onClose,
}) => {
  const [tab, setTab] = useState<'products' | 'shop' | 'security'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [storageInput, setStorageInput] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#232528');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Shop settings draft
  const [shopDraft, setShopDraft] = useState<ShopSettings>(settings);
  const [heroUrlInput, setHeroUrlInput] = useState('');

  // Change code state
  const [currentPin, setCurrentPin] = useState('');
  const [nextPin, setNextPin] = useState('');
  const [confirmNextPin, setConfirmNextPin] = useState('');
  const [pinStatus, setPinStatus] = useState('');

  React.useEffect(() => {
    setShopDraft(settings);
  }, [settings]);

  if (!isOpen) return null;

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const openEditor = (prod?: Product) => {
    const target = prod
      ? { ...prod, colors: [...prod.colors], images: [...prod.images], storageOptions: [...prod.storageOptions] }
      : { ...EMPTY_PRODUCT, colors: [...EMPTY_PRODUCT.colors], images: [...EMPTY_PRODUCT.images], storageOptions: [...EMPTY_PRODUCT.storageOptions] };
    setEditingProduct(target);
    setStorageInput(target.storageOptions.join(', '));
    setNewImageUrl('');
    setNewColorName('');
  };

  const handleUploadImage = async (
    file: File,
    folder: 'products' | 'hero',
    onUrl: (url: string) => void
  ) => {
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = ref(storage, `${folder}/${Date.now()}_${safeName}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      onUrl(url);
      notify('Image uploaded');
    } catch (err) {
      console.error('Upload error:', err);
      notify('Storage upload failed — check Firebase Storage rules or paste an image URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const cleanName = editingProduct.name.trim().slice(0, 120);
    if (!cleanName) {
      notify('Product name is required');
      return;
    }

    setSaving(true);
    const id = editingProduct.id && /^[a-zA-Z0-9_-]+$/.test(editingProduct.id)
      ? editingProduct.id
      : slugifyId(cleanName);

    const parsedStorages = storageInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);

    const payload = {
      name: cleanName,
      nameAr: (editingProduct.nameAr || '').trim().slice(0, 120),
      brand: editingProduct.brand,
      price: Math.max(0, Number(editingProduct.price) || 0),
      oldPrice:
        editingProduct.oldPrice !== null && editingProduct.oldPrice !== undefined && Number(editingProduct.oldPrice) > 0
          ? Number(editingProduct.oldPrice)
          : null,
      ram: (editingProduct.ram || '').trim().slice(0, 40),
      storageOptions: parsedStorages,
      colors: editingProduct.colors.slice(0, 12),
      images: (editingProduct.images.length > 0 ? editingProduct.images : ['studio://samsung-a55']).slice(0, 10),
      freeGifts: (editingProduct.freeGifts || '').trim().slice(0, 300),
      freeGiftsAr: (editingProduct.freeGiftsAr || '').trim().slice(0, 300),
      inStock: Boolean(editingProduct.inStock),
      isNew: Boolean(editingProduct.isNew),
      isSale: Boolean(editingProduct.isSale),
      description: (editingProduct.description || '').trim().slice(0, 1000),
      descriptionAr: (editingProduct.descriptionAr || '').trim().slice(0, 1000),
      updatedAt: Date.now(),
    };

    try {
      await setDoc(doc(db, 'products', id), payload);
      setEditingProduct(null);
      notify('Product saved');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'products', id));
      setConfirmDeleteId(null);
      notify('Product deleted');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSyncStarterCatalog = async () => {
    setSaving(true);
    try {
      for (const item of DEFAULT_PRODUCTS) {
        const { id, ...rest } = item;
        await setDoc(doc(db, 'products', id), { ...rest, updatedAt: Date.now() });
      }
      notify('Starter catalog synced to Firestore');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShopSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: ShopSettings = {
      heroTitle: shopDraft.heroTitle.trim().slice(0, 140),
      heroTitleAr: shopDraft.heroTitleAr.trim().slice(0, 140),
      heroSubtitle: shopDraft.heroSubtitle.trim().slice(0, 240),
      heroSubtitleAr: shopDraft.heroSubtitleAr.trim().slice(0, 240),
      heroImages: (shopDraft.heroImages.length > 0 ? shopDraft.heroImages : ['studio://hero-s24-ultra']).slice(0, 8),
      perkBanner: shopDraft.perkBanner.trim().slice(0, 280),
      perkBannerAr: shopDraft.perkBannerAr.trim().slice(0, 280),
      deliveryAvailable: Boolean(shopDraft.deliveryAvailable),
      deliveryArea: shopDraft.deliveryArea.trim().slice(0, 160),
      deliveryAreaAr: shopDraft.deliveryAreaAr.trim().slice(0, 160),
      deliveryFee: Math.max(0, Number(shopDraft.deliveryFee) || 0),
      deliveryNote: shopDraft.deliveryNote.trim().slice(0, 280),
      deliveryNoteAr: shopDraft.deliveryNoteAr.trim().slice(0, 280),
      whatsappNumber: shopDraft.whatsappNumber.trim().slice(0, 30),
      whatsappDisplay: shopDraft.whatsappDisplay.trim().slice(0, 40),
      phoneDisplay: shopDraft.phoneDisplay.trim().slice(0, 40),
      address: shopDraft.address.trim().slice(0, 200),
      addressAr: shopDraft.addressAr.trim().slice(0, 200),
      mapsEmbedUrl: shopDraft.mapsEmbedUrl.trim().slice(0, 600),
      mapsLinkUrl: shopDraft.mapsLinkUrl.trim().slice(0, 400),
      openingHours: shopDraft.openingHours.trim().slice(0, 160),
      openingHoursAr: shopDraft.openingHoursAr.trim().slice(0, 160),
      instagramUrl: shopDraft.instagramUrl.trim().slice(0, 240),
      tiktokUrl: shopDraft.tiktokUrl.trim().slice(0, 240),
      updatedAt: Date.now(),
    };

    try {
      await setDoc(doc(db, 'settings', 'shop'), payload);
      notify('Shop settings saved');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/shop');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinStatus('');
    if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(nextPin)) {
      setPinStatus('All codes must be 4 digits.');
      return;
    }
    if (nextPin !== confirmNextPin) {
      setPinStatus('New codes do not match.');
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setPinStatus('Not signed in.');
      return;
    }
    setSaving(true);
    try {
      const cred = EmailAuthProvider.credential(ADMIN_EMAIL, currentPin + PASSCODE_SUFFIX);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, nextPin + PASSCODE_SUFFIX);
      setCurrentPin('');
      setNextPin('');
      setConfirmNextPin('');
      setPinStatus('Code updated successfully.');
    } catch {
      setPinStatus('Current code is incorrect.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6"
      dir="ltr"
      role="dialog"
      aria-modal="true"
      aria-label="Store Manager"
    >
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-black/[0.08] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-black/[0.06] flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Phone Target" className="w-9 h-9 rounded-full border border-black/10" />
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#111111]">
                Phone Target Manager
              </h2>
              {statusMessage && (
                <p className="text-xs font-medium text-[#E0322B]">{statusMessage}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="h-9 px-3 rounded-xl bg-[#EEF0F3] hover:bg-[#E2E5EA] text-xs font-semibold text-[#111111] inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#EEF0F3] hover:bg-[#E2E5EA] flex items-center justify-center text-[#111111]"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 sm:px-7 py-3 bg-[#EEF0F3]/60 border-b border-black/[0.06] flex items-center gap-2 overflow-x-auto">
          {(['products', 'shop', 'security'] as const).map((tKey) => (
            <button
              key={tKey}
              type="button"
              onClick={() => {
                setTab(tKey);
                setEditingProduct(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                tab === tKey
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#111111]/75 hover:text-[#111111]'
              }`}
            >
              {tKey === 'products'
                ? `Products (${products.length})`
                : tKey === 'shop'
                ? 'Hero, Delivery & Shop Info'
                : 'Passcode & Security'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {/* PRODUCTS TAB */}
          {tab === 'products' && !editingProduct && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openEditor()}
                  className="h-10 px-4 rounded-xl bg-[#E0322B] hover:bg-[#c82923] text-white text-xs font-semibold inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSyncStarterCatalog}
                  className="h-10 px-4 rounded-xl bg-[#EEF0F3] hover:bg-[#E2E5EA] text-[#111111] text-xs font-semibold inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Starter Catalog to Cloud</span>
                </button>
              </div>

              <div className="divide-y divide-black/[0.06] border border-black/[0.06] rounded-2xl overflow-hidden">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white hover:bg-[#EEF0F3]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#EEF0F3] p-1 shrink-0 overflow-hidden">
                        <DeviceArtwork
                          src={prod.images[0]}
                          alt={prod.name}
                          brand={prod.brand}
                          colorHex={prod.colors[0]?.hex}
                          variant="thumb"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-sm font-semibold text-[#111111] truncate">
                            {prod.name}
                          </h3>
                          {prod.isNew && (
                            <span className="text-[10px] font-semibold text-[#E0322B]">NEW</span>
                          )}
                          {prod.isSale && (
                            <span className="text-[10px] font-semibold text-[#111111]/60">SALE</span>
                          )}
                        </div>
                        <p className="text-xs text-[#111111]/60 tabular-nums">
                          {prod.brand} · ${prod.price} · {prod.inStock ? 'In Stock' : 'Sold Out'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditor(prod)}
                        className="h-9 px-3 rounded-lg bg-[#EEF0F3] hover:bg-[#111111] hover:text-white text-xs font-semibold text-[#111111] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {confirmDeleteId === prod.id ? (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="h-9 px-3 rounded-lg bg-[#E0322B] text-white text-xs font-semibold"
                        >
                          Confirm Delete
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(prod.id)}
                          className="w-9 h-9 rounded-lg bg-[#EEF0F3] hover:bg-[#E0322B] hover:text-white flex items-center justify-center text-[#111111]/70 transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCT EDITOR */}
          {tab === 'products' && editingProduct && (
            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-[#111111]">
                  {editingProduct.id ? 'Edit Product' : 'New Product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-xs font-semibold text-[#111111]/60 hover:text-[#111111]"
                >
                  Back to list
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Product Name (EN) *
                  </label>
                  <input
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Product Name (AR)
                  </label>
                  <input
                    dir="rtl"
                    value={editingProduct.nameAr || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameAr: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">Brand</label>
                  <select
                    value={editingProduct.brand}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, brand: e.target.value as Brand })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  >
                    <option value="Samsung">Samsung</option>
                    <option value="iPhone">iPhone</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Other">Other</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">RAM</label>
                  <input
                    value={editingProduct.ram || ''}
                    placeholder="e.g. 8 GB"
                    onChange={(e) => setEditingProduct({ ...editingProduct, ram: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Price (USD) *
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Old Price (USD, optional for Sale)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editingProduct.oldPrice ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        oldPrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                  Storage Options (comma separated)
                </label>
                <input
                  value={storageInput}
                  onChange={(e) => setStorageInput(e.target.value)}
                  placeholder="128 GB, 256 GB, 512 GB"
                  className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                />
              </div>

              {/* Colors */}
              <div className="p-4 rounded-2xl bg-[#EEF0F3] space-y-3">
                <label className="block text-xs font-semibold text-[#111111]/70">Colors</label>
                <div className="flex flex-wrap gap-2">
                  {editingProduct.colors.map((c: ColorOption, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white text-xs font-medium"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct({
                            ...editingProduct,
                            colors: editingProduct.colors.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-[#111111]/45 hover:text-[#E0322B]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 bg-white p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Color name (e.g. Titanium Black)"
                    className="flex-1 min-w-[160px] h-10 px-3 rounded-xl bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newColorName.trim()) return;
                      setEditingProduct({
                        ...editingProduct,
                        colors: [
                          ...editingProduct.colors,
                          { name: newColorName.trim(), hex: newColorHex },
                        ],
                      });
                      setNewColorName('');
                    }}
                    className="h-10 px-4 rounded-xl bg-[#111111] text-white text-xs font-semibold"
                  >
                    Add Color
                  </button>
                </div>
              </div>

              {/* Images (Upload to Firebase Storage / URL / Preset) */}
              <div className="p-4 rounded-2xl bg-[#EEF0F3] space-y-3">
                <label className="block text-xs font-semibold text-[#111111]/70">
                  Product Images ({editingProduct.images.length})
                </label>

                <div className="flex flex-wrap gap-3">
                  {editingProduct.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl bg-white p-1.5 border border-black/10"
                    >
                      <DeviceArtwork
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        brand={editingProduct.brand}
                        colorHex={editingProduct.colors[0]?.hex}
                        variant="thumb"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct({
                            ...editingProduct,
                            images: editingProduct.images.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#E0322B] text-white flex items-center justify-center shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="h-10 px-4 rounded-xl bg-[#111111] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        handleUploadImage(file, 'products', (url) =>
                          setEditingProduct((prev) =>
                            prev ? { ...prev, images: [...prev.images, url] } : prev
                          )
                        );
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <select
                    value=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      setEditingProduct({
                        ...editingProduct,
                        images: [...editingProduct.images, e.target.value],
                      });
                    }}
                    className="h-10 px-3 rounded-xl bg-white text-xs font-medium"
                  >
                    <option value="">+ Add Studio Render...</option>
                    {STUDIO_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="flex-1 h-10 px-3 rounded-xl bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newImageUrl.trim()) return;
                      setEditingProduct({
                        ...editingProduct,
                        images: [...editingProduct.images, newImageUrl.trim()],
                      });
                      setNewImageUrl('');
                    }}
                    className="h-10 px-4 rounded-xl bg-white border border-black/10 text-xs font-semibold"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Free Gifts & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Free Gifts Text (EN)
                  </label>
                  <input
                    value={editingProduct.freeGifts || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, freeGifts: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Free Gifts Text (AR)
                  </label>
                  <input
                    dir="rtl"
                    value={editingProduct.freeGiftsAr || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, freeGiftsAr: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Description (EN)
                  </label>
                  <textarea
                    rows={2}
                    value={editingProduct.description || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Description (AR)
                  </label>
                  <textarea
                    dir="rtl"
                    rows={2}
                    value={editingProduct.descriptionAr || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, descriptionAr: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-5 pt-1">
                <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, inStock: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#111111]"
                  />
                  <span>In Stock</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isNew}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isNew: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#E0322B]"
                  />
                  <span>New Arrival (shows in strip & badge)</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isSale}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isSale: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#E0322B]"
                  />
                  <span>Sale Badge</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="h-11 px-5 rounded-xl bg-[#EEF0F3] text-sm font-semibold text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-6 rounded-xl bg-[#E0322B] hover:bg-[#c82923] text-white text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          )}

          {/* SHOP & HERO & DELIVERY TAB */}
          {tab === 'shop' && (
            <form onSubmit={handleSaveShopSettings} className="space-y-6">
              {/* Hero Images */}
              <div className="p-4 rounded-2xl bg-[#EEF0F3] space-y-3">
                <h3 className="font-display text-sm font-bold text-[#111111]">Hero Showcase Images</h3>
                <div className="flex flex-wrap gap-3">
                  {shopDraft.heroImages.map((img, i) => (
                    <div key={i} className="relative w-24 h-20 rounded-xl bg-white p-1.5 border border-black/10">
                      <DeviceArtwork src={img} alt={`Hero ${i + 1}`} variant="thumb" />
                      <button
                        type="button"
                        onClick={() =>
                          setShopDraft({
                            ...shopDraft,
                            heroImages: shopDraft.heroImages.filter((_, idx) => idx !== i),
                          })
                        }
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#E0322B] text-white flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="h-10 px-4 rounded-xl bg-[#111111] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload Hero Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        handleUploadImage(file, 'hero', (url) =>
                          setShopDraft((prev) => ({
                            ...prev,
                            heroImages: [...prev.heroImages, url],
                          }))
                        );
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={heroUrlInput}
                    onChange={(e) => setHeroUrlInput(e.target.value)}
                    placeholder="Or paste hero image URL"
                    className="flex-1 min-w-[180px] h-10 px-3 rounded-xl bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!heroUrlInput.trim()) return;
                      setShopDraft({
                        ...shopDraft,
                        heroImages: [...shopDraft.heroImages, heroUrlInput.trim()],
                      });
                      setHeroUrlInput('');
                    }}
                    className="h-10 px-4 rounded-xl bg-white border border-black/10 text-xs font-semibold"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Hero Copy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Hero Headline (EN)
                  </label>
                  <input
                    value={shopDraft.heroTitle}
                    onChange={(e) => setShopDraft({ ...shopDraft, heroTitle: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Hero Headline (AR)
                  </label>
                  <input
                    dir="rtl"
                    value={shopDraft.heroTitleAr}
                    onChange={(e) => setShopDraft({ ...shopDraft, heroTitleAr: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Hero Subtitle (EN)
                  </label>
                  <input
                    value={shopDraft.heroSubtitle}
                    onChange={(e) => setShopDraft({ ...shopDraft, heroSubtitle: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Hero Subtitle (AR)
                  </label>
                  <input
                    dir="rtl"
                    value={shopDraft.heroSubtitleAr}
                    onChange={(e) => setShopDraft({ ...shopDraft, heroSubtitleAr: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Samsung Perk Banner (EN)
                  </label>
                  <input
                    value={shopDraft.perkBanner}
                    onChange={(e) => setShopDraft({ ...shopDraft, perkBanner: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Samsung Perk Banner (AR)
                  </label>
                  <input
                    dir="rtl"
                    value={shopDraft.perkBannerAr}
                    onChange={(e) => setShopDraft({ ...shopDraft, perkBannerAr: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="p-4 rounded-2xl bg-[#EEF0F3] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-[#111111]">Delivery Settings</h3>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shopDraft.deliveryAvailable}
                      onChange={(e) =>
                        setShopDraft({ ...shopDraft, deliveryAvailable: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#E0322B]"
                    />
                    <span>Delivery Available</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                      Delivery Area (EN)
                    </label>
                    <input
                      value={shopDraft.deliveryArea}
                      onChange={(e) =>
                        setShopDraft({ ...shopDraft, deliveryArea: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-xl bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                      Delivery Area (AR)
                    </label>
                    <input
                      dir="rtl"
                      value={shopDraft.deliveryAreaAr}
                      onChange={(e) =>
                        setShopDraft({ ...shopDraft, deliveryAreaAr: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-xl bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                      Delivery Fee (USD)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={shopDraft.deliveryFee}
                      onChange={(e) =>
                        setShopDraft({ ...shopDraft, deliveryFee: Number(e.target.value) })
                      }
                      className="w-full h-10 px-3 rounded-xl bg-white text-sm tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Maps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    WhatsApp Digits (e.g. 96176135133)
                  </label>
                  <input
                    value={shopDraft.whatsappNumber}
                    onChange={(e) => setShopDraft({ ...shopDraft, whatsappNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    WhatsApp Display
                  </label>
                  <input
                    value={shopDraft.whatsappDisplay}
                    onChange={(e) =>
                      setShopDraft({ ...shopDraft, whatsappDisplay: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Landline Phone
                  </label>
                  <input
                    value={shopDraft.phoneDisplay}
                    onChange={(e) => setShopDraft({ ...shopDraft, phoneDisplay: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Opening Hours (EN)
                  </label>
                  <input
                    value={shopDraft.openingHours}
                    onChange={(e) => setShopDraft({ ...shopDraft, openingHours: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Opening Hours (AR)
                  </label>
                  <input
                    dir="rtl"
                    value={shopDraft.openingHoursAr}
                    onChange={(e) => setShopDraft({ ...shopDraft, openingHoursAr: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Address (EN)
                  </label>
                  <input
                    value={shopDraft.address}
                    onChange={(e) => setShopDraft({ ...shopDraft, address: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Google Maps Link URL
                  </label>
                  <input
                    value={shopDraft.mapsLinkUrl}
                    onChange={(e) => setShopDraft({ ...shopDraft, mapsLinkUrl: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                    Google Maps Embed URL
                  </label>
                  <input
                    value={shopDraft.mapsEmbedUrl}
                    onChange={(e) => setShopDraft({ ...shopDraft, mapsEmbedUrl: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#EEF0F3] text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-6 rounded-xl bg-[#E0322B] hover:bg-[#c82923] text-white text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Shop Info'}</span>
                </button>
              </div>
            </form>
          )}

          {/* SECURITY TAB */}
          {tab === 'security' && (
            <form onSubmit={handleChangeCode} className="max-w-sm space-y-4">
              <div className="flex items-center gap-2.5 mb-2">
                <KeyRound className="w-5 h-5 text-[#E0322B]" />
                <h3 className="font-display text-base font-bold text-[#111111]">Change 4-digit code</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                  Current 4-digit code
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#EEF0F3] text-sm tracking-[0.4em]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                  New 4-digit code
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={nextPin}
                  onChange={(e) => setNextPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#EEF0F3] text-sm tracking-[0.4em]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111]/70 mb-1">
                  Confirm new 4-digit code
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmNextPin}
                  onChange={(e) => setConfirmNextPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#EEF0F3] text-sm tracking-[0.4em]"
                />
              </div>

              {pinStatus && (
                <p className="text-xs font-semibold text-[#E0322B]">{pinStatus}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="h-11 px-6 rounded-xl bg-[#111111] hover:bg-[#E0322B] text-white text-sm font-semibold transition-colors"
              >
                {saving ? 'Updating...' : 'Update code'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
