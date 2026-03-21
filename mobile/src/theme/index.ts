export const colors = {
  primary: '#008552',       // Verde Esmeralda escuro
  primaryLight: '#3EB489',  // Verde Menta
  secondary: '#50C878',     // Verde Esmeralda claro
  background: '#F1FFFA',    // Fundo Menta claro
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
};

export const spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 25,
  xxl: 30,
};

export const borderRadius = {
  sm: 10,
  md: 15,
  lg: 25,
};

export const typography = {
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'normal' as const,
  },
  small: {
    fontSize: 13,
  },
};

export const shadows = {
  card: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
};