import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Registrar from '../screens/Registrar';
import Home from '../screens/Home';
import Usuario from '../screens/Usuario';
import Categorias from '../screens/Categorias';

const Stack = createNativeStackNavigator();

interface RoutesProps {
  logado: boolean;
}

export default function Routes({ logado }: RoutesProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={logado ? 'Home' : 'Login'}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registrar" component={Registrar} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Usuario" component={Usuario} />
        <Stack.Screen name="Categorias" component={Categorias} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}