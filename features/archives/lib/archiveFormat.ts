import { splitDateKey } from "@/core/lib/format";

export const getDateParts = (dateKey: string) => {
  const parts = splitDateKey(dateKey);
  if (!parts) return { year: "----", monthDay: "----" };
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return { year: String(parts.year), monthDay: `${month}${day}` };
};

export const formatLocationText = (
  lat?: number | null,
  lng?: number | null,
  accuracy?: number | null,
) => {
  if (lat == null || lng == null) return "null";
  return `${lat.toFixed(6)}, ${lng.toFixed(6)} (±${accuracy == null ? "?" : Math.floor(accuracy)} m)`;
};
