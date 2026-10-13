# Kyushu Travel Discount Calculator (九州ふっこう応援割 2026)

Free, unofficial calculator for Japan's **Kyushu Fukko Ouenwari** travel discount (after the July 2026 Kumamoto earthquake): 50% off Kyushu stays, 60% in Kumamoto and Kagoshima, capped per person per trip.

- Live: https://kyushu-travel-discount.vercel.app
- API: `GET/POST /api/discount`, `GET /api/rules`
- Agent docs: `/llms.txt`, `/openapi.json`, `/.well-known/ai-plugin.json`
- MCP tool: `kyushu_travel_discount_check` on https://free-agent-tools.vercel.app/mcp

**Educational estimate, not an official calculator.** Budgets run out without notice; the checkout price is final.

## Example

```
GET https://kyushu-travel-discount.vercel.app/api/discount?prefecture=kumamoto&product=lodging&nights=2&totalPriceJPY=60000&travelers=2&checkIn=2026-11-20
```
→ `discountJPY: 36000`, `payJPY: 24000`, `eligibility.verdict: "eligible"`.

## Rules implemented (checked 2026-10-13 JST)

- Rate 50% (60% Kumamoto, Kagoshima). Cap per person per trip: ¥20,000 (accommodation only / 1-night package), ¥30,000 (package 2+ nights), ¥35,000 (tour, 2+ prefectures).
- Per prefecture and channel (booking site / agency / direct): sales start, eligible nights, sold-out phases, Kagoshima New Year exclusion (nights 2026-12-26 → 2027-01-03). See `lib/discount.ts`.
- Bookings before sales start are not eligible; day trips not eligible; ¥100 round-down variant reported.

Sources: https://www.mlit.go.jp/kankocho/page13_00002.html · https://fightkyushu.welcomekyushu.jp/ · the seven prefecture campaign sites (listed in `/api/rules`). Snapshots: `money-research/kyushu-ouen-sources/` on the build box.

## Dev

```
npm ci
npm test
npm run build
```

MIT license.
