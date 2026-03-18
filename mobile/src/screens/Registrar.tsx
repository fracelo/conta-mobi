import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import FloatingInput from '../components/FloatingInput';

export default function Registrar({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleRegistro = () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não conferem.");
      return;
    }

    console.log("Registrando:", { nome, email });
    // Futura integração com SQLite e Supabase aqui
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Logo Centralizado */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icons/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>CONTA MOBI</Text>
        </View>

        {/* Box de Registro com bordas arredondadas */}
        <View style={styles.registerBox}>
          <Text style={styles.welcomeText}>Crie sua conta gratuita</Text>
          
          <FloatingInput 
            label="Nome Completo"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          <FloatingInput 
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Senha e Confirmar Senha logo abaixo do E-mail conforme pedido */}
          <FloatingInput 
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={true} 
          />

          <FloatingInput 
            label="Confirmar Senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry={true}
          />

          <TouchableOpacity 
            style={[
              styles.button, 
              (!nome || !email || !senha || !confirmarSenha) && styles.buttonDisabled
            ]} 
            onPress={handleRegistro}
            disabled={!nome || !email || !senha || !confirmarSenha}
          >
            <Text style={styles.buttonText}>CRIAR CONTA</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginText}>
              Já tem uma conta? <Text style={styles.loginBold}>Entrar</Text>
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
    backgroundColor: '#F1FFFA', // Fundo Menta
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008552', // Verde Esmeralda
    marginTop: 8,
    letterSpacing: 1.2,
  },
  registerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  welcomeText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#008552', // Esmeralda
    borderRadius: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7', // Verde clarinho quando desabilitado
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#999',
    fontSize: 13,
  },
  loginBold: {
    color: '#008552',
    fontWeight: 'bold',
  },
});