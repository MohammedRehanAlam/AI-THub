import { DrawerNavigationProp } from '@react-navigation/drawer';

declare module './APISettings';
declare module './About'; 
declare module './HomeScreen';
declare module './Settings';
declare module './tools/Box1';
declare module './tools/Box2';
declare module './tools/Box3';
declare module './tools/ComingSoon';

type RootDrawerParamList = {
  Home: undefined;
  Settings: undefined;
  APISettings: undefined;
  About: undefined;
  Box1: undefined;
  Box2: undefined;
  Box3: undefined;
  ComingSoon: undefined;
};

type HomeScreenNavigationProp = DrawerNavigationProp<RootDrawerParamList, 'Home'>;