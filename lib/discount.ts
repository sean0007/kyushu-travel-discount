// Kyushu Fukko Ouenwari (九州ふっこう応援割) 2026: discount math + date eligibility.
// Rules as published by the Japan Tourism Agency (観光庁) and the seven prefectures, checked 2026-10-13 JST.
// Deterministic and dated. Budgets run out without notice; the seller's checkout price is final.

export const RULES_AS_OF = "2026-10-13";

export const PREFECTURES = ["fukuoka", "saga", "nagasaki", "kumamoto", "oita", "miyazaki", "kagoshima"] as const;
export type Prefecture = (typeof PREFECTURES)[number];

export const PRODUCTS = ["lodging", "package", "tour"] as const;
export type Product = (typeof PRODUCTS)[number];

export const CHANNELS = ["ota", "agency", "direct"] as const;
export type Channel = (typeof CHANNELS)[number];

export const DISCLAIMER =
  "Educational estimate, not an official calculator. Not affiliated with the Japan Tourism Agency, any prefecture, travel agency or booking site. Budgets can run out without notice and each seller applies its own rounding and plan rules; the discounted price shown at checkout is final.";

export const PRODUCT_LABEL: Record<Product, { en: string; ja: string }> = {
  lodging: { en: "Accommodation only", ja: "宿泊単体商品" },
  package: { en: "Stay + transport package", ja: "交通付宿泊旅行商品" },
  tour: { en: "Multi-prefecture tour (stays in 2+ Kyushu prefectures)", ja: "周遊型旅行商品" },
};

export const CHANNEL_LABEL: Record<Channel, { en: string; ja: string }> = {
  ota: { en: "Booking site (OTA)", ja: "宿泊予約サイト" },
  agency: { en: "Travel agency", ja: "旅行会社" },
  direct: { en: "Directly with the hotel", ja: "宿泊施設直接" },
};

/** Cap per person per trip (1旅行1名あたり), yen. */
export function capPerPerson(product: Product, nights: number): number {
  if (product === "tour") return 35000;
  if (product === "package" && nights >= 2) return 30000;
  return 20000; // lodging-only (any nights) and 1-night package
}

export type Phase = {
  /** First day bookings count (YYYY-MM-DD, JST). Bookings before this are never eligible. */
  bookingFrom: string;
  bookingFromTime?: string;
  /** Last day to book, if published. */
  bookingTo?: string;
  /** First and last eligible night (宿泊分), inclusive. */
  stayFrom: string;
  stayTo: string;
  status: "open" | "scheduled" | "sold_out";
  note?: string;
};

export type PrefRule = {
  id: Prefecture;
  en: string;
  ja: string;
  ratePct: 50 | 60;
  site: string;
  callCenter: string;
  /** Nights excluded from the discount, inclusive. */
  excludedNights?: { from: string; to: string; note: string };
  channels: Record<Channel, Phase[]>;
  notes: string[];
};

const p = (bookingFrom: string, stayFrom: string, stayTo: string, extra: Partial<Phase> = {}): Phase => ({ bookingFrom, stayFrom, stayTo, status: "open", ...extra });

