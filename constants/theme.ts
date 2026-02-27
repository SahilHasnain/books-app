export const theme = {
  colors: {
    background: "#000000",
    surface: "#18181b",
    surfaceLight: "#27272a",
    primary: "#2563eb",
    primaryDark: "#1d4ed8",
    text: {
      primary: "#ffffff",
      secondary: "#a1a1aa",
      tertiary: "#71717a",
      muted: "#52525b",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 30,
  },
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
};

export type Theme = typeof theme;
