export const lightTheme = {
  mode: "light" as const,
  colors: {
    background: "#ffffff",
    surface: "#f8f9fa",
    surfaceHover: "#f0f1f3",
    border: "#e2e5e9",
    text: {
      primary: "#1a1d23",
      secondary: "#5f6368",
      muted: "#9aa0a6",
    },
    accent: "#4f46e5",
    accentHover: "#4338ca",
    success: "#10b981",
    successBg: "#d1fae5",
    danger: "#ef4444",
    dangerBg: "#fee2e2",
    warning: "#f59e0b",
    warningBg: "#fef3c7",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  borderRadius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },
};

export const darkTheme = {
  mode: "dark" as const,
  colors: {
    background: "#0f1117",
    surface: "#1a1d27",
    surfaceHover: "#252833",
    border: "#2d3139",
    text: {
      primary: "#f1f3f5",
      secondary: "#9ca3af",
      muted: "#6b7280",
    },
    accent: "#818cf8",
    accentHover: "#6366f1",
    success: "#34d399",
    successBg: "rgba(16, 185, 129, 0.15)",
    danger: "#f87171",
    dangerBg: "rgba(239, 68, 68, 0.15)",
    warning: "#fbbf24",
    warningBg: "rgba(245, 158, 11, 0.15)",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)",
  },
  borderRadius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },
};

export type Theme = typeof lightTheme | typeof darkTheme;
