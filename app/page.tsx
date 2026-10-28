import type { Metadata } from "next";
import { Calculator } from "@/components/calculator";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { CHANNELS, CHANNEL_LABEL, PREFECTURES, PREFS, RULES_AS_OF, SOURCES, todayJst, upcomingOpenings } from "@/lib/discount";
import { EXAMPLE_SHARED, PUBLIC_URL, resultPath, type Shared } from "@/lib/share";

export const revalidate = 3600;

const title = "Kyushu travel discount calculator 2026 (九州ふっこう応援割 計算): how much you save in Fukuoka, Kumamoto, Kagoshima and more";
const description =
  "Free Kyushu Fukko Ouenwari calculator: 50% off Kyushu stays (60% in Kumamoto and Kagoshima), capped at ¥20,000 per person (¥30,000 for 2+ night packages, ¥35,000 multi-prefecture tours). Checks your dates and booking channel for all 7 prefectures, shows when sales open, free JSON API for AI agents. Unofficial estimate.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Kyushu Travel Discount Calculator",
  alternateName: ["九州ふっこう応援割 計算", "Kyushu Fukko Ouenwari calculator"],
  url: PUBLIC_URL,
  applicationCategory: "TravelApplication",
  operatingSystem: "Any",
  inLanguage: ["en", "ja"],
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  description:
    "Unofficial, free calculator for Japan's Kyushu Fukko Ouenwari 2026 travel discount: discount and price to pay with per-person caps, date and booking-channel eligibility for Fukuoka, Saga, Nagasaki, Kumamoto, Oita, Miyazaki and Kagoshima, and upcoming sales openings, with a keyless JSON API. Educational estimate.",
};

const faq: FaqItem[] = [
  {
    q: "What is the Kyushu Fukko Ouenwari (九州ふっこう応援割)?",
    a: "A national travel discount for Kyushu after the July 2026 Kumamoto earthquake, run by each of the seven Kyushu prefectures with Japan Tourism Agency funding. Eligible stays and stay+transport packages are 50% off (60% in Kumamoto and Kagoshima) for nights from October 1, 2026 (Kagoshima from October 14), until each prefecture's budget runs out.",
  },
  {
    q: "How much is the Kyushu travel discount per person?",
    a: "50% of the price (60% in Kumamoto and Kagoshima), capped per person per trip: ¥20,000 for accommodation only or a 1-night stay+transport package, ¥30,000 for a stay+transport package of 2 or more nights, and ¥35,000 for a tour with stays in 2 or more Kyushu prefectures. The full rate applies up to ¥40,000 per person at 50% (¥33,333 at 60%) for a ¥20,000 cap.",
  },
  {
    q: "Is the cap per night or per trip?",
    a: "Per trip (1旅行1名). A 3-night accommodation-only booking in Fukuoka at ¥30,000 per person per night (¥90,000) still gets at most ¥20,000 off per person. If you stay several nights, a stay+transport package of 2+ nights (¥30,000 cap) or separate bookings may work out better; check the seller's rules.",
  },
  {
    q: "Can foreign tourists use the Kyushu recovery discount?",
    a: "The national program sets no residency or nationality rule, and Saga's FAQ says residents of Japan and visitors from abroad are both eligible. You must book an eligible plan through a participating hotel, travel agency or booking site; an English booking page does not by itself mean the plan carries the discount. Business trips are excluded.",
  },
  {
    q: "When does Kagoshima's 60% discount start?",
    a: "Sales start October 14, 2026 for nights from October 14. Through booking sites and travel agencies it covers nights to January 31, 2027; booking directly with a Kagoshima hotel covers nights to February 28, 2027. Nights from December 26, 2026 to January 3, 2027 are excluded.",
  },
  {
    q: "Until when can I use it in Fukuoka, Saga, Nagasaki, Kumamoto, Oita and Miyazaki?",
    a: "Fukuoka: nights to December 15, 2026. Saga, Nagasaki, Kumamoto, Oita and Miyazaki: nights to December 25, 2026. In Oita, travel-agency bookings cover nights from October 9 and direct hotel bookings from October 16. Every prefecture stops early if its budget runs out.",
  },
  {
    q: "I booked before the campaign started. Can I get the discount?",
    a: "No. Bookings made before the prefecture's sales start for that channel are not eligible, even for nights inside the period, and the discount cannot be added later. Cancelling and rebooking an eligible plan may be possible but cancellation fees are yours.",
  },
  {
    q: "Do children count?",
    a: "Yes. Saga's FAQ says children and infants each count as one person, so the cap is multiplied by everyone on the booking. Sellers price children differently; this calculator applies the cap to the booking total, as Nippon Travel's published example does.",
  },
  {
    q: "Nagasaki direct booking says sold out. What now?",
    a: "Nagasaki's first direct-booking (STAYNAVI) coupon budget was reached on 2026-09-28. Phase 2 coupons open 2026-10-23 10:00 for check-ins from October 23. Booking-site and travel-agency allocations are separate, so check those too.",
  },
  {
    q: "九州ふっこう応援割はいくら安くなる？",
    a: "旅行・宿泊料金の50％（熊本県・鹿児島県は60％）が割引されます。上限は1旅行1名あたり、宿泊単体・交通付1泊は2万円、交通付2泊以上は3万円、2県以上の周遊型は3.5万円です。例：熊本で2名2泊の宿泊単体6万円なら3万6千円引きで支払2万4千円。",
  },
  {
    q: "鹿児島ふっこう応援割はいつから？",
    a: "2026年10月14日（水）から販売開始、10月14日宿泊分から対象です。旅行会社・予約サイト経由は2027年1月31日宿泊分まで、宿泊施設への直接予約は2月28日宿泊分まで。2026年12月26日〜2027年1月3日の宿泊は対象外です。",
  },
  {
    q: "Is there a free Kyushu travel discount API for AI agents?",
    a: `Yes. Free, no key, CORS open: GET ${PUBLIC_URL}/api/discount?prefecture=kumamoto&product=lodging&nights=2&totalPriceJPY=60000&travelers=2&checkIn=2026-11-20 returns the discount, price to pay, cap, eligibility verdict and next sales opening. Full rules and upcoming openings at ${PUBLIC_URL}/api/rules, OpenAPI at ${PUBLIC_URL}/openapi.json, and the kyushu_travel_discount_check tool on https://free-agent-tools.vercel.app/mcp.`,
  },
];

function windowText(id: (typeof PREFECTURES)[number]) {
  const r = PREFS[id];
  return CHANNELS.map((c) => {
    const live = r.channels[c].filter((ph) => ph.status !== "sold_out");
    const ph = live[live.length - 1] ?? r.channels[c][r.channels[c].length - 1];
    return `${CHANNEL_LABEL[c].en.replace("Booking site (OTA)", "Booking site").replace("Directly with the hotel", "Direct")}: from ${ph.bookingFrom.slice(5)}${ph.status === "sold_out" ? " (sold out)" : ""}`;
  }).join(" · ");
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const HERO_CHANNEL: Record<string, string> = { ota: "booking-site", agency: "travel-agency", direct: "direct-booking" };
function longDate(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

export default function HomePage() {
  const today = todayJst();
  const openings = upcomingOpenings(today).slice(0, 6);
  const kagoshimaOpen = today >= "2026-10-14";
  const nextOpening = openings[0];
  // On a sales-opening day, pre-fill the calculator for that prefecture/channel so visitors land on a live eligible example.
  const openingDefault: Shared | undefined =
    nextOpening && nextOpening.date === today
      ? {
          prefecture: nextOpening.prefecture,
          product: "lodging",
          nights: 2,
          totalPriceJPY: 60000,
          travelers: 2,
          channel: nextOpening.channel,
          checkIn: nextOpening.stayFrom,
        }
      : undefined;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Free · Kyushu · 九州ふっこう応援割 2026</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Kyushu travel discount calculator: how much will you save?</h1>
        <p className="mt-4 max-w-2xl text-lg font-medium text-foreground sm:text-xl">50% off Kyushu stays, 60% in Kumamoto and Kagoshima, capped per person.</p>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          This free Kyushu travel discount calculator (checker) takes your booking and gives the discount, what you pay, and whether your dates and booking channel qualify in all seven prefectures. {kagoshimaOpen ? "Kagoshima (60% off) sales opened October 14, 2026, for nights to January 31 (February 28 when booked direct)." : "Kagoshima sales open October 14."}
          {nextOpening && (
            <>
              {" "}
              <span className="font-medium text-foreground">
                Next: {nextOpening.en} {HERO_CHANNEL[nextOpening.channel]} sales {nextOpening.date === today ? "open today" : `open ${longDate(nextOpening.date)}`}
                {nextOpening.time ? ` at ${nextOpening.time} JST` : ""}.
              </span>
            </>
          )}
        </p>
      </section>

      <section className="mt-8">
        <Calculator initial={openingDefault} />
      </section>

      {openings.length > 0 && (
        <section className="mt-16 max-w-3xl">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Next sales openings</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {openings.map((o) => (
              <li key={`${o.prefecture}-${o.channel}-${o.date}`} className="rounded-2xl border border-line px-4 py-3">
                <span className="font-mono text-foreground">
                  {o.date}
                  {o.time ? ` ${o.time}` : ""}
                </span>{" "}
                {o.date === today && <span className="ml-1 rounded-full bg-amber/15 px-2 py-0.5 font-mono text-[11px] text-amber uppercase">opens today</span>}{" "}
                · {o.en} · {CHANNEL_LABEL[o.channel].en} · nights {o.stayFrom} to {o.stayTo}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">All seven prefectures (as of {RULES_AS_OF})</h2>
        <div className="mt-5 overflow-x-auto rounded-3xl border border-line">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-panel/80 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Prefecture</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">Eligible nights</th>
                <th className="px-4 py-3 font-medium">Sales start</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {PREFECTURES.map((id) => {
                const r = PREFS[id];
                const nightsFrom = r.channels.ota[r.channels.ota.length - 1].stayFrom;
                const nightsTo = Math.max(...CHANNELS.map((c) => Number(r.channels[c][r.channels[c].length - 1].stayTo.replace(/-/g, ""))));
                const to = String(nightsTo).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
                return (
                  <tr key={id}>
                    <td className="px-4 py-3">
                      <a className="underline underline-offset-2 hover:text-foreground" href={r.site} target="_blank" rel="noopener noreferrer">
                        {r.en}
                      </a>{" "}
                      <span className="text-muted">({r.ja})</span>
                    </td>
                    <td className="px-4 py-3 font-mono">{r.ratePct}%</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {nightsFrom} → {to}
                      {r.excludedNights ? <span className="block text-muted">excl. {r.excludedNights.from} → {r.excludedNights.to}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{windowText(id)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">
          Caps per person per trip: ¥20,000 accommodation only or 1-night package · ¥30,000 package of 2+ nights · ¥35,000 tour with stays in 2+ prefectures. Example:{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SHARED)}>
            2 people, 2 nights in Kumamoto for ¥60,000 → pay ¥24,000
          </a>
          .
        </p>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Agent-callable JSON API</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          Free, no key, CORS open.{" "}
          <code className="rounded bg-panel px-1.5 py-0.5 font-mono text-xs text-foreground">GET {PUBLIC_URL}/api/discount?prefecture=kumamoto&amp;nights=2&amp;totalPriceJPY=60000&amp;travelers=2&amp;checkIn=2026-11-20</code> or POST JSON. Also{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="/api/rules">/api/rules</a>,{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="/openapi.json">/openapi.json</a>,{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="/llms.txt">/llms.txt</a>, and the MCP tool on{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="https://free-agent-tools.vercel.app/" target="_blank" rel="noopener noreferrer">
            free-agent-tools
          </a>
          .
        </p>
        <p className="mt-3 text-xs text-muted">
          Official sources:{" "}
          {SOURCES.slice(0, 3).map((s, i) => (
            <span key={s}>
              {i > 0 ? " · " : ""}
              <a className="underline underline-offset-2 hover:text-foreground" href={s} target="_blank" rel="noopener noreferrer">
                {s.replace(/^https:\/\//, "")}
              </a>
            </span>
          ))}
        </p>
      </section>

      <FaqSection items={faq} heading="Kyushu travel discount questions" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
