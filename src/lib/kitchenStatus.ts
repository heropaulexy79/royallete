/**
 * Kitchen Operating Hours: 9:00 AM – 9:00 PM West Africa Time (Africa/Lagos, UTC+1)
 */
export interface KitchenStatus {
  isOpen: boolean;
  statusText: string;
  subText: string;
  openHourStr: string;
  closeHourStr: string;
}

export function getKitchenStatus(): KitchenStatus {
  const openHourStr = '9:00 AM';
  const closeHourStr = '9:00 PM';

  try {
    const now = new Date();
    // Resolve Africa/Lagos time (WAT, UTC+1)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const hourPart = parts.find((p) => p.type === 'hour')?.value;
    const hour = hourPart ? parseInt(hourPart, 10) : now.getHours();

    // Open from 09:00:00 up to 20:59:59 (closes at 21:00)
    const isOpen = hour >= 9 && hour < 21;

    if (isOpen) {
      return {
        isOpen: true,
        statusText: 'Kitchen Open',
        subText: 'Sizzling & Ready for Pickup (Avg: 15–20 mins)',
        openHourStr,
        closeHourStr,
      };
    } else {
      return {
        isOpen: false,
        statusText: 'Kitchen Closed',
        subText: `Opens at ${openHourStr} (Pre-orders accepted for morning pickup)`,
        openHourStr,
        closeHourStr,
      };
    }
  } catch {
    // Fallback if Intl timeZone fails
    const localHour = new Date().getHours();
    const isOpen = localHour >= 9 && localHour < 21;
    return {
      isOpen,
      statusText: isOpen ? 'Kitchen Open' : 'Kitchen Closed',
      subText: isOpen
        ? 'Sizzling & Ready for Pickup (Avg: 15–20 mins)'
        : `Opens at ${openHourStr} (Pre-orders accepted for morning pickup)`,
      openHourStr,
      closeHourStr,
    };
  }
}
