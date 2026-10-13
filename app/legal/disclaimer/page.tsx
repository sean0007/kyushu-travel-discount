import type { Metadata } from "next";
import { SOURCES } from "@/lib/discount";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer", description: DISCLAIMER_SHORT };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Read this</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Disclaimer</h1>
      <p className="mt-4 text-lg text-foreground">{DISCLAIMER_SHORT}</p>
      <p className="mt-2 text-muted">{HONESTY}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">What this is</h2>
          <p className="mt-2">
            A free educational calculator. A dated copy of the Kyushu Fukko Ouenwari 2026 (九州ふっこう応援割) rules published by the Japan Tourism Agency and the seven Kyushu prefectures returns the discount, the price to pay and the per-person cap for a booking, and checks whether the nights and booking date fall inside each prefecture&apos;s published sales and stay windows for the chosen channel.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What it is not</h2>
          <p className="mt-2">
            It is not an official calculator and it cannot see live budgets. Each prefecture&apos;s budget, and each seller&apos;s own allocation, can run out without notice; sellers decide which plans carry the discount and how they round it. The discounted price at checkout is what you pay. Rules can change; check the prefecture campaign site or call its call center (Japanese) before you book. Not affiliated with the Japan Tourism Agency, any prefecture, travel agency or booking site.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {SOURCES.map((s) => (
              <li key={s}>
                <a href={s} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Your data</h2>
          <p className="mt-2">Choices you make stay in your browser (or in a share link you create). No login, no booking details stored, no database.</p>
        </section>
      </div>
    </div>
  );
}
