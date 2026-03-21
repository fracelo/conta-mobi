import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { initDatabase } from './src/database/init';
import { verificarSessao } from './src/services/auth';
import Routes from './src/routes/index';

ExpoSplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        initDatabase();
        const sessao = await verificarSessao();
        setLogado(!!sessao);
      } catch (e) {
        console.warn('[App] Erro na inicialização:', e);
      } finally {
        setReady(true);
        await ExpoSplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Routes logado={logado} />
    </>
  );
}