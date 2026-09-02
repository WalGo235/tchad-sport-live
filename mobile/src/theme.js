export const lightColors = {
  background: '#f5f5f5',
  card: '#ffffff',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#eeeeee',
  inputBg: '#f5f5f5',
  inputBorder: '#dddddd',
};

export const darkColors = {
  background: '#0E1420',
  card: '#1A2333',
  textPrimary: '#F0F2F5',
  textSecondary: '#B0B8C4',
  textMuted: '#7C8697',
  border: '#2A3548',
  inputBg: '#1F2937',
  inputBorder: '#374151',
};

// Couleurs de marque : identiques en mode clair et sombre
export const brand = {
  navy: '#0F1E36',
  blue: '#0052CC',
  gold: '#FCD34D',
  red: '#DC2626',
  green: '#10B981',
};

// Alias conservés pour compatibilité avec l'écran d'accueil déjà en place
export const colors = { ...lightColors, navy: brand.navy, gold: brand.gold, surface: lightColors.card };

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
};

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};