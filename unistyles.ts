import { StyleSheet } from "react-native-unistyles";

export const darkTheme = {
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
  fontSize: { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, "2xl": 28, "3xl": 34 },
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;

const appBreakpoints = { xs: 0, sm: 576, md: 768, lg: 992, xl: 1200 } as const;

type AppThemes = { dark: typeof darkTheme };
type AppBreakpoints = typeof appBreakpoints;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  themes: { dark: darkTheme },
  breakpoints: appBreakpoints,
  settings: { initialTheme: "dark" },
});
