import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SettingsScreen from './Settings'; // Import Settings screen
import AboutScreen from './About'; // Import About screen

const Drawer = createDrawerNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      {/* Apply headerShown: false at the Drawer.Navigator level */}
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'API Settings' }} />
        <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
