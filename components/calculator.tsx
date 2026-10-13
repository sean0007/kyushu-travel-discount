"use client";

import { useState } from "react";
import { CardDisclaimer } from "@/components/card-disclaimer";
import { ShareBar } from "@/components/share-bar";
import { CHANNELS, CHANNEL_LABEL, PREFECTURES, PREFS, PRODUCTS, PRODUCT_LABEL, calculateDiscount, todayJst, type Channel, type Prefecture, type Product } from "@/lib/discount";
import { EXAMPLE_SHARED, PUBLIC_URL, resultPath, yen, type Shared } from "@/lib/share";

const field = "mt-2 w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-sm text-foreground focus:border-amber";

const VERDICT: Record<string, { label: string; cls: string }> = {
  eligible: { label: "Dates and channel qualify", cls: "border-teal-200/40 bg-teal-200/10 text-teal-100" },
  not_eligible: { label: "Not eligible as entered", cls: "border-red-400/40 bg-red-400/10 text-red-200" },
  not_yet_open: { label: "Sales not open yet: wait to book", cls: "border-amber/50 bg-amber/10 text-amber-100" },
  sold_out: { label: "This allocation is sold out", cls: "border-red-400/40 bg-red-400/10 text-red-200" },
  unchecked: { label: "Add a check-in date to check dates", cls: "border-line bg-white/5 text-muted" },
};

