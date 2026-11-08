import orbInspiredTheme from "../../../assets/themes/orb-inspired.json" with { type: "json" };
import {
  BUILT_IN_THEMES as SHARED_BUILT_IN_THEMES,
  RESERVED_THEME_IDS as SHARED_RESERVED_THEME_IDS,
  T3_CODE_LIGHT_THEME_COLORS,
  T3_CODE_DARK_THEME_COLORS,
  type ThemeDefinition,
} from "@t3tools/shared/themePalettes";

const liquidGlassTheme = {
  id: "liquid-glass",
  label: "Liquid Glass",
  appearance: "light",
  colors: {
    ...T3_CODE_LIGHT_THEME_COLORS,
    ...orbInspiredTheme.colors,
    searchMatchBackground: T3_CODE_LIGHT_THEME_COLORS.searchMatchBackground,
    searchMatchForeground: T3_CODE_LIGHT_THEME_COLORS.searchMatchForeground,
    searchMatchActiveBackground: T3_CODE_LIGHT_THEME_COLORS.searchMatchActiveBackground,
    searchMatchActiveForeground: T3_CODE_LIGHT_THEME_COLORS.searchMatchActiveForeground,
  },
  variants: {
    dark: {
      ...T3_CODE_DARK_THEME_COLORS,
      ...orbInspiredTheme.variants.dark,
      searchMatchBackground: T3_CODE_DARK_THEME_COLORS.searchMatchBackground,
      searchMatchForeground: T3_CODE_DARK_THEME_COLORS.searchMatchForeground,
      searchMatchActiveBackground: T3_CODE_DARK_THEME_COLORS.searchMatchActiveBackground,
      searchMatchActiveForeground: T3_CODE_DARK_THEME_COLORS.searchMatchActiveForeground,
    },
  },
  sidebarArtwork: false,
} satisfies ThemeDefinition;

export const BUILT_IN_THEMES: ReadonlyArray<ThemeDefinition> = [
  ...SHARED_BUILT_IN_THEMES,
  liquidGlassTheme,
];

export const RESERVED_THEME_IDS: ReadonlySet<string> = new Set([
  ...SHARED_RESERVED_THEME_IDS,
  ...BUILT_IN_THEMES.map((theme) => theme.id),
]);
