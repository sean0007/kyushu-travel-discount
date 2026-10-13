import { CHANNELS, PREFECTURES, PRODUCTS, type Channel, type Prefecture, type Product } from "./discount";

export const PUBLIC_URL = "https://kyushu-travel-discount.vercel.app";

/** Share links: /r?p=kumamoto&k=lodging&n=2&y=60000&t=2[&c=ota][&d=YYYY-MM-DD] */
type Params = URLSearchParams | Record<string, string | string[] | undefined>;
function one(p: Params, key: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(key) ?? undefined;
  const v = p[key];
  return Array.isArray(v) ? v[0] : v;
}
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export type Shared = { prefecture: Prefecture; product: Product; nights: number; totalPriceJPY: number; travelers: number; channel: Channel; checkIn: string | null };

export const EXAMPLE_SHARED: Shared = { prefecture: "kumamoto", product: "lodging", nights: 2, totalPriceJPY: 60000, travelers: 2, channel: "ota", checkIn: null };

export function parseShared(p: Params): Shared | null {
  const pr = one(p, "p") ?? one(p, "prefecture");
  if (!(PREFECTURES as readonly string[]).includes(pr ?? "")) return null;
  const k = one(p, "k") ?? one(p, "product") ?? "lodging";
  const product = (PRODUCTS as readonly string[]).includes(k) ? (k as Product) : "lodging";
  const n = Number(one(p, "n") ?? one(p, "nights") ?? "1");
  if (!Number.isInteger(n) || n < 1 || n > 60) return null;
  const y = Number(one(p, "y") ?? one(p, "totalPriceJPY") ?? "");
  if (!Number.isFinite(y) || y <= 0 || y > 100_000_000) return null;
  const tRaw = Number(one(p, "t") ?? one(p, "travelers") ?? "1");
  const travelers = Number.isInteger(tRaw) && tRaw >= 1 && tRaw <= 100 ? tRaw : 1;
  const c = one(p, "c") ?? one(p, "channel") ?? "ota";
  const channel = (CHANNELS as readonly string[]).includes(c) ? (c as Channel) : "ota";
  const d = one(p, "d") ?? one(p, "checkIn");
  const checkIn = d && DATE.test(d) && d >= "2026-09-01" && d <= "2027-12-31" ? d : null;
  return { prefecture: pr as Prefecture, product, nights: n, totalPriceJPY: Math.round(y), travelers, channel, checkIn };
}

export function sharedQuery(s: Shared): string {
  const q = new URLSearchParams();
  q.set("p", s.prefecture);
  q.set("k", s.product);
  q.set("n", String(s.nights));
  q.set("y", String(s.totalPriceJPY));
  q.set("t", String(s.travelers));
  if (s.channel !== "ota") q.set("c", s.channel);
  if (s.checkIn) q.set("d", s.checkIn);
  return q.toString();
}

export const resultPath = (s: Shared) => `/r?${sharedQuery(s)}`;
export const ogPath = (s: Shared) => `/og?${sharedQuery(s)}`;
export const isExample = (s: Shared) => sharedQuery(s) === sharedQuery(EXAMPLE_SHARED);
export const yen = (n: number) => `¥${Math.round(n).toLocaleString("en-US")}`;
