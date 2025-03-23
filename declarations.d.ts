import { DrawerNavigationProp } from '@react-navigation/drawer';

declare module './HomeScreen';
declare module './Settings';
declare module './APISettings';
declare module './About';
declare module './APISettingsAuth';


declare module './tools/Translator';
declare module './tools/Box2';
declare module './tools/Box3';
declare module './tools/ComingSoon';


declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

type RootDrawerParamList = {
  Home: undefined;
  Settings: undefined;
  APISettings: undefined;
  About: undefined;
  APISettingsAuth: undefined;
  
  Translator: undefined;
  Box2: undefined;
  Box3: undefined;
  ComingSoon: undefined;
};

type HomeScreenNavigationProp = DrawerNavigationProp<RootDrawerParamList, 'Home'>;