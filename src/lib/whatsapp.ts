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
        `• *${item.quantity}x ${item.name}* — ₦${(item.price * item.quantity).toLocaleString()}`
    )
    .join('\n');

  const refString = orderId ? `\n🔖 *Order Ref:* #${orderId.slice(-6).toUpperCase()}` : '';
  const notesString = orderNotes ? `\n📝 *Order Notes:* ${orderNotes}` : '';

  return (
    `👋 *Hello Royallete! I want to place an order:*\n\n` +
    `📋 *Order Items:*\n${itemList}\n\n` +
    `💰 *Total Amount:* ₦${totalPrice.toLocaleString()}\n` +
    `👤 *Customer Name:* ${customerName}\n` +
    `📞 *Phone Number:* ${phone}` +
    `${notesString}` +
    `${refString}\n\n` +
    `Please confirm my order and let me know when it will be ready. Thank you!`
  );
}

export function generateWhatsAppUrl(details: WhatsAppOrderDetails, phone: string = RESTAURANT_WHATSAPP_NUMBER): string {
  // Clean phone number: remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  const message = formatWhatsAppMessage(details);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
