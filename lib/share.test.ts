import assert from "node:assert/strict";
import test from "node:test";
import { EXAMPLE_SHARED, isExample, parseShared, resultPath, sharedQuery } from "./share";

test("example shared round-trips", () => {
  const back = parseShared(new URLSearchParams(sharedQuery(EXAMPLE_SHARED)));
  assert.deepEqual(back, EXAMPLE_SHARED);
  assert.ok(back && isExample(back));
  assert.equal(resultPath(EXAMPLE_SHARED), "/r?p=kumamoto&k=lodging&n=2&y=60000&t=2");
});

test("parseShared accepts API-style names, channel and date", () => {
  const s = parseShared({ prefecture: "kagoshima", product: "package", nights: "3", totalPriceJPY: "150000", travelers: "2", channel: "direct", checkIn: "2027-01-10" });
  assert.deepEqual(s, { prefecture: "kagoshima", product: "package", nights: 3, totalPriceJPY: 150000, travelers: 2, channel: "direct", checkIn: "2027-01-10" });
  assert.deepEqual(parseShared(new URLSearchParams(sharedQuery(s!))), s);
});

test("parseShared rejects junk", () => {
  assert.equal(parseShared({ p: "okinawa", y: "1000" }), null);
  assert.equal(parseShared({ p: "saga", y: "abc" }), null);
  assert.equal(parseShared({ p: "saga", y: "1000", n: "0" }), null);
  assert.equal(parseShared({}), null);
  assert.equal(parseShared({ p: "saga", y: "1000", d: "2020-01-01" })?.checkIn, null);
});
