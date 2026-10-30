import { OrderItem } from '@/types/schema';

export const RESTAURANT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2347030574580';

export interface WhatsAppOrderDetails {
  orderId?: string;
  customerName: string;
  phone: string;
  orderNotes?: string;
  items: OrderItem[];
  totalPrice: number;
}

/**
 * Generates a simple numeric checksum from the order items.
 * Staff can re-compute this on the admin panel from the saved order
 * and compare — any mismatch means the customer edited the message.
 *
 * Algorithm: sum of (price × quantity) for every item, mod 9999.
 * Short, easy to read, hard to guess.
 */
export function computeOrderChecksum(items: OrderItem[], totalPrice: number): string {
  const raw = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // XOR with totalPrice to make it depend on the final total too
  const checksum = (raw ^ Math.floor(totalPrice)) % 9999;
  return checksum.toString().padStart(4, '0');
}

export function formatWhatsAppMessage({
  orderId,
  customerName,
  phone,
  orderNotes,
  items,
  totalPrice,
}: WhatsAppOrderDetails): string {
  const itemList = items
    .map(
      (item) =>
        `  • *${item.quantity}x ${item.name}* — ₦${(item.price * item.quantity).toLocaleString()}`
    )
    .join('\n');

  const shortRef = orderId ? orderId.slice(-6).toUpperCase() : 'N/A';
  const checksum = computeOrderChecksum(items, totalPrice);
  const notesString = orderNotes ? `\n📝 *Notes:* ${orderNotes}` : '';

  return (
    `🍽️ *DÉSKILZ KITCHEN — NEW ORDER*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📋 *Order Items:*\n${itemList}\n\n` +
    `💰 *Total:* ₦${totalPrice.toLocaleString()}\n` +
    `👤 *Name:* ${customerName}\n` +
    `📞 *Phone:* ${phone}` +
    `${notesString}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔖 *Order Ref:* #${shortRef}\n` +
    `🔐 *Verification Code:* ${checksum}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `⚠️ *DO NOT EDIT THIS MESSAGE.*\n` +
    `Prices & items are locked by our system.\n` +
    `Any changes will cause your order to be *rejected*.\n\n` +
    `Please tap *Send* to confirm your pickup order. Thank you! 🙏`
  );
}

export function generateWhatsAppUrl(
  details: WhatsAppOrderDetails,
  phone: string = RESTAURANT_WHATSAPP_NUMBER
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = formatWhatsAppMessage(details);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

