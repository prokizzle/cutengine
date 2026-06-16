const stubTheme = {
  colors: {
    positive: "#34c759",
    attention: "#ff9f0a",
    warning: "#ff3b30",
    info: "#007aff",
    anaerobic: "#af52de",
    surfacePrimary: "#1c1c1e",
    surfaceSecondary: "#2c2c2e",
    surfaceTertiary: "#3a3a3c",
    textPrimary: "#ffffff",
    textSecondary: "#ebebf5",
    textTertiary: "#8e8e93",
    backdrop: "#000000",
    transparent: "transparent",
  },
  gap: (v: number) => v * 8,
  radius: { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 },
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
