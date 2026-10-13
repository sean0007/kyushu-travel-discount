import assert from "node:assert/strict";
import test from "node:test";
import { PREFS, PREFECTURES, RuleInputError, calculateDiscount, capPerPerson, upcomingOpenings } from "./discount";

const base = { prefecture: "kumamoto" as const, product: "lodging" as const, nights: 1, travelers: 1, channel: "ota" as const, bookingDate: "2026-10-13" };

test("rates: 60% Kumamoto/Kagoshima, 50% elsewhere", () => {
  for (const id of PREFECTURES) assert.equal(PREFS[id].ratePct, id === "kumamoto" || id === "kagoshima" ? 60 : 50, id);
});

test("caps per person per trip follow the JTA table", () => {
  assert.equal(capPerPerson("lodging", 1), 20000);
  assert.equal(capPerPerson("lodging", 5), 20000);
  assert.equal(capPerPerson("package", 1), 20000);
  assert.equal(capPerPerson("package", 2), 30000);
  assert.equal(capPerPerson("tour", 3), 35000);
});

test("HuffPost-style examples: Kumamoto 1 night ¥20,000 → ¥12,000 off; ¥50,000 → capped ¥20,000", () => {
  const a = calculateDiscount({ ...base, totalPriceJPY: 20000 });
  assert.equal(a.discountJPY, 12000);
  assert.equal(a.payJPY, 8000);
  assert.equal(a.capReached, false);
  const b = calculateDiscount({ ...base, totalPriceJPY: 50000 });
  assert.equal(b.discountJPY, 20000);
  assert.equal(b.payJPY, 30000);
  assert.equal(b.capReached, true);
  assert.equal(b.effectiveDiscountPct, 40);
});

test("Nippon Travel example: 50% with 3 people, ¥125,000 → cap ¥60,000, pay ¥65,000", () => {
  const r = calculateDiscount({ ...base, prefecture: "fukuoka", totalPriceJPY: 125000, travelers: 3, checkIn: "2026-11-10" });
  assert.equal(r.discountJPY, 60000);
  assert.equal(r.payJPY, 65000);
  assert.equal(r.capTotalJPY, 60000);
});

test("full rate applies up to cap/rate per person", () => {
  assert.equal(calculateDiscount({ ...base, totalPriceJPY: 10000 }).fullRateUpToPerPersonJPY, 33333);
  assert.equal(calculateDiscount({ ...base, prefecture: "saga", totalPriceJPY: 10000 }).fullRateUpToPerPersonJPY, 40000);
});

test("2+ night package caps at ¥30,000, tour at ¥35,000", () => {
  const p = calculateDiscount({ ...base, prefecture: "oita", product: "package", nights: 2, totalPriceJPY: 200000, travelers: 2 });
  assert.equal(p.discountJPY, 60000);
  const t = calculateDiscount({ ...base, prefecture: "kagoshima", product: "tour", nights: 3, totalPriceJPY: 100000, travelers: 1, bookingDate: "2026-10-14" });
  assert.equal(t.discountJPY, 35000);
});

test("lodging multi-night stays capped at ¥20,000 per person with a warning", () => {
  const r = calculateDiscount({ ...base, nights: 3, totalPriceJPY: 90000 });
  assert.equal(r.discountJPY, 20000);
  assert.ok(r.warnings.some((w) => w.includes("however many nights")));
});

test("¥100 round-down variant", () => {
  const r = calculateDiscount({ ...base, prefecture: "saga", totalPriceJPY: 12345 });
  assert.equal(r.discountJPY, 6172);
  assert.equal(r.discountRoundedDown100JPY, 6100);
  assert.equal(r.payIfRoundedDown100JPY, 6245);
});

test("eligible: Kumamoto OTA, nights inside period, booked after start", () => {
  const r = calculateDiscount({ ...base, totalPriceJPY: 30000, checkIn: "2026-11-20", nights: 2 });
  assert.equal(r.eligibility.verdict, "eligible");
  assert.equal(r.lastNight, "2026-11-21");
});

test("Fukuoka stops after nights of 12-15", () => {
  assert.equal(calculateDiscount({ ...base, prefecture: "fukuoka", totalPriceJPY: 30000, checkIn: "2026-12-15" }).eligibility.verdict, "eligible");
  assert.equal(calculateDiscount({ ...base, prefecture: "fukuoka", totalPriceJPY: 30000, checkIn: "2026-12-15", nights: 2 }).eligibility.verdict, "not_eligible");
  assert.equal(calculateDiscount({ ...base, prefecture: "saga", totalPriceJPY: 30000, checkIn: "2026-12-25" }).eligibility.verdict, "eligible");
  assert.equal(calculateDiscount({ ...base, prefecture: "saga", totalPriceJPY: 30000, checkIn: "2026-12-26" }).eligibility.verdict, "not_eligible");
});

