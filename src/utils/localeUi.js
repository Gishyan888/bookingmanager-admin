/**
 * BCP 47 tag for `<html lang>` and native date/time widgets.
 * Maps app `en` → `en-GB` so Chromium-style browsers often prefer 24-hour pickers.
 */
export function pickerHtmlLang(language) {
  const base = (language || 'hy').split('-')[0]?.toLowerCase() || 'hy'
  if (base === 'en') return 'en-GB'
  if (base === 'ru') return 'ru'
  return 'hy'
}
