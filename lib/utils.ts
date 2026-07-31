import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  Tag,
  Shirt,
  Smartphone,
  Home,
  Laptop,
  BookOpen,
  Gamepad2,
  Dumbbell,
  Heart,
  Car,
  ShoppingBasket,
  Baby,
  Sofa,
  Gem,
  Watch,
  ShoppingBag,
  Tv,
  Activity,
  Sparkles,
  PawPrint,
  LucideIcon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCategoryIconComponent = (categoryName: string): LucideIcon => {
  const name = categoryName.toLowerCase();

  // Baby Products
  if (name.includes("baby")) {
    return Baby;
  }
  // Cell Phones / Mobiles
  if (
    name.includes("mobile") ||
    name.includes("phone") ||
    name.includes("smartphone") ||
    name.includes("cell")
  ) {
    return Smartphone;
  }
  // Furniture
  if (name.includes("furniture") || name.includes("sofa")) {
    return Sofa;
  }
  // Jewellery
  if (name.includes("jewel")) {
    return Gem;
  }
  // Watches
  if (name.includes("watch")) {
    return Watch;
  }
  // Bags & Handbags
  if (name.includes("bag") || name.includes("handbag")) {
    return ShoppingBag;
  }
  // Clothing / Apparel
  if (
    name.includes("clothing") ||
    name.includes("apparel") ||
    name.includes("fashion") ||
    name.includes("shoe") ||
    name.includes("shirt")
  ) {
    return Shirt;
  }
  // Home Decor, Home Appliances
  if (
    name.includes("home") ||
    name.includes("appliance") ||
    name.includes("kitchen") ||
    name.includes("decor")
  ) {
    return Home;
  }
  // Computers & Accessories
  if (
    name.includes("computer") ||
    name.includes("laptop") ||
    name.includes("monitor")
  ) {
    return Laptop;
  }
  // Electronics
  if (
    name.includes("electronic") ||
    name.includes("tv") ||
    name.includes("television")
  ) {
    return Tv;
  }
  // Books
  if (
    name.includes("book") ||
    name.includes("read") ||
    name.includes("novel")
  ) {
    return BookOpen;
  }
  // Video Games, Toys & Games
  if (
    name.includes("game") ||
    name.includes("toy") ||
    name.includes("kid")
  ) {
    return Gamepad2;
  }
  // Sports
  if (
    name.includes("sport") ||
    name.includes("outdoor") ||
    name.includes("fitness") ||
    name.includes("gym") ||
    name.includes("exercise")
  ) {
    return Dumbbell;
  }
  // Health & Personal Care
  if (
    name.includes("health") ||
    name.includes("personal care") ||
    name.includes("care")
  ) {
    return Activity;
  }
  // Beauty
  if (name.includes("beauty") || name.includes("cosmetic")) {
    return Sparkles;
  }
  // Pet Supplies
  if (
    name.includes("pet") ||
    name.includes("dog") ||
    name.includes("cat") ||
    name.includes("animal")
  ) {
    return PawPrint;
  }
  // Food & Groceries
  if (
    name.includes("grocery") ||
    name.includes("food") ||
    name.includes("pantry") ||
    name.includes("eat") ||
    name.includes("nutrition")
  ) {
    return ShoppingBasket;
  }

  // Fallback to Tag icon which represents product/category tag
  return Tag;
};

export function decodeHTMLEntities(str?: string | null): string {
  if (!str) return "";
  const s = String(str);
  if (!s.includes("&")) return s;

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = s;
      return textarea.value;
    } catch {
      // fallback to regex below
    }
  }

  return s
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => {
      try { return String.fromCodePoint(parseInt(hex, 16)); } catch { return _; }
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      try { return String.fromCodePoint(Number(dec)); } catch { return _; }
    })
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&bull;/gi, '•')
    .replace(/&copy;/gi, '©')
    .replace(/&reg;/gi, '®')
    .replace(/&trade;/gi, '™')
    .replace(/&hellip;/gi, '…');
}







