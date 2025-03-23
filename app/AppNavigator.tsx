/* eslint-disable import/no-unresolved */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerScreenProps } from '@react-navigation/drawer';
import Home from './index';
import Settings from './Settings';
import APISettings from './APISettings';
import About from './About';
import APISettingsAuth from './APISettingsAuth';

import Translator from './tools/Translator';
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
        <Drawer.Screen name="Home" component={Home} options={{ title: 'Home' }} />
        <Drawer.Screen name="Settings" component={SettingsWrapper} options={{ title: 'Settings' }} />
        <Drawer.Screen name="APISettings" component={APISettings} options={{ title: 'API Settings' }} />
        <Drawer.Screen name="About" component={About} options={{ title: 'About' }} />
        <Drawer.Screen name="APISettingsAuth" component={APISettingsAuth} options={{ title: 'API Settings Auth' }} />
        
        <Drawer.Screen name="Translator" component={Translator} options={{ title: 'Translator' }} />
        <Drawer.Screen name="Box2" component={Box2} options={{ title: 'Box 2' }} />
        <Drawer.Screen name="Box3" component={Box3} options={{ title: 'Box 3' }} />
        <Drawer.Screen name="ComingSoon" component={ComingSoon} options={{ title: 'Coming Soon' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
