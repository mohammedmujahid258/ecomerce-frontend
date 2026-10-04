export function getProductCardColor() {
  if (typeof window !== "undefined") {
    const cardBg = getComputedStyle(document.documentElement).getPropertyValue("--theme-card-bg");
    if (cardBg && cardBg.trim()) return cardBg.trim();
  }
  return "#fff0a8";
}
