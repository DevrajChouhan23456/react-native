import dayjs from "dayjs";
import { icons, SUBSCRIPTION_ICON_MAP, CATEGORY_ICON_MAP, type IconKey } from "@/constants/icons";

export function formatCurrency(value: number | string, currency = "USD"): string {
  const numericValue = typeof value === "number" ? value : Number(value);
  const amount = Number.isFinite(numericValue) ? numericValue : 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("MM/DD/YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * Get the icon for a subscription based on its name and category
 * @param subscriptionName - The name of the subscription
 * @param category - The category of the subscription (used as fallback)
 * @returns The icon import for the subscription
 */
export const getSubscriptionIcon = (subscriptionName: string, category?: string) => {
  const lowerName = subscriptionName.trim().toLowerCase();
  
  // Direct match first
  if (SUBSCRIPTION_ICON_MAP[lowerName]) {
    const iconKey = SUBSCRIPTION_ICON_MAP[lowerName];
    return icons[iconKey];
  }
  
  // Partial match for multi-word names
  for (const [key, iconKey] of Object.entries(SUBSCRIPTION_ICON_MAP)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return icons[iconKey];
    }
  }
  
  // Use category-based fallback if provided
  if (category && CATEGORY_ICON_MAP[category]) {
    const iconKey = CATEGORY_ICON_MAP[category];
    return icons[iconKey];
  }
  
  // Final fallback to wallet icon
  return icons.wallet;
};

