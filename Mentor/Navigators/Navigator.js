import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Hello from '../Components/Hello';
import Threads from '../Components/Threads';

//Tabs
const Tab = createBottomTabNavigator();

function TabGroup() {
  return (
    <Tab.Navigator
      screenOptions={({route, navigation}) => {
        tabBarIcon: ({color, focused, size}) => {
          let iconName;
          if (route.name === 'threads') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'profile') {
          }
        };
      }}>
      <Tab.Screen name="threads" component={Threads} />
      <Tab.Screen name="hello" component={Hello} />
    </Tab.Navigator>
  );
}

function Navigator() {
  return (
    <NavigationContainer>
      <TabGroup />
    </NavigationContainer>
  );
}

export default Navigator;
