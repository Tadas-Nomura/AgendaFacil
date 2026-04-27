
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../telas/HomeScreen';
import CalendarScreen from '../telas/CalendarScreen';
import NewEventScreen from '../telas/NewEventScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Início: 'home-outline',
              Calendário: 'calendar-outline',
              'Novo Evento': 'add-circle-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#aaa',
          headerStyle: { backgroundColor: '#6C63FF' },
          headerTintColor: '#fff',
        })}
      >
        <Tab.Screen name="Início" component={HomeScreen} />
        <Tab.Screen name="Calendário" component={CalendarScreen} />
        <Tab.Screen name="Novo Evento" component={NewEventScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}