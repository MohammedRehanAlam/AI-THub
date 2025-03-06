import { DrawerNavigationProp } from '@react-navigation/drawer';

declare module './APISettings';
declare module './About'; 
declare module './HomeScreen';
declare module './Settings';
declare module './Box1';
declare module './Box2';
declare module './Box3';

type RootDrawerParamList = {
  Home: undefined;
  APISettings: undefined;
  About: undefined;
  Settings: undefined;
  Box1: undefined;
  Box2: undefined;
  Box3: undefined;
};

type HomeScreenNavigationProp = DrawerNavigationProp<RootDrawerParamList, 'Home'>;