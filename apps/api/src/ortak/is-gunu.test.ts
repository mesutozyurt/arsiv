import assert from "node:assert/strict";
import { test } from "node:test";
import { isGunuEkle, isGunuMu } from "./is-gunu.ts";

test("cumartesi iş günü değil", () => {
  assert.equal(isGunuMu(new Date("2026-01-03T12:00:00.000Z")), false);
});

test("cuma iş günü", () => {
  assert.equal(isGunuMu(new Date("2026-01-02T12:00:00.000Z")), true);
});

test("1 Ocak tatil", () => {
  assert.equal(isGunuMu(new Date("2026-01-01T12:00:00.000Z")), false);
});

test("15 iş günü hafta sonunu atlar", () => {
  const son = isGunuEkle(new Date("2026-01-02T12:00:00.000Z"), 15);
  assert.equal(isGunuMu(son), true);
  assert.ok(son.getTime() > Date.parse("2026-01-20T00:00:00.000Z"));
});
