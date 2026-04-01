import React, { useState } from 'react';
import { 
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

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    console.log("Tentando logar com:", email);
    // Aqui chamaremos a lógica do Supabase depois
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Logo Centralizado - Usando o caminho dos seus assets */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../icons/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>CONTA MOBI</Text>
        </View>

        {/* Box de Login com bordas arredondadas */}
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

            {/* Se quiser manter o comentário, use este formato com chaves e barra-asterisco */}
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
    backgroundColor: '#F1FFFA', // Fundo Menta claro
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#008552', // Verde Esmeralda
    marginTop: 10,
    letterSpacing: 1.5,
  },
  loginBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25, // Bordas bem arredondadas como pedido
    padding: 25,
    // Sombra para dar profundidade
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#50C878', // Esmeralda
    borderRadius: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signUpText: {
    color: '#999',
    fontSize: 13,
  },
  signUpBold: {
    color: '#3EB489', // Menta
    fontWeight: 'bold',
  },
});