export const CATEGORICAL = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

export const SEQUENTIAL_BLUE = "#2a78d6";

export function statusForEficiencia(value: number): keyof typeof STATUS {
  if (value >= 85) return "good";
  if (value >= 65) return "warning";
  return "critical";
}

export function statusForCumplimiento(value: number): keyof typeof STATUS {
  if (value >= 100) return "good";
  if (value >= 80) return "warning";
  return "critical";
}
