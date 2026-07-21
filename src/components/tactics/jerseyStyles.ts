export type JerseyStyleKey =
  | "blue"
  | "red"
  | "white"
  | "black"
  | "blueWhiteStripes"
  | "redBlackStripes"
  | "yellowBlackStripes";

type JerseyStyle = {
  background: string;
  collarColor: string;
  numberColor: string;
  numberBackground: string;
};

export const jerseyStyleOptions: Array<{
  key: JerseyStyleKey;
  label: string;
}> = [
  { key: "blue", label: "Blau" },
  { key: "red", label: "Rot" },
  { key: "white", label: "Weiß" },
  { key: "black", label: "Schwarz" },
  {
    key: "blueWhiteStripes",
    label: "Blau-Weiß gestreift",
  },
  {
    key: "redBlackStripes",
    label: "Rot-Schwarz gestreift",
  },
  {
    key: "yellowBlackStripes",
    label: "Gelb-Schwarz gestreift",
  },
];

export const jerseyStyles: Record<
  JerseyStyleKey,
  JerseyStyle
> = {
  blue: {
    background:
      "linear-gradient(145deg, #38bdf8 0%, #2583ec 48%, #1d4ed8 100%)",
    collarColor: "rgba(15,23,42,0.72)",
    numberColor: "#ffffff",
    numberBackground: "rgba(2,6,23,0.18)",
  },
  red: {
    background:
      "linear-gradient(145deg, #fb7185 0%, #ef4444 48%, #b91c1c 100%)",
    collarColor: "rgba(69,10,10,0.72)",
    numberColor: "#ffffff",
    numberBackground: "rgba(69,10,10,0.22)",
  },
  white: {
    background:
      "linear-gradient(145deg, #ffffff 0%, #f1f5f9 55%, #cbd5e1 100%)",
    collarColor: "rgba(15,23,42,0.72)",
    numberColor: "#0f172a",
    numberBackground: "rgba(255,255,255,0.6)",
  },
  black: {
    background:
      "linear-gradient(145deg, #475569 0%, #1e293b 50%, #020617 100%)",
    collarColor: "rgba(148,163,184,0.75)",
    numberColor: "#ffffff",
    numberBackground: "rgba(255,255,255,0.1)",
  },
  blueWhiteStripes: {
    background:
      "repeating-linear-gradient(90deg, #f8fafc 0 16%, #2563eb 16% 32%)",
    collarColor: "rgba(15,23,42,0.78)",
    numberColor: "#ffffff",
    numberBackground: "rgba(2,6,23,0.74)",
  },
  redBlackStripes: {
    background:
      "repeating-linear-gradient(90deg, #dc2626 0 16%, #111827 16% 32%)",
    collarColor: "rgba(255,255,255,0.72)",
    numberColor: "#ffffff",
    numberBackground: "rgba(2,6,23,0.72)",
  },
  yellowBlackStripes: {
    background:
      "repeating-linear-gradient(90deg, #facc15 0 16%, #111827 16% 32%)",
    collarColor: "rgba(255,255,255,0.76)",
    numberColor: "#ffffff",
    numberBackground: "rgba(2,6,23,0.76)",
  },
};
