import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwindのクラスを賢く合体させる関数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}