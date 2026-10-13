import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calculator } from "@/components/calculator";
import { PREFS, PRODUCT_LABEL, calculateDiscount } from "@/lib/discount";
import { EXAMPLE_SHARED, PUBLIC_URL, isExample, ogPath, parseShared, resultPath, yen } from "@/lib/share";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const shared = parseShared(await searchParams);
  if (!shared) return { title: "Your result", robots: { index: false, follow: true } };
  const r = calculateDiscount(shared);
  const pref = PREFS[shared.prefecture];
  const title = `−${yen(r.discountJPY)} in ${pref.en}: ${yen(r.totalPriceJPY)} → ${yen(r.payJPY)} (九州ふっこう応援割)`;
  const description = `${PRODUCT_LABEL[shared.product].en}, ${shared.nights} night${shared.nights === 1 ? "" : "s"}, ${shared.travelers} traveler${shared.travelers === 1 ? "" : "s"}: ${pref.ratePct}% off, cap ${yen(r.capPerPersonJPY)} per person${r.capReached ? " (reached)" : ""}. Rules as of ${r.rulesAsOf}. Estimate only; checkout price is final.`;
  const url = `${PUBLIC_URL}${resultPath(shared)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: isExample(shared) ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title: `Kyushu Travel Discount · ${title}`, description, type: "website", url, images: [{ url: ogPath(shared), width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title: `Kyushu Travel Discount · ${title}`, description, images: [ogPath(shared)] },
  };
}

export default async function ResultPage({ searchParams }: { searchParams: SP }) {
  const shared = parseShared(await searchParams);
  if (!shared) redirect("/");
  const r = calculateDiscount(shared);
  const pref = PREFS[shared.prefecture];
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Shared result · Kyushu Travel Discount</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          <span className="text-teal-200">−{yen(r.discountJPY)}</span> in {pref.en}: pay {yen(r.payJPY)}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {PRODUCT_LABEL[shared.product].en} · {shared.nights} night{shared.nights === 1 ? "" : "s"} · {shared.travelers} traveler{shared.travelers === 1 ? "" : "s"} · {pref.ratePct}% off, cap {yen(r.capPerPersonJPY)} per person
          {r.capReached ? " (reached)" : ""} · rules as of {r.rulesAsOf}
        </p>
        <p className="mt-4 text-sm">
          <Link href="/" className="text-muted underline underline-offset-2 hover:text-foreground">
            ← Start over
          </Link>
          {isExample(shared) ? null : (
            <>
              {" · "}
              <Link href={resultPath(EXAMPLE_SHARED)} className="text-muted underline underline-offset-2 hover:text-foreground">
                Open the example
              </Link>
            </>
          )}
        </p>
      </section>
      <section className="mt-8">
        <Calculator initial={shared} />
      </section>
      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted">
        {DISCLAIMER_SHORT} {HONESTY}
      </p>
    </div>
  );
}
