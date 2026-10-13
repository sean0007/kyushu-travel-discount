import assert from "node:assert/strict";
import test from "node:test";
import { apiHandler, openapiDoc, preflight } from "./agent-api";
import { API_DISCLAIMER, API_INFO, ENDPOINTS, EXAMPLE_GET, PUBLIC_URL } from "./api";

const e = ENDPOINTS.discount;
const handler = apiHandler(e.compute, { disclaimer: API_DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json`, example: `${PUBLIC_URL}${e.example}` });

test(`GET ${EXAMPLE_GET} → ¥36,000 off, eligible, CORS, disclaimer`, async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${EXAMPLE_GET}`));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
  const b = await res.json();
  assert.equal(b.disclaimer, API_DISCLAIMER);
  assert.equal(b.discountJPY, 36000);
  assert.equal(b.payJPY, 24000);
  assert.equal(b.eligibility.verdict, "eligible");
  assert.ok(b.sources.length);
});

test("POST JSON body matches GET", async () => {
  const url = new URL(`${PUBLIC_URL}${EXAMPLE_GET}`);
  const body = Object.fromEntries(url.searchParams);
  const post = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
  const get = await handler(new Request(url));
  assert.equal(post.status, 200);
  assert.deepEqual(await post.json(), await get.json());
});

test("POST with numbers, Japanese prefecture name and price alias", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefecture: "鹿児島県", product: "package", nights: 2, price: 150000, travelers: 2, checkIn: "2026-11-03", bookingDate: "2026-10-14" }) }));
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.prefecture.id, "kagoshima");
  assert.equal(b.discountJPY, 60000);
  assert.equal(b.eligibility.verdict, "eligible");
});

test("missing prefecture or price → 400 with example", async () => {
  const r1 = await handler(new Request(`${PUBLIC_URL}${e.path}?totalPriceJPY=10000`));
  assert.equal(r1.status, 400);
  const b = await r1.json();
  assert.ok(b.error && b.example);
  assert.equal(b.disclaimer, API_DISCLAIMER);
  const r2 = await handler(new Request(`${PUBLIC_URL}${e.path}?prefecture=saga`));
  assert.equal(r2.status, 400);
});

test("bad prefecture / product / date → 400", async () => {
  assert.equal((await handler(new Request(`${PUBLIC_URL}${e.path}?prefecture=okinawa&totalPriceJPY=1000`))).status, 400);
  assert.equal((await handler(new Request(`${PUBLIC_URL}${e.path}?prefecture=saga&totalPriceJPY=1000&product=cruise`))).status, 400);
  assert.equal((await handler(new Request(`${PUBLIC_URL}${e.path}?prefecture=saga&totalPriceJPY=1000&checkIn=11/20`))).status, 400);
});

test("OPTIONS preflight is CORS open", () => {
  const res = preflight();
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("OpenAPI spec lists /api/discount with GET and POST", () => {
  const spec = openapiDoc(API_INFO, PUBLIC_URL, [e]) as { paths: Record<string, { get: unknown; post: unknown }> };
  assert.ok(spec.paths["/api/discount"]?.get);
  assert.ok(spec.paths["/api/discount"]?.post);
});
