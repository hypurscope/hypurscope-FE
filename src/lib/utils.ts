import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const toNumber = (v: unknown): number =>
    typeof v === "number"
        ? v
        : typeof v === "string"
            ? Number(v.replace?.(/[^0-9.\-eE]/g, "") ?? v)
            : NaN;

// Format a number into a compact string without commas, e.g. 1250000 -> "1.25M"
export function formatNumberCompact(value: number | null | undefined, decimals = 2): string {
  const n = Number(value)
  if (!isFinite(n)) return "-"
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  let out: string
  if (abs >= 1e12) out = (abs / 1e12).toFixed(decimals) + "T"
  else if (abs >= 1e9) out = (abs / 1e9).toFixed(decimals) + "B"
  else if (abs >= 1e6) out = (abs / 1e6).toFixed(decimals) + "M"
  else if (abs >= 1e3) out = (abs / 1e3).toFixed(decimals) + "K"
  else out = abs.toFixed(decimals)
  // trim trailing zeros and potential trailing dot
  out = out.replace(/\.0+$|(?<=\.\d*[1-9])0+$/g, "").replace(/\.$/, "")
  return sign + out
}

// Compact USD formatter without commas, e.g. 1250000 -> "$1.25M"
export function formatUSDCompact(value: number | null | undefined, decimals = 2): string {
  const n = Number(value)
  if (!isFinite(n)) return "-"
  const sign = n < 0 ? "-" : ""
  const compact = formatNumberCompact(Math.abs(n), decimals)
  return `${sign}$${compact}`
}

export const parseUpstreamDate = (s: string): number => {
    if (!s) return NaN;
    const parts = s.split(/[^0-9]/).filter(Boolean); // [y, m, d, hh?, mm?]
    if (parts.length < 3) return NaN;
    let y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    const hh = Number(parts[3] ?? 0);
    const mm = Number(parts[4] ?? 0);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return NaN;
    if (y < 100) y += 2000;
    return Date.UTC(y, Math.max(0, m - 1), d, hh, mm, 0);
};