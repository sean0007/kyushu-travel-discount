import { ImageResponse } from "next/og";
import { PREFS, PRODUCT_LABEL, calculateDiscount } from "@/lib/discount";
import { EXAMPLE_SHARED, parseShared, yen } from "@/lib/share";

export async function GET(req: Request) {
  const shared = parseShared(new URL(req.url).searchParams) ?? EXAMPLE_SHARED;
  const r = calculateDiscount(shared);
  const pref = PREFS[shared.prefecture];
  const stats = [
    { label: "you pay", value: yen(r.payJPY) },
    { label: `instead of`, value: yen(r.totalPriceJPY) },
    { label: r.capReached ? "cap per person (reached)" : "cap per person", value: yen(r.capPerPersonJPY) },
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#07080c", color: "#f3efe4", padding: "56px 64px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.24em", textTransform: "uppercase", color: "#f0b429" }}>Kyushu Travel Discount</div>
          <div style={{ display: "flex", fontSize: 22, color: "#9b9588" }}>Fukko Ouenwari 2026</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 32, color: "#c9c3b6" }}>
            {pref.en} · {pref.ratePct}% off · {PRODUCT_LABEL[shared.product].en} · {shared.nights} night{shared.nights === 1 ? "" : "s"} · {shared.travelers} pax
          </div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 6 }}>
            <span style={{ fontSize: 120, fontWeight: 800, letterSpacing: "-0.04em", color: "#99f6e4", lineHeight: 1 }}>−{yen(r.discountJPY)}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", flex: 1, border: "2px solid #23252c", borderRadius: 24, padding: "14px 20px", background: "#101218" }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: "#f3efe4" }}>{s.value}</span>
              <span style={{ fontSize: 20, color: "#9b9588" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#6f6a60" }}>
          <span>kyushu-travel-discount.vercel.app · free, no login</span>
          <span>Unofficial estimate. Checkout price is final.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } },
  );
}
