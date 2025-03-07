/* eslint-disable import/no-unresolved */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerScreenProps } from '@react-navigation/drawer';
import APISettingsScreen from './APISettings';
import AboutScreen from './About';
import Settings from './Settings';
import Box1 from './tools/Box1';
import Box2 from './tools/Box2';
import Box3 from './tools/Box3';
import ComingSoon from './tools/ComingSoon';

const Drawer = createDrawerNavigator();

type SettingsWrapperProps = DrawerScreenProps<any, 'Settings'>;

const SettingsWrapper = (props: SettingsWrapperProps) => {
    return <Settings isOpen={false} onClose={() => {}} {...props} />;
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Settings" component={SettingsWrapper} options={{ title: 'Settings' }} />
        <Drawer.Screen name="APISettings" component={APISettingsScreen} options={{ title: 'API Settings' }} />
        <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
        <Drawer.Screen name="Box1" component={Box1} options={{ title: 'Translator' }} />
        <Drawer.Screen name="Box2" component={Box2} options={{ title: 'Box 2' }} />
        <Drawer.Screen name="Box3" component={Box3} options={{ title: 'Box 3' }} />
        <Drawer.Screen name="ComingSoon" component={ComingSoon} options={{ title: 'Coming Soon' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
