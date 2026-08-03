import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    mode: "light" | "dark";
    colors: {
      background: string;
      surface: string;
      surfaceHover: string;
      border: string;
      text: {
        primary: string;
        secondary: string;
        muted: string;
      };
      accent: string;
      accentHover: string;
      success: string;
      successBg: string;
      danger: string;
      dangerBg: string;
      warning: string;
      warningBg: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  }
}
