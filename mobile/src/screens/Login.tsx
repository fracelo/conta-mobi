import { login } from '../services/auth';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import FloatingInput from '../components/FloatingInput';
import { colors, borderRadius, spacing, shadows, typography } from '../theme';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
  if (!email || !senha) {
    Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
    return;
  }

  setCarregando(true);
  try {
    await login(email, senha);
    navigation.navigate('Home');
  } catch (error: any) {
    Alert.alert('Erro ao entrar', error.message);
  } finally {
    setCarregando(false);
  }
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icons/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>CONTA MOBI</Text>
        </View>

        <View style={styles.loginBox}>
          <Text style={styles.welcomeText}>Acesse sua conta</Text>

          <FloatingInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
          />

          <FloatingInput
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <TouchableOpacity
              style={[styles.button, carregando && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={carregando}
            >
              <Text style={styles.buttonText}>
                {carregando ? 'Entrando...' : 'Entrar'}
              </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpLink}
            onPress={() => navigation.navigate('Registrar')}
          >
            <Text style={styles.signUpText}>
              Não tem conta? <Text style={styles.signUpBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 200,
    height: 200,
  },
  appName: {
    ...typography.title,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  loginBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.card,
  },
  welcomeText: {
    ...typography.subtitle,
    color: colors.textLight,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  signUpText: {
    ...typography.small,
    color: colors.textMuted,
  },
  signUpBold: {
    color: colors.primaryLight,
    fontWeight: 'bold',
  },
});