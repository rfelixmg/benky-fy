/**
 * Basic romaji to hiragana mapping
 */
export const ROMAJI_TO_HIRAGANA: Record<string, string> = {
  // Vowels
  a: "あ", i: "い", u: "う", e: "え", o: "お",

  // K series
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  kya: "きゃ", kyu: "きゅ", kyo: "きょ",

  // S series
  sa: "さ", shi: "し", su: "す", se: "せ", so: "そ",
  sha: "しゃ", shu: "しゅ", sho: "しょ",

  // T series
  ta: "た", chi: "ち", tsu: "つ", te: "て", to: "と",
  cha: "ちゃ", chu: "ちゅ", cho: "ちょ",

  // N series
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ",

  // H series
  ha: "は", hi: "ひ", fu: "ふ", he: "へ", ho: "ほ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",

  // M series
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  mya: "みゃ", myu: "みゅ", myo: "みょ",

  // Y series
  ya: "や", yu: "ゆ", yo: "よ",

  // R series
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",

  // W series
  wa: "わ", wo: "を", nn: "ん",

  // G series
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",

  // Z series
  za: "ざ", ji: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  ja: "じゃ", ju: "じゅ", jo: "じょ",
  jya: "じゃ", jyu: "じゅ", jyo: "じょ",

  // D series
  da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",

  // B series
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  bya: "びゃ", byu: "びゅ", byo: "びょ",

  // P series
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ",
};
