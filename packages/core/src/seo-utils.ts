export function getWordCount(content: string | undefined | null): number {
  if (!content) return 0;
  let text = content.replace(/<[^>]*>/g, " ");
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  text = text.replace(/[#*_~`>|\\-]/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text.length === 0 ? 0 : text.split(" ").length;
}

export function parseKeywords(keywords: string | undefined | null): string[] {
  if (!keywords) return [];
  return keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

const PROPER_NOUNS: [RegExp, string][] = [
  // US cities
  [/\bnew york\b/gi, "New York"],
  [/\blos angeles\b/gi, "Los Angeles"],
  [/\bsan francisco\b/gi, "San Francisco"],
  [/\bsan diego\b/gi, "San Diego"],
  [/\bsan jose\b/gi, "San Jose"],
  [/\blas vegas\b/gi, "Las Vegas"],
  [/\bsalt lake city\b/gi, "Salt Lake City"],
  [/\bel paso\b/gi, "El Paso"],
  [/\bfort worth\b/gi, "Fort Worth"],
  // International cities
  [/\bsão paulo\b/gi, "São Paulo"],
  [/\bhong kong\b/gi, "Hong Kong"],
  [/\btel aviv\b/gi, "Tel Aviv"],
  [/\bbuenos aires\b/gi, "Buenos Aires"],
  [/\bkuala lumpur\b/gi, "Kuala Lumpur"],
  [/\brio de janeiro\b/gi, "Rio de Janeiro"],
  // Finance terms / orgs
  [/\bwall street\b/gi, "Wall Street"],
  [/\bsilicon valley\b/gi, "Silicon Valley"],
];

const DIACRITIC_MAP: Record<string, string> = {
  // German
  'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
  // French
  'à': 'a', 'â': 'a', 'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'î': 'i', 'ï': 'i', 'ô': 'o', 'ù': 'u', 'û': 'u', 'ç': 'c', 'œ': 'oe',
  // Scandinavian
  'å': 'a', 'ø': 'o', 'æ': 'ae',
  // Spanish / Portuguese
  'á': 'a', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n', 'ã': 'a', 'õ': 'o',
  // Polish / Czech / Slovak
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ś': 's', 'ź': 'z', 'ż': 'z',
  'č': 'c', 'ď': 'd', 'ě': 'e', 'ň': 'n', 'ř': 'r', 'š': 's', 'ť': 't', 'ů': 'u', 'ý': 'y', 'ž': 'z',
  // Turkish
  'ğ': 'g', 'ı': 'i', 'ş': 's',
  // Romanian
  'ă': 'a', 'ț': 't', 'ș': 's',
};

function transliterate(text: string): string {
  return text.replace(/./g, (ch) => DIACRITIC_MAP[ch] || ch);
}

export function textToHeadingId(text: string): string {
  return transliterate(
    text
      .toLowerCase()
      .replace(/<[^>]*>/g, ""),
  )
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function fixProperNouns(text: string): string {
  if (!text) return text;
  let result = text;
  for (const [pattern, replacement] of PROPER_NOUNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
