export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatMoney(
  amount: string | number | null | undefined,
  currency: string | null | undefined
) {
  if (amount === null || amount === undefined || amount === "") return "—";

  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(numeric)) return String(amount);

  if (!currency) return String(numeric);

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(numeric);
  } catch {
    return `${numeric} ${currency}`;
  }
}
