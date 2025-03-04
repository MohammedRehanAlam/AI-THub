import * as React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
      {/* Button to open the sidebar */}
      <Button title="Open Sidebar" onPress={() => navigation.openDrawer()} />
    </View>
  );
}

function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Screen</Text>
      {/* Button to navigate back */}
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

function AboutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>About Screen</Text>
      {/* Button to navigate back */}
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        <Drawer.Screen name="About" component={AboutScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 24,
    marginBottom: 20
  }
}); 