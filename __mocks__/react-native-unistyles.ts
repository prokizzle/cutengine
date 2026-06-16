const stubTheme = {
  colors: {
    positive: "#34c759",
    attention: "#ff9f0a",
    warning: "#ff453a",
    info: "#0a84ff",
    anaerobic: "#bf5af2",
    surfacePrimary: "#0a0a0f",
    surfaceRaised: "#101019",
    surfaceSecondary: "#2c2c2e",
    surfaceTertiary: "#3a3a3c",
    elev: "rgba(255,255,255,0.05)",
    elev2: "rgba(255,255,255,0.08)",
    elev3: "rgba(255,255,255,0.12)",
    divider: "rgba(255,255,255,0.08)",
    textPrimary: "#ffffff",
    textSecondary: "rgba(255,255,255,0.70)",
    textTertiary: "rgba(255,255,255,0.55)",
    backdrop: "#000000",
    transparent: "transparent",
  },
  gap: (v: number) => v * 8,
  radius: { sm: 6, md: 10, lg: 14, xl: 18, "2xl": 22, pill: 999 },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    "2xl": 28,
    "3xl": 34,
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
};

type StyleFactory = ((theme: typeof stubTheme) => Record<string, unknown>) | Record<string, unknown>;

export const StyleSheet = {
  create: (styles: StyleFactory) =>
    typeof styles === "function" ? styles(stubTheme) : styles,
  configure: () => {},
};

export const useStyles = () => ({ styles: {}, theme: stubTheme });
export const UnistylesRuntime = {};
