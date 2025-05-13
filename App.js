import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator }   from '@react-navigation/stack';
import HomeScreen                 from './screens/HomeScreen';
import ReportScreen               from './screens/ReportScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#121212' },
          headerTitleAlign: 'center',
          headerTintColor: '#fff'
        }}
      >
        <Stack.Screen name="Home"  component={HomeScreen}  options={{ title: 'Finalysis' }} />
        <Stack.Screen name="Report" component={ReportScreen} options={{ title: '' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}