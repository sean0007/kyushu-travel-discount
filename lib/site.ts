export const SITE_NAME = "Kyushu Travel Discount Calculator";

export const SITE_TAGLINE =
  "Kyushu Fukko Ouenwari (九州ふっこう応援割) 2026: 50% off Kyushu stays (60% in Kumamoto and Kagoshima), capped at ¥20,000–¥35,000 per person. See your discount, what you pay, whether your dates and booking channel qualify, and when sales open.";

export const DISCLAIMER_SHORT = "Educational estimate, not an official calculator. Budgets can run out without notice; the price at checkout is final.";

export const HONESTY =
  "Rules as of 2026-10-13 from the Japan Tourism Agency (観光庁) and the seven prefecture campaign sites. Not affiliated with any government body, travel agency or booking site.";

export const SIBLING_TOOLS = [
  { href: "https://japan-trip-brain.vercel.app", label: "Japan Trip Brain" },
  { href: "https://hotel-ota-calculator.vercel.app", label: "Hotel OTA Calculator" },
  { href: "https://japan-tax-free-refund.vercel.app", label: "Japan Tax-Free Refund" },
  { href: "https://japan-luggage.vercel.app", label: "Japan Luggage Check" },
  { href: "https://japan-visa-fee.vercel.app", label: "Japan Visa Fee Calculator" },
  { href: "https://japan-customs-allowance.vercel.app", label: "Japan Customs Allowance" },
  { href: "https://japan-tb-screening.vercel.app", label: "Japan TB Screening (JPETS)" },
  { href: "https://japan-dual-pricing.vercel.app", label: "Japan Dual Pricing" },
  { href: "https://pitch-roast.vercel.app", label: "Pitch Roast" },
  { href: "https://saas-bill-cutter.vercel.app", label: "SaaS Bill Cutter" },
  { href: "https://free-agent-tools.vercel.app", label: "Free Agent Tools MCP" },
] as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;
  return "https://kyushu-travel-discount.vercel.app";
}
