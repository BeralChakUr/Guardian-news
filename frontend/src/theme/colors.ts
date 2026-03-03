export const darkTheme = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#21262D',
  primary: '#58A6FF',
  secondary: '#8B949E',
  accent: '#7EE787',
  warning: '#F0883E',
  danger: '#F85149',
  success: '#3FB950',
  text: '#F0F6FC',
  textSecondary: '#8B949E',
  textMuted: '#6E7681',
  border: '#30363D',
  cardBorder: '#21262D',
  
  // Severity colors
  severityCritical: '#F85149',
  severityHigh: '#F0883E',
  severityMedium: '#D29922',
  severityLow: '#3FB950',
  
  // Level colors
  levelBeginner: '#7EE787',
  levelIntermediate: '#F0883E',
  levelAdvanced: '#F85149',
};

export const lightTheme = {
  background: '#FFFFFF',
  surface: '#F6F8FA',
  surfaceElevated: '#FFFFFF',
  primary: '#0969DA',
  secondary: '#57606A',
  accent: '#1A7F37',
  warning: '#BF8700',
  danger: '#CF222E',
  success: '#1A7F37',
  text: '#24292F',
  textSecondary: '#57606A',
  textMuted: '#8C959F',
  border: '#D0D7DE',
  cardBorder: '#D0D7DE',
  
  // Severity colors
  severityCritical: '#CF222E',
  severityHigh: '#BF8700',
  severityMedium: '#9A6700',
  severityLow: '#1A7F37',
  
  // Level colors
  levelBeginner: '#1A7F37',
  levelIntermediate: '#BF8700',
  levelAdvanced: '#CF222E',
};

export type Theme = typeof darkTheme;

export const getTheme = (isDark: boolean): Theme => isDark ? darkTheme : lightTheme;