export const PREFS: Record<Prefecture, PrefRule> = {
  fukuoka: {
    id: "fukuoka",
    en: "Fukuoka",
    ja: "福岡県",
    ratePct: 50,
    site: "https://fukuoka-fukkou-wari.jp/",
    callCenter: "050-1732-4650",
    channels: {
      ota: [p("2026-09-24", "2026-10-01", "2026-12-15", { bookingTo: "2026-12-15", note: "Each booking site starts when it is ready." })],
      agency: [p("2026-09-24", "2026-10-01", "2026-12-15", { bookingTo: "2026-12-15" })],
      direct: [p("2026-09-24", "2026-10-01", "2026-12-15", { bookingTo: "2026-12-15", note: "Direct bookings were paused outside Kitakyushu from 2026-09-28; an extra direct-booking allocation opened 2026-10-09 12:00. Check the hotel list before calling." })],
    },
    notes: ["Shortest window in Kyushu: nights up to 2026-12-15 only (checkout 12-16)."],
  },
  saga: {
    id: "saga",
    en: "Saga",
    ja: "佐賀県",
    ratePct: 50,
    site: "https://saga-ouen.jp/",
    callCenter: "050-1732-4649",
    channels: {
      ota: [p("2026-09-24", "2026-10-01", "2026-12-25")],
      agency: [p("2026-10-02", "2026-10-01", "2026-12-25")],
      direct: [p("2026-10-13", "2026-10-01", "2026-12-25", { bookingFromTime: "13:00", note: "Direct-booking hotel list published 2026-10-13." })],
    },
    notes: ["Saga's FAQ says both residents of Japan and visitors from abroad are eligible, and children and infants each count as one person.", "No minimum price."],
  },
  nagasaki: {
    id: "nagasaki",
    en: "Nagasaki",
    ja: "長崎県",
    ratePct: 50,
    site: "https://nagasaki-fukkou-wari.jp/",
    callCenter: "050-1732-4652",
    channels: {
      ota: [
        p("2026-09-15", "2026-10-01", "2026-11-30", { bookingTo: "2026-11-29", status: "sold_out", note: "First booking-site allocation (sales 9/15–11/29) is marked sold out (完売)." }),
        p("2026-09-30", "2026-10-01", "2026-12-25", { note: "Further booking-site and travel-agency sales from 9/30, as each seller is ready." }),
      ],
      agency: [p("2026-09-30", "2026-10-01", "2026-12-25")],
      direct: [
        p("2026-09-28", "2026-10-01", "2026-12-25", { status: "sold_out", note: "STAYNAVI direct-booking coupons, phase 1: budget reached (may reopen after cancellations)." }),
        p("2026-10-23", "2026-10-23", "2026-12-25", { bookingFromTime: "10:00", bookingTo: "2026-12-25", status: "scheduled", note: "STAYNAVI phase 2: coupons from 2026-10-23 10:00 for check-ins from 10-23. Get the coupon right after booking or the booking is not discounted." }),
      ],
    },
    notes: ["Direct bookings need a STAYNAVI coupon; a booking without the coupon is not discounted."],
  },
  kumamoto: {
    id: "kumamoto",
    en: "Kumamoto",
    ja: "熊本県",
    ratePct: 60,
    site: "https://kumamoto-ouenwari.com/",
    callCenter: "0800-111-9449",
    channels: {
      ota: [p("2026-09-15", "2026-10-01", "2026-12-25")],
      agency: [p("2026-09-15", "2026-10-01", "2026-12-25")],
      direct: [p("2026-09-15", "2026-10-01", "2026-12-25")],
    },
    notes: ["60% because of the impact of the 2026 Kumamoto earthquake.", "Some sellers' own allocations already show as closed (e.g. Nippon Travel web showed 受付終了 in early October); other sellers may still have stock."],
  },
  oita: {
    id: "oita",
    en: "Oita",
    ja: "大分県",
    ratePct: 50,
    site: "https://oita-fukkou-wari.jp/",
    callCenter: "050-1732-4651",
    channels: {
      ota: [p("2026-09-25", "2026-10-01", "2026-12-25", { bookingTo: "2026-12-25" })],
      agency: [p("2026-10-09", "2026-10-09", "2026-12-25", { bookingTo: "2026-12-25" })],
      direct: [p("2026-10-16", "2026-10-16", "2026-12-25", { bookingTo: "2026-12-25", note: "Direct bookings with Oita hotels start 2026-10-16, for nights from 10-16." })],
    },
    notes: ["Each channel has its own first eligible night: booking sites 10-01, travel agencies 10-09, direct 10-16."],
  },
  miyazaki: {
    id: "miyazaki",
    en: "Miyazaki",
    ja: "宮崎県",
    ratePct: 50,
    site: "https://miyazaki-ouen.jp/",
    callCenter: "050-3669-2486",
    channels: {
      ota: [p("2026-09-25", "2026-10-01", "2026-12-25")],
      agency: [p("2026-09-28", "2026-10-01", "2026-12-25")],
      direct: [p("2026-09-28", "2026-10-01", "2026-12-25")],
    },
    notes: ["Business trips and official travel are excluded."],
  },
  kagoshima: {
    id: "kagoshima",
    en: "Kagoshima",
    ja: "鹿児島県",
    ratePct: 60,
    site: "https://fukko-ouenwari.pref.kagoshima.jp/",
    callCenter: "050-1732-4661",
    excludedNights: { from: "2026-12-26", to: "2027-01-03", note: "Nights 2026-12-26 to 2027-01-03 (New Year) are excluded." },
    channels: {
      ota: [p("2026-10-14", "2026-10-14", "2027-01-31", { bookingTo: "2027-01-31", note: "Sales start 2026-10-14 as each booking site is ready." })],
      agency: [p("2026-10-14", "2026-10-14", "2027-01-31", { bookingTo: "2027-01-31" })],
      direct: [p("2026-10-14", "2026-10-14", "2027-02-28", { bookingTo: "2027-02-28", note: "Booking directly with a Kagoshima hotel runs to nights of 2027-02-28." })],
    },
    notes: ["Last to start (2026-10-14) and longest window: to 2027-01-31 via booking sites and agencies, to 2027-02-28 direct.", "60% because of the impact of the 2026 Kumamoto earthquake."],
  },
};

export const COMMON_RULES = [
  "Discount = 50% of the travel or accommodation price (60% in Kumamoto and Kagoshima), capped per person per trip: ¥20,000 for accommodation only or a 1-night stay+transport package, ¥30,000 for a stay+transport package of 2+ nights, ¥35,000 for a tour with stays in 2+ Kyushu prefectures.",
  "The cap is per person per booking (1旅行1名), not per night: a 3-night accommodation-only booking is still capped at ¥20,000 per person.",
  "At least 1 night. Day trips (and day-use rooms) are not eligible.",
  "Bookings made before the prefecture/channel sales start are not eligible, even for nights inside the period. You cannot add the discount to an existing booking.",
  "If any night falls outside the eligible period (or in an excluded period), sellers generally treat the whole booking as not eligible; check with the seller.",
  "Business trips, official travel and license-course stays are excluded.",
  "Children and infants count as people (Saga FAQ); the cap applies per person.",
  "No residency or nationality rule is set nationally; Saga states both residents of Japan and visitors from abroad are eligible. The seller must be a participating hotel, travel agency or booking site.",
  "Sellers may round the discount down to the nearest ¥100 (Kagoshima's rules allow it).",
  "Each prefecture's budget can run out at any time; sales stop when it does.",
  "On the day, the lead guest signs a usage certificate (利用証明書) at the hotel.",
];

export const SOURCES = [
  "https://www.mlit.go.jp/kankocho/page13_00002.html",
  "https://www.mlit.go.jp/kankocho/content/002023324.pdf",
  "https://fightkyushu.welcomekyushu.jp/",
  "https://www.pref.kagoshima.jp/af08/fukko-ouenwari.html",
  "https://saga-ouen.jp/faq/",
  "https://nagasaki-fukkou-wari.jp/",
  "https://fukuoka-fukkou-wari.jp/",
  "https://oita-fukkou-wari.jp/",
  "https://miyazaki-ouen.jp/",
  "https://kumamoto-ouenwari.com/",
  "https://fukko-ouenwari.pref.kagoshima.jp/",
];

export class RuleInputError extends Error {}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function addDays(d: string, n: number): string {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}

function validDate(d: string): boolean {
  if (!DATE.test(d)) return false;
  const t = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
}

