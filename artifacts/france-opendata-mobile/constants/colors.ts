/**
 * Semantic design tokens — synced from the sibling france-opendata web artifact.
 * Primary: French Republic Blue (#003189), Destructive: French Red (#ef4135).
 */

const colors = {
  light: {
    text: '#0f172a',
    tint: '#003189',
    background: '#ffffff',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    primary: '#003189',          // French Republic Blue
    primaryForeground: '#f8fafc',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#f1f5f9',
    accentForeground: '#0f172a',
    destructive: '#ef4135',      // French Republic Red
    destructiveForeground: '#f8fafc',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#003189',
  },
  dark: {
    text: '#f8fafc',
    tint: '#3b82f6',
    background: '#0f172a',
    foreground: '#f8fafc',
    card: '#1e293b',
    cardForeground: '#f8fafc',
    primary: '#3b82f6',          // Brighter blue for dark mode readability
    primaryForeground: '#0f172a',
    secondary: '#1e293b',
    secondaryForeground: '#f8fafc',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    accent: '#1e293b',
    accentForeground: '#f8fafc',
    destructive: '#ef4135',
    destructiveForeground: '#f8fafc',
    border: '#334155',
    input: '#1e293b',
    ring: '#3b82f6',
  },
  radius: 8,
};

export default colors;
