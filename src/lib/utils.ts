import axios from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function parseApiError(error: unknown, fallback = "Something went wrong"): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }
  const data = error.response?.data as { detail?: string | { msg: string }[]; message?: string } | string;
  if (typeof data === "string") return data;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    return data.detail.map((e) => e.msg).join(", ");
  }
  if (typeof data?.message === "string") return data.message;
  return fallback;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
