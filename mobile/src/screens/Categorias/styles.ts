// src/screens/Categorias/styles.ts
import { StyleSheet, Platform, StatusBar } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme'; // Puxa o padrão global

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background // Usa o verde ou fundo padrão do app
  },
  header: {
    backgroundColor: colors.primary, // Verde Esmeralda centralizado
    // ... restante do estilo
  },
  // Estilos específicos que só existem aqui, como a "curva de conexão" da árvore
  curvaConexao: {
    width: 10,
    height: 10,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#DDD',
  }
});