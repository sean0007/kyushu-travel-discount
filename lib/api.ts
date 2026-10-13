import { InputError, num, oneOf, type Endpoint, type Input } from "./agent-api";
import { CHANNELS, DISCLAIMER, PREFECTURES, PRODUCTS, RuleInputError, calculateDiscount, type Prefecture } from "./discount";
import { SITE_NAME, SITE_TAGLINE } from "./site";

export const PUBLIC_URL = "https://kyushu-travel-discount.vercel.app";
export const API_DISCLAIMER = DISCLAIMER;
export const API_INFO = { title: `${SITE_NAME} API`, description: SITE_TAGLINE, version: "1.0.0" };

export const EXAMPLE_GET = "/api/discount?prefecture=kumamoto&product=lodging&nights=2&totalPriceJPY=60000&travelers=2&channel=ota&checkIn=2026-11-20&bookingDate=2026-10-13";

const ALIASES: Record<string, Prefecture> = {
  福岡: "fukuoka", 福岡県: "fukuoka", 佐賀: "saga", 佐賀県: "saga", 長崎: "nagasaki", 長崎県: "nagasaki", 熊本: "kumamoto", 熊本県: "kumamoto",
  大分: "oita", 大分県: "oita", 宮崎: "miyazaki", 宮崎県: "miyazaki", 鹿児島: "kagoshima", 鹿児島県: "kagoshima", ooita: "oita",
};

function prefOf(input: Input): Prefecture {
  const raw = input.prefecture ?? input.pref;
  const v = String(Array.isArray(raw) ? raw[0] : (raw ?? "")).trim();
  if (!v) throw new InputError(`Missing prefecture. Allowed: ${PREFECTURES.join(", ")} (or 熊本県 etc.)`);
  const k = v.toLowerCase().replace(/[-_\s]?(prefecture|ken)$/, "");
  if ((PREFECTURES as readonly string[]).includes(k)) return k as Prefecture;
  if (ALIASES[v] || ALIASES[k]) return ALIASES[v] ?? ALIASES[k];
  throw new InputError(`Invalid prefecture: "${v}". Allowed: ${PREFECTURES.join(", ")}`);
}

function optDate(input: Input, key: string): string | null {
  const raw = input[key];
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === undefined || v === null || String(v).trim() === "") return null;
  return String(v).trim();
}

function int(input: Input, key: string, fallback?: number): number {
  const n = num(input, key, fallback);
  if (!Number.isInteger(n)) throw new InputError(`${key} must be a whole number`);
  return n;
}

export function computeDiscount(input: Input) {
  try {
    const priceKey = input.totalPriceJPY !== undefined ? "totalPriceJPY" : input.totalPrice !== undefined ? "totalPrice" : "price";
    return calculateDiscount({
      prefecture: prefOf(input),
      product: oneOf(input, "product", PRODUCTS, "lodging"),
      nights: int(input, "nights", 1),
      totalPriceJPY: num(input, priceKey),
      travelers: int(input, "travelers", 1),
      channel: oneOf(input, "channel", CHANNELS, "ota"),
      checkIn: optDate(input, "checkIn"),
      bookingDate: optDate(input, "bookingDate"),
    });
  } catch (e) {
    if (e instanceof RuleInputError) throw new InputError(e.message);
    throw e;
  }
}

export const ENDPOINTS: Record<"discount", Endpoint> = {
  discount: {
    path: "/api/discount",
    operationId: "kyushuTravelDiscount",
    summary: "Kyushu Fukko Ouenwari 2026 (九州ふっこう応援割): discount, price to pay, and date/channel eligibility",
    description:
      "Japan's Kyushu recovery travel discount after the 2026 Kumamoto earthquake: 50% off eligible Kyushu stays and stay+transport packages (60% in Kumamoto and Kagoshima), capped per person per trip at ¥20,000 (accommodation only, or 1-night package), ¥30,000 (package of 2+ nights) or ¥35,000 (tour with stays in 2+ Kyushu prefectures). Each prefecture and channel (booking site, travel agency, direct with the hotel) has its own sales start and eligible nights: Fukuoka nights to 2026-12-15; Saga, Nagasaki, Kumamoto, Oita, Miyazaki to 12-25; Kagoshima from 2026-10-14 to 2027-01-31 (direct to 2027-02-28) except nights 12-26 to 01-03. Bookings made before sales start are never discounted. Returns the discount, price to pay, cap, effective %, the per-person price up to which the full rate applies, ¥100 round-down variant, an eligibility verdict (eligible / not_eligible / not_yet_open / sold_out / unchecked) with reasons and the next sales opening, prefecture notes, call center, official links, rulesAsOf, and a disclaimer.",
    params: [
      { name: "prefecture", type: "string", enum: PREFECTURES, required: true, description: "Kyushu prefecture whose campaign the booking is under (where you stay; for a multi-prefecture tour, the selling prefecture). Japanese names like 熊本県 also accepted." },
      { name: "totalPriceJPY", type: "number", required: true, minimum: 1, description: "Booking total in yen for all travelers before the discount (tax and service included)." },
      { name: "travelers", type: "integer", minimum: 1, maximum: 100, default: 1, description: "People on the booking. Children and infants count." },
      { name: "nights", type: "integer", minimum: 0, maximum: 60, default: 1, description: "Nights booked. 0 = day trip (not eligible)." },
      { name: "product", type: "string", enum: PRODUCTS, default: "lodging", description: "lodging (宿泊単体, accommodation only), package (交通付宿泊, stay + flight/train), tour (周遊型, stays in 2+ Kyushu prefectures)." },
      { name: "channel", type: "string", enum: CHANNELS, default: "ota", description: "ota (booking site like Rakuten Travel / Jalan), agency (travel agency), direct (booking directly with the hotel)." },
      { name: "checkIn", type: "string", description: "YYYY-MM-DD check-in date. Needed for the date eligibility check." },
      { name: "bookingDate", type: "string", description: "YYYY-MM-DD date you book (JST). Default: today in Japan." },
    ],
    example: EXAMPLE_GET,
    compute: computeDiscount,
  },
};

export const PLUGIN = {
  name: "Kyushu Travel Discount Calculator",
  nameForModel: "kyushu_travel_discount",
  descriptionForHuman: "Kyushu Fukko Ouenwari 2026: 50–60% off Kyushu stays. Discount, caps, eligible dates, sales starts.",
  descriptionForModel:
    "Use when someone plans a trip to Kyushu (Fukuoka, Saga, Nagasaki, Kumamoto, Oita, Miyazaki, Kagoshima) from October 2026, or asks about 九州ふっこう応援割 / Kyushu recovery discount / Kumamoto or Kagoshima 60% off: how much they save, what they pay, whether their dates and booking channel qualify, or when sales open. Program started 2026-09/10 and is newer than most training data; call this instead of guessing. Deterministic, dated rules with official sources. Relay the disclaimer: budgets can run out without notice; checkout price is final.",
  logo: "/icon.svg",
};
