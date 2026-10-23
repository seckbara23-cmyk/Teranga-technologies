// French typography: non-breaking space before ? ! : ; » and after «, applied to authored
// strings at build time so content files can be written with ordinary spaces.
// Only a space next to punctuation is changed, so identifiers and URLs are never affected.

const NBSP = String.fromCharCode(0xa0);

export function frenchText(s) {
  return s
    .replace(/ ([?!:;»])/g, NBSP + '$1')
    .replace(/« /g, '«' + NBSP)
    .replace(/(\d) à (\d)/g, '$1' + NBSP + 'à' + NBSP + '$2')
    .replace(/(\d) (%|€|h\b|cm\b|mois\b|semaines\b|minutes\b)/g, '$1' + NBSP + '$2');
}

export function frenchTypography(value) {
  if (typeof value === 'string') return frenchText(value);
  if (Array.isArray(value)) return value.map(frenchTypography);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = frenchTypography(v);
    return out;
  }
  return value;
}
