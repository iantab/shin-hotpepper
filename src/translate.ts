const cache = new Map<string, string>();

export async function translateToEnglish(text: string): Promise<string> {
  if (!text) return text;
  if (cache.has(text)) return cache.get(text)!;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ja|en`,
    );
    const data = await res.json();
    const translated: string = data.responseData.translatedText ?? text;
    cache.set(text, translated);
    return translated;
  } catch {
    return text;
  }
}

export async function translateAll(
  texts: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(texts.filter(Boolean))];
  const results = await Promise.all(unique.map((t) => translateToEnglish(t)));
  return new Map(unique.map((t, i) => [t, results[i]]));
}
