/**
 * Backend'in ürettiği "Token budget exhausted..." / truncation kalıplarını yakalar;
 * eşleşince UI, LLM Ayarları'na yönlendiren ipucu gösterir.
 */
export default function isTokenBudgetError(message) {
  if (!message) return false;
  return /token budget exhausted|truncated at max.?tokens/i.test(message);
}
