import test from "node:test";
import assert from "node:assert/strict";
import { countries, filterCountries } from "../src/lib/countries";

const codes = (query: string) => filterCountries(query).map(({ code }) => code);

// Assigned alpha-2 inventory; intentionally excludes reserved/user-assigned
// codes such as UK, EU, and XK, which must not become duplicate options.
const expectedCodes =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );

test("bundled options contain all 249 ISO alpha-2 assignments exactly once", () => {
  assert.equal(countries.length, 249);
  assert.equal(new Set(countries.map(({ code }) => code)).size, 249);
  assert.deepEqual(countries.map(({ code }) => code).sort(), expectedCodes);
  for (const country of countries) {
    assert.match(country.code, /^[A-Z]{2}$/);
    assert.ok(country.name.trim().length > 0);
    assert.deepEqual(codes(country.code.toLowerCase()), [country.code]);
  }
});

test("empty and whitespace searches return every option without exposing the array", () => {
  const result = filterCountries("");
  assert.deepEqual(result, countries);
  assert.notEqual(result, countries);
  assert.deepEqual(filterCountries("   \t\n"), countries);
  result.pop();
  assert.equal(countries.length, 249);
});

test("United States names and code variants resolve predictably", () => {
  for (const query of [
    "US",
    "us",
    " USA ",
    "U.S.",
    "U.S.A.",
    "United States",
    "United States of America",
  ]) {
    assert.ok(codes(query).includes("US"), query);
    if (query.trim().replaceAll(".", "").length <= 3)
      assert.deepEqual(codes(query), ["US"]);
  }
});

test("United Kingdom codes and familiar names find its single option", () => {
  for (const query of [
    "GB",
    "GBR",
    "UK",
    "U.K.",
    "Britain",
    "Great Britain",
    "United Kingdom",
  ]) {
    assert.deepEqual(codes(query), ["GB"], query);
  }
});

test("UAE and other alpha-3 codes resolve to the assigned country", () => {
  for (const [query, code] of [
    ["UAE", "AE"],
    ["U.A.E.", "AE"],
    ["ARE", "AE"],
    ["CAN", "CA"],
    ["IND", "IN"],
    ["TWN", "TW"],
  ]) {
    assert.deepEqual(codes(query), [code], query);
  }
});

test("search ignores case, accents, and straight or curly apostrophes", () => {
  for (const [query, code] of [
    ["COTE D'IVOIRE", "CI"],
    ["côte d’ivoire", "CI"],
    ["cote divoire", "CI"],
    ["aland", "AX"],
    ["CURACAO", "CW"],
    ["reunion", "RE"],
    ["sao tome", "ST"],
    ["tu\u0308rkiye", "TR"],
  ]) {
    assert.ok(codes(query).includes(code), query);
  }
});

test("common alternate names remain searchable", () => {
  for (const [query, code] of [
    ["Ivory Coast", "CI"],
    ["Turkey", "TR"],
    ["Czech Republic", "CZ"],
    ["Cape Verde", "CV"],
    ["Swaziland", "SZ"],
    ["Burma", "MM"],
    ["East Timor", "TL"],
    ["Naoero", "NR"],
    ["Macau", "MO"],
  ]) {
    assert.ok(codes(query).includes(code), query);
  }
});

test("partial multiword searches find names in either word order", () => {
  assert.ok(codes("arab emir").includes("AE"));
  assert.ok(codes("emir arab").includes("AE"));
  assert.deepEqual(codes("congo").sort(), ["CD", "CG"]);
  assert.ok(codes("united").includes("GB"));
  assert.ok(codes("united").includes("US"));
  assert.equal(codes("united")[0], "AE");
  assert.equal(codes("united").at(-1), "TZ");
});

test("unknown or punctuation-only queries have no results", () => {
  assert.deepEqual(codes("not-a-real-country"), []);
  assert.deepEqual(codes("!!!"), []);
});

test("searching every display name keeps that country discoverable", () => {
  for (const { code, name } of countries) {
    assert.ok(codes(name).includes(code), name);
  }
});
