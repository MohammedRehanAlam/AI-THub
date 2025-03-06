import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerScreenProps } from '@react-navigation/drawer';
import SettingsScreen from './APISettings'; // Import Settings screen
import AboutScreen from './About'; // Import About screen
import Settings from './Settings'; // Import Settings screen
import Box1 from './Box1';
import Box2 from './Box2';
import Box3 from './Box3';

const Drawer = createDrawerNavigator();

type SettingsWrapperProps = DrawerScreenProps<any, 'Settings'>;

const SettingsWrapper = (props: SettingsWrapperProps) => {
    return <Settings isOpen={false} onClose={() => {}} {...props} />;
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      {/* Apply headerShown: false at the Drawer.Navigator level */}
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Settings" component={SettingsWrapper} options={{ title: 'Settings' }} />
        <Drawer.Screen name="APISettings" component={SettingsScreen} options={{ title: 'API Settings' }} />
        <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
        <Drawer.Screen name="Box1" component={Box1} options={{ title: 'Box 1' }} />
        <Drawer.Screen name="Box2" component={Box2} options={{ title: 'Box 2' }} />
        <Drawer.Screen name="Box3" component={Box3} options={{ title: 'Box 3' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
