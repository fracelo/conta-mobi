import 'react-native-get-random-values'; // Importe isso antes de tudo!
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/database/init';
import Routes from './src/routes/index';

export default function App() {
  useEffect(() => {
    // Inicializa o banco de dados SQLite assim que o app abre
    console.log("[App] Inicializando Banco de Dados...");
    initDatabase();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Routes />
    </>
  );
}