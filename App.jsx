// If your entry file is index.js, put this there instead of here:
// import 'react-native-gesture-handler';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import Intro from './screens/Intro';
import Game from './screens/Game';
import Settings from './screens/Settings';
import { SettingsProvider } from './screens/SettingsContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SettingsProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'black' },
            }}
            // optional: initialRouteName="Intro"
          >
            <Stack.Screen name="Intro" component={Intro} />
            <Stack.Screen name="Game" component={Game} />
            <Stack.Screen name="Settings" component={Settings} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaView>
    </SettingsProvider>
  );
}
