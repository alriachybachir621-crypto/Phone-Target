import { CartItem, Language, ShopSettings } from '../types';

export function buildWhatsAppHref(phoneDigits: string, message: string): string {
  const clean = phoneDigits.replace(/[^0-9]/g, '') || '96176135133';
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function buildProductOrderMessage(params: {
  lang: Language;
  name: string;
  storage?: string;
  color?: string;
  price: number;
  freeGifts?: string;
}): string {
  const { lang, name, storage, color, price, freeGifts } = params;
  if (lang === 'ar') {
    const lines = [
      'مرحباً Phone Target، أرغب بطلب هذا المنتج:',
      `• الجهاز: ${name}`,
      storage ? `• السعة: ${storage}` : '',
      color ? `• اللون: ${color}` : '',
      `• السعر: $${price}`,
      freeGifts ? `• الهدايا المشمولة: ${freeGifts}` : '',
    ].filter(Boolean);
    return lines.join('\n');
  }

  const lines = [
    'Hello Phone Target, I would like to order:',
    `• Product: ${name}`,
    storage ? `• Storage: ${storage}` : '',
    color ? `• Color: ${color}` : '',
    `• Price: $${price}`,
    freeGifts ? `• Included: ${freeGifts}` : '',
  ].filter(Boolean);
  return lines.join('\n');
}

export function buildCartOrderMessage(
  items: CartItem[],
  settings: ShopSettings,
  lang: Language,
  includeDelivery: boolean
): string {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = includeDelivery && settings.deliveryAvailable ? settings.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  if (lang === 'ar') {
    const itemLines = items.map((item, idx) => {
      const displayName = item.nameAr || item.name;
      const spec = [item.storage, item.colorName].filter(Boolean).join(' · ');
      return `${idx + 1}. ${displayName}${spec ? ` (${spec})` : ''} × ${item.quantity} — $${item.price * item.quantity}`;
    });
    return [
      'مرحباً Phone Target، هذا طلبي من الموقع:',
      '',
      ...itemLines,
      '',
      `المجموع الفرعي: $${subtotal}`,
      includeDelivery
        ? `التوصيل (${settings.deliveryAreaAr || settings.deliveryArea}): ${deliveryFee === 0 ? 'مجاني' : `$${deliveryFee}`}`
        : 'الاستلام من المحل (زحلة - حوش الأمراء)',
      `الإجمالي: $${total}`,
    ].join('\n');
  }

  const itemLines = items.map((item, idx) => {
    const spec = [item.storage, item.colorName].filter(Boolean).join(' · ');
    return `${idx + 1}. ${item.name}${spec ? ` (${spec})` : ''} × ${item.quantity} — $${item.price * item.quantity}`;
  });

  return [
    'Hello Phone Target, here is my order:',
    '',
    ...itemLines,
    '',
    `Subtotal: $${subtotal}`,
    includeDelivery
      ? `Delivery (${settings.deliveryArea}): ${deliveryFee === 0 ? 'Free' : `$${deliveryFee}`}`
      : 'Store Pickup (Zahle - Haouch El Oumara)',
    `Total: $${total}`,
  ].join('\n');
}

export function buildDeliveryFormMessage(params: {
  lang: Language;
  customerName: string;
  area: string;
  phone: string;
  notes: string;
}): string {
  const { lang, customerName, area, phone, notes } = params;
  if (lang === 'ar') {
    return [
      'مرحباً Phone Target، أرغب بطلب توصيل:',
      `• الاسم: ${customerName || '-'}`,
      `• المنطقة: ${area || '-'}`,
      `• الهاتف: ${phone || '-'}`,
      notes ? `• ملاحظات / الطلب: ${notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    'Hello Phone Target, I would like to request a delivery:',
    `• Name: ${customerName || '-'}`,
    `• Area: ${area || '-'}`,
    `• Phone: ${phone || '-'}`,
    notes ? `• Notes / Order: ${notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