test("Kagoshima: not open before 2026-10-14, open from it, New Year excluded, direct to 02-28", () => {
  const early = calculateDiscount({ ...base, prefecture: "kagoshima", totalPriceJPY: 30000, checkIn: "2026-11-01", bookingDate: "2026-10-13" });
  assert.equal(early.eligibility.verdict, "not_yet_open");
  assert.equal(early.eligibility.nextOpening?.date, "2026-10-14");
  assert.equal(calculateDiscount({ ...base, prefecture: "kagoshima", totalPriceJPY: 30000, checkIn: "2026-11-01", bookingDate: "2026-10-14" }).eligibility.verdict, "eligible");
  const ny = calculateDiscount({ ...base, prefecture: "kagoshima", totalPriceJPY: 30000, checkIn: "2026-12-25", nights: 2, bookingDate: "2026-10-20" });
  assert.equal(ny.eligibility.verdict, "not_eligible");
  assert.ok(ny.warnings[0].includes("would not be discounted"));
  assert.equal(calculateDiscount({ ...base, prefecture: "kagoshima", totalPriceJPY: 30000, checkIn: "2027-01-04", bookingDate: "2026-10-20" }).eligibility.verdict, "eligible");
  assert.equal(calculateDiscount({ ...base, prefecture: "kagoshima", totalPriceJPY: 30000, checkIn: "2027-02-10", bookingDate: "2026-10-20" }).eligibility.verdict, "not_eligible");
  assert.equal(calculateDiscount({ ...base, prefecture: "kagoshima", channel: "direct", totalPriceJPY: 30000, checkIn: "2027-02-10", bookingDate: "2026-10-20" }).eligibility.verdict, "eligible");
  assert.equal(calculateDiscount({ ...base, prefecture: "kagoshima", totalPriceJPY: 30000, checkIn: "2026-10-13", bookingDate: "2026-10-14" }).eligibility.verdict, "not_eligible");
});

test("Oita channel-specific first nights; Saga direct opens 10-13", () => {
  assert.equal(calculateDiscount({ ...base, prefecture: "oita", channel: "direct", totalPriceJPY: 30000, checkIn: "2026-10-15", bookingDate: "2026-10-16" }).eligibility.verdict, "not_eligible");
  assert.equal(calculateDiscount({ ...base, prefecture: "oita", channel: "direct", totalPriceJPY: 30000, checkIn: "2026-10-20", bookingDate: "2026-10-13" }).eligibility.verdict, "not_yet_open");
  assert.equal(calculateDiscount({ ...base, prefecture: "saga", channel: "direct", totalPriceJPY: 30000, checkIn: "2026-10-20", bookingDate: "2026-10-12" }).eligibility.verdict, "not_yet_open");
  assert.equal(calculateDiscount({ ...base, prefecture: "saga", channel: "direct", totalPriceJPY: 30000, checkIn: "2026-10-20", bookingDate: "2026-10-13" }).eligibility.verdict, "eligible");
});

test("Nagasaki direct: phase 1 sold out, phase 2 opens 10-23 for check-ins from 10-23", () => {
  const before = calculateDiscount({ ...base, prefecture: "nagasaki", channel: "direct", totalPriceJPY: 30000, checkIn: "2026-10-18", bookingDate: "2026-10-13" });
  assert.equal(before.eligibility.verdict, "sold_out");
  const p2 = calculateDiscount({ ...base, prefecture: "nagasaki", channel: "direct", totalPriceJPY: 30000, checkIn: "2026-11-05", bookingDate: "2026-10-13" });
  assert.equal(p2.eligibility.verdict, "not_yet_open");
  assert.equal(p2.eligibility.nextOpening?.date, "2026-10-23");
  assert.equal(calculateDiscount({ ...base, prefecture: "nagasaki", channel: "direct", totalPriceJPY: 30000, checkIn: "2026-11-05", bookingDate: "2026-10-23" }).eligibility.verdict, "eligible");
  assert.equal(calculateDiscount({ ...base, prefecture: "nagasaki", channel: "ota", totalPriceJPY: 30000, checkIn: "2026-11-05", bookingDate: "2026-10-13" }).eligibility.verdict, "eligible");
});

test("day trip not eligible; no checkIn → unchecked with discount still computed", () => {
  const d = calculateDiscount({ ...base, nights: 0, totalPriceJPY: 10000 });
  assert.equal(d.discountJPY, 0);
  assert.equal(d.eligibility.verdict, "not_eligible");
  const u = calculateDiscount({ ...base, totalPriceJPY: 10000 });
  assert.equal(u.eligibility.verdict, "unchecked");
  assert.equal(u.discountJPY, 6000);
});

test("rejects bad input", () => {
  assert.throws(() => calculateDiscount({ ...base, totalPriceJPY: 0 }), RuleInputError);
  assert.throws(() => calculateDiscount({ ...base, totalPriceJPY: 1000, travelers: 0 }), RuleInputError);
  assert.throws(() => calculateDiscount({ ...base, totalPriceJPY: 1000, checkIn: "2026-02-30" }), RuleInputError);
  assert.throws(() => calculateDiscount({ ...base, totalPriceJPY: 1000, nights: 1.5 }), RuleInputError);
});

test("every phase is well formed", () => {
  for (const r of Object.values(PREFS))
    for (const phases of Object.values(r.channels))
      for (const ph of phases) {
        assert.ok(ph.stayFrom <= ph.stayTo, `${r.id} stay window`);
        assert.ok(ph.bookingFrom <= ph.stayTo, `${r.id} booking start`);
      }
});

test("upcoming openings from 2026-10-13 include Kagoshima 10-14, Oita direct 10-16, Nagasaki direct 10-23", () => {
  const u = upcomingOpenings("2026-10-13");
  const keys = u.map((o) => `${o.prefecture}:${o.channel}:${o.date}`);
  assert.ok(keys.includes("kagoshima:ota:2026-10-14"));
  assert.ok(keys.includes("oita:direct:2026-10-16"));
  assert.ok(keys.includes("nagasaki:direct:2026-10-23"));
  assert.ok(u.every((o, i) => i === 0 || u[i - 1].date <= o.date));
});
