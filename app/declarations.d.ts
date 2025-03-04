import { DrawerNavigationProp } from '@react-navigation/drawer';

declare module './Settings';
declare module './About'; 
declare module './HomeScreen';

type RootDrawerParamList = {
  Home: undefined;
  Settings: undefined;
  About: undefined;
};

type HomeScreenNavigationProp = DrawerNavigationProp<RootDrawerParamList, 'Home'>;