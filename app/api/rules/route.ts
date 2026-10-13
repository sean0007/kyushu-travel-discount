import { preflight, staticJson } from "@/lib/agent-api";
import { PUBLIC_URL } from "@/lib/api";
import { RULES, todayJst, upcomingOpenings } from "@/lib/discount";

export const dynamic = "force-dynamic";

export function GET() {
  const today = todayJst();
  return staticJson({ ...RULES, today, upcomingSalesOpenings: upcomingOpenings(today), docs: `${PUBLIC_URL}/openapi.json`, calculator: `${PUBLIC_URL}/api/discount` });
}
export const OPTIONS = preflight;