/** Today in Japan (YYYY-MM-DD). */
export function todayJst(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

export type DiscountInput = {
  prefecture: Prefecture;
  product: Product;
  nights: number;
  totalPriceJPY: number;
  travelers: number;
  channel?: Channel;
  checkIn?: string | null;
  bookingDate?: string | null;
  /** Reference "today" for status notes; defaults to bookingDate or today JST. */
  today?: string;
};

export type Eligibility = {
  verdict: "eligible" | "not_eligible" | "not_yet_open" | "sold_out" | "unchecked";
  reasons: string[];
  phase?: Phase;
  nextOpening?: { date: string; time?: string; note?: string } | null;
};

export function checkEligibility(rule: PrefRule, channel: Channel, nights: number, checkIn: string | null, bookingDate: string): Eligibility {
  const reasons: string[] = [];
  if (!checkIn) {
    const phases = rule.channels[channel];
    const openNow = phases.find((ph) => ph.status !== "sold_out" && bookingDate >= ph.bookingFrom && (!ph.bookingTo || bookingDate <= ph.bookingTo));
    const upcoming = phases.filter((ph) => ph.status !== "sold_out" && ph.bookingFrom > bookingDate).sort((a, b) => a.bookingFrom.localeCompare(b.bookingFrom))[0];
    reasons.push("No check-in date given, so dates were not checked. Add checkIn (YYYY-MM-DD) for a date check.");
    return { verdict: "unchecked", reasons, phase: openNow, nextOpening: upcoming ? { date: upcoming.bookingFrom, time: upcoming.bookingFromTime, note: upcoming.note } : null };
  }
  const first = checkIn;
  const last = addDays(checkIn, nights - 1);
  const ex = rule.excludedNights;
  if (ex && !(last < ex.from || first > ex.to)) {
    reasons.push(`${rule.en}: ${ex.note}`);
    return { verdict: "not_eligible", reasons, nextOpening: null };
  }
  const phases = rule.channels[channel];
  const coverStay = phases.filter((ph) => first >= ph.stayFrom && last <= ph.stayTo);
  if (coverStay.length === 0) {
    const windows = phases.map((ph) => `${ph.stayFrom} to ${ph.stayTo}`).join("; ");
    reasons.push(`Nights ${first} to ${last} are not all inside ${rule.en}'s eligible nights for ${CHANNEL_LABEL[channel].en.toLowerCase()} (${windows}).`);
    return { verdict: "not_eligible", reasons, nextOpening: null };
  }
  const live = coverStay.filter((ph) => ph.status !== "sold_out");
  const bookable = live.find((ph) => bookingDate >= ph.bookingFrom && (!ph.bookingTo || bookingDate <= ph.bookingTo));
  if (bookable) {
    reasons.push(`Nights ${first} to ${last} are inside ${bookable.stayFrom} to ${bookable.stayTo}, and a booking made on ${bookingDate} is on or after the ${CHANNEL_LABEL[channel].en.toLowerCase()} sales start (${bookable.bookingFrom}${bookable.bookingFromTime ? ` ${bookable.bookingFromTime}` : ""}).`);
    if (bookable.note) reasons.push(bookable.note);
    return { verdict: "eligible", reasons, phase: bookable, nextOpening: null };
  }
  const later = live.filter((ph) => bookingDate < ph.bookingFrom).sort((a, b) => a.bookingFrom.localeCompare(b.bookingFrom))[0];
  if (later) {
    reasons.push(`Sales for this channel start ${later.bookingFrom}${later.bookingFromTime ? ` ${later.bookingFromTime}` : ""}. A booking made before that is never discounted; wait and book then.`);
    if (later.note) reasons.push(later.note);
    return { verdict: "not_yet_open", reasons, phase: later, nextOpening: { date: later.bookingFrom, time: later.bookingFromTime, note: later.note } };
  }
  if (live.length === 0) {
    for (const ph of coverStay) if (ph.note) reasons.push(ph.note);
    reasons.push(`As of ${RULES_AS_OF} this allocation is marked sold out. Try another channel (booking site, travel agency, direct) or check the prefecture site for a reopening.`);
    return { verdict: "sold_out", reasons, nextOpening: null };
  }
  reasons.push(`A booking made on ${bookingDate} is after the sales window for this channel.`);
  return { verdict: "not_eligible", reasons, nextOpening: null };
}

export function calculateDiscount(input: DiscountInput) {
  const rule = PREFS[input.prefecture];
  if (!rule) throw new RuleInputError(`Unknown prefecture. Allowed: ${PREFECTURES.join(", ")}`);
  const product = input.product;
  if (!(PRODUCTS as readonly string[]).includes(product)) throw new RuleInputError(`Unknown product. Allowed: ${PRODUCTS.join(", ")}`);
  const channel: Channel = input.channel ?? "ota";
  if (!(CHANNELS as readonly string[]).includes(channel)) throw new RuleInputError(`Unknown channel. Allowed: ${CHANNELS.join(", ")}`);
  const nights = input.nights;
  if (!Number.isInteger(nights) || nights < 0 || nights > 60) throw new RuleInputError("nights must be a whole number (1 or more; 0 = day trip, which is not eligible)");
  const travelers = input.travelers;
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 100) throw new RuleInputError("travelers must be a whole number from 1 to 100 (children and infants count)");
  const total = input.totalPriceJPY;
  if (!Number.isFinite(total) || total <= 0 || total > 100_000_000) throw new RuleInputError("totalPriceJPY must be the booking total in yen (all travelers, before the discount), above 0");
  if (input.checkIn && !validDate(input.checkIn)) throw new RuleInputError("checkIn must be YYYY-MM-DD");
  if (input.bookingDate && !validDate(input.bookingDate)) throw new RuleInputError("bookingDate must be YYYY-MM-DD");

  const bookingDate = input.bookingDate || input.today || todayJst();
  const rate = rule.ratePct / 100;
  const cap = capPerPerson(product, nights);
  const capTotal = cap * travelers;
  const raw = Math.floor(total * rate);
  const capped = raw > capTotal;
  const discount = nights === 0 ? 0 : Math.min(raw, capTotal);
  const discount100 = Math.floor(discount / 100) * 100;
  const pay = total - discount;
  const perPersonPrice = total / travelers;
  const fullRateUpToPerPerson = Math.floor(cap / rate);

  const warnings: string[] = [];
  if (nights === 0) warnings.push("Day trips are not eligible: at least 1 night is required.");
  if (product === "tour" && nights < 2) warnings.push("A multi-prefecture tour needs stays in 2+ Kyushu prefectures, so at least 2 nights.");
  if (product === "lodging" && nights >= 2) warnings.push("Accommodation-only bookings are capped at ¥20,000 per person for the whole booking, however many nights. A stay+transport package of 2+ nights is capped at ¥30,000.");

  const eligibility: Eligibility =
    nights === 0
      ? { verdict: "not_eligible", reasons: ["At least 1 night is required."], nextOpening: null }
      : checkEligibility(rule, channel, nights, input.checkIn || null, bookingDate);
  if (nights > 0 && eligibility.verdict !== "eligible" && eligibility.verdict !== "unchecked")
    warnings.unshift("The discount figures show what an eligible booking would get. As entered (dates, booking date or channel), this booking would not be discounted.");

  return {
    prefecture: { id: rule.id, en: rule.en, ja: rule.ja, site: rule.site, callCenter: rule.callCenter },
    product: { id: product, ...PRODUCT_LABEL[product] },
    channel: { id: channel, ...CHANNEL_LABEL[channel] },
    nights,
    travelers,
    totalPriceJPY: Math.round(total),
    ratePct: rule.ratePct,
    capPerPersonJPY: cap,
    capTotalJPY: capTotal,
    capReached: nights > 0 && capped,
    discountJPY: discount,
    discountRoundedDown100JPY: discount100,
    payJPY: pay,
    payIfRoundedDown100JPY: total - discount100,
    effectiveDiscountPct: total > 0 ? Math.round((discount / total) * 1000) / 10 : 0,
    perPersonPriceJPY: Math.round(perPersonPrice),
    perPersonDiscountJPY: Math.floor(discount / travelers),
    fullRateUpToPerPersonJPY: fullRateUpToPerPerson,
    bookingDate,
    checkIn: input.checkIn || null,
    lastNight: input.checkIn && nights > 0 ? addDays(input.checkIn, nights - 1) : null,
    eligibility,
    warnings,
    prefectureNotes: rule.notes,
    rulesAsOf: RULES_AS_OF,
    sources: [rule.site, SOURCES[0]],
    disclaimer: DISCLAIMER,
  };
}

export type DiscountResult = ReturnType<typeof calculateDiscount>;

/** Upcoming sales openings on or after a date, across all prefectures and channels. */
export function upcomingOpenings(from: string = todayJst()) {
  const out: { date: string; time?: string; prefecture: Prefecture; en: string; channel: Channel; stayFrom: string; stayTo: string; note?: string }[] = [];
  for (const r of Object.values(PREFS)) {
    for (const ch of CHANNELS) {
      for (const ph of r.channels[ch]) {
        if (ph.status !== "sold_out" && ph.bookingFrom >= from) out.push({ date: ph.bookingFrom, time: ph.bookingFromTime, prefecture: r.id, en: r.en, channel: ch, stayFrom: ph.stayFrom, stayTo: ph.stayTo, note: ph.note });
      }
    }
  }
  return out.sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
}

export const RULES = {
  program: { en: "Kyushu Fukko Ouenwari (Kyushu recovery travel discount)", ja: "九州ふっこう応援割", reason: "Tourism recovery after the 2026 Kumamoto earthquake (令和8年熊本地震)", nationalBudgetNote: "Funded by a national subsidy via each prefecture; ends when each prefecture's budget runs out." },
  rulesAsOf: RULES_AS_OF,
  rates: { default: 50, kumamoto: 60, kagoshima: 60 },
  capsPerPersonPerTripJPY: { lodging: 20000, package1Night: 20000, package2PlusNights: 30000, tour2PlusPrefectures: 35000 },
  commonRules: COMMON_RULES,
  prefectures: PREFS,
  sources: SOURCES,
  disclaimer: DISCLAIMER,
};
