// import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Navigator from './Navigators/Navigator';
// import Profile from './components/profile';

const Stack = createStackNavigator();

function App() {
  return (
    // <NavigationContainer>
    //   <Stack.Navigator
    //     initialRouteName="AppName"
    //     screenOptions={{headerShown: false}}>
    //     {/* <Stack.Screen name="Threads" component={Threads} /> */}
    //     <Stack.Screen name="AppName" component={Threads} />
    //     {/* <Stack.Screen name="Profile" component={Profile} /> */}
    //   </Stack.Navigator>
    // </NavigationContainer>
    <Navigator />
  );
}

export default App;