export function Calculator({ initial }: { initial?: Shared }) {
  const start = initial ?? EXAMPLE_SHARED;
  const [prefecture, setPrefecture] = useState<Prefecture>(start.prefecture);
  const [product, setProduct] = useState<Product>(start.product);
  const [channel, setChannel] = useState<Channel>(start.channel);
  const [nights, setNights] = useState<string>(String(start.nights));
  const [travelers, setTravelers] = useState<string>(String(start.travelers));
  const [price, setPrice] = useState<string>(String(start.totalPriceJPY));
  const [checkIn, setCheckIn] = useState<string>(start.checkIn ?? "");
  const [bookingDate, setBookingDate] = useState<string>(todayJst());

  const n = Math.max(1, Math.min(60, Math.floor(Number(nights) || 1)));
  const t = Math.max(1, Math.min(100, Math.floor(Number(travelers) || 1)));
  const y = Math.round(Number(String(price).replace(/[,¥\s]/g, "")) || 0);
  const shared: Shared = { prefecture, product, nights: n, totalPriceJPY: y > 0 ? y : 1, travelers: t, channel, checkIn: checkIn && checkIn >= "2026-09-01" ? checkIn : null };
  const result = (() => {
    try {
      return y > 0 ? calculateDiscount({ ...shared, bookingDate: bookingDate || undefined }) : null;
    } catch {
      return null;
    }
  })();
  const shareUrl = `${PUBLIC_URL}${resultPath(shared)}`;
  const rule = PREFS[prefecture];
  const v = result ? VERDICT[result.eligibility.verdict] : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="rounded-3xl border border-line bg-panel/60 p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your Kyushu booking</p>
        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-foreground">Prefecture you stay in</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PREFECTURES.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPrefecture(id)}
                aria-pressed={prefecture === id}
                className={`rounded-2xl border px-3 py-2 text-left text-sm ${prefecture === id ? "border-amber bg-amber/10 text-foreground" : "border-line text-muted hover:border-amber/50"}`}
              >
                {PREFS[id].en} <span className="font-mono text-xs text-amber">{PREFS[id].ratePct}%</span>
                <span className="block text-xs text-muted">{PREFS[id].ja}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-foreground">What you book</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {PRODUCTS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setProduct(k)}
                aria-pressed={product === k}
                className={`rounded-2xl border px-3 py-2 text-left text-sm ${product === k ? "border-amber bg-amber/10 text-foreground" : "border-line text-muted hover:border-amber/50"}`}
              >
                {PRODUCT_LABEL[k].en}
                <span className="block text-xs text-muted">{PRODUCT_LABEL[k].ja}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-foreground">Where you book</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                aria-pressed={channel === c}
                className={`rounded-full border px-4 py-1.5 text-sm ${channel === c ? "border-amber bg-amber/10 text-foreground" : "border-line text-muted hover:border-amber/50"}`}
              >
                {CHANNEL_LABEL[c].en} <span className="text-xs text-muted">{CHANNEL_LABEL[c].ja}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Total price (¥)</span>
            <span className="mt-0.5 block text-xs text-muted">All travelers, before discount</span>
            <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={`${field} font-mono`} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Travelers</span>
            <span className="mt-0.5 block text-xs text-muted">Children and infants count</span>
            <input inputMode="numeric" value={travelers} onChange={(e) => setTravelers(e.target.value)} className={`${field} font-mono`} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Nights</span>
            <span className="mt-0.5 block text-xs text-muted">At least 1</span>
            <input inputMode="numeric" value={nights} onChange={(e) => setNights(e.target.value)} className={`${field} font-mono`} />
          </label>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Check-in date</span>
            <span className="mt-0.5 block text-xs text-muted">Optional. Checks eligible nights.</span>
            <input type="date" value={checkIn} min="2026-10-01" max="2027-03-01" onChange={(e) => setCheckIn(e.target.value)} className={`${field} font-mono`} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Booking date</span>
            <span className="mt-0.5 block text-xs text-muted">When you book (default today, JST)</span>
            <input type="date" value={bookingDate} min="2026-09-01" onChange={(e) => setBookingDate(e.target.value)} className={`${field} font-mono`} />
          </label>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted">
          {rule.en} campaign site:{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href={rule.site} target="_blank" rel="noopener noreferrer">
            {rule.site.replace(/^https:\/\//, "").replace(/\/$/, "")}
          </a>{" "}
          · call center {rule.callCenter} (Japanese)
        </p>
      </div>

      <article data-testid="result-card" className="relative flex flex-col overflow-hidden rounded-3xl border border-line bg-black/50 lg:sticky lg:top-16 lg:self-start">
        <div className="p-5 sm:p-7">
          <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
            {rule.en} · {rule.ratePct}% · {PRODUCT_LABEL[product].en}
          </p>
          {result ? (
            <>
              <h2 className="mt-2 font-display text-5xl text-teal-200">−{yen(result.discountJPY)}</h2>
              <p className="mt-2 text-sm text-muted">
                You pay <span className="font-mono text-foreground">{yen(result.payJPY)}</span> instead of {yen(result.totalPriceJPY)} · {result.effectiveDiscountPct}% off
                {result.capReached ? ` · cap reached (${yen(result.capPerPersonJPY)} per person)` : ""}
              </p>
              {v && (
                <div className={`mt-4 rounded-2xl border p-3 text-sm ${v.cls}`} data-testid="verdict">
                  <p className="font-semibold">{v.label}</p>
                  <ul className="mt-1 space-y-1 text-xs leading-relaxed opacity-90">
                    {result.eligibility.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-line p-3">
                  <dt className="text-xs text-muted">Cap for this booking</dt>
                  <dd className="font-mono text-foreground">
                    {yen(result.capTotalJPY)} <span className="text-xs text-muted">({yen(result.capPerPersonJPY)} × {result.travelers})</span>
                  </dd>
                </div>
                <div className="rounded-2xl border border-line p-3">
                  <dt className="text-xs text-muted">Full {result.ratePct}% applies up to</dt>
                  <dd className="font-mono text-foreground">{yen(result.fullRateUpToPerPersonJPY)} / person</dd>
                </div>
                <div className="rounded-2xl border border-line p-3">
                  <dt className="text-xs text-muted">Per person you pay</dt>
                  <dd className="font-mono text-foreground">{yen(result.payJPY / result.travelers)}</dd>
                </div>
                <div className="rounded-2xl border border-line p-3">
                  <dt className="text-xs text-muted">If seller rounds to ¥100</dt>
                  <dd className="font-mono text-foreground">−{yen(result.discountRoundedDown100JPY)}</dd>
                </div>
              </dl>
              <ul className="mt-5 space-y-1.5 text-xs leading-relaxed text-muted">
                {[...result.warnings, ...result.prefectureNotes].map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="text-amber">·</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-line pt-4" data-testid="share-result">
                <p className="text-xs text-muted">Share this result. The link carries only these numbers; nothing is stored.</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ShareBar url={shareUrl} text={`Kyushu travel discount (九州ふっこう応援割) in ${rule.en}: ${yen(result.totalPriceJPY)} → ${yen(result.payJPY)} (−${yen(result.discountJPY)}). Free calculator:`} />
                  <a href={resultPath(shared)} className="text-sm text-muted underline underline-offset-2 hover:text-foreground">
                    Open result page
                  </a>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">Enter the booking total in yen.</p>
          )}
        </div>
        <CardDisclaimer />
      </article>
    </div>
  );
}
