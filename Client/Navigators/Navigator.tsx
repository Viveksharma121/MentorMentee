// import * as React from 'react';
// import { BottomNavigation, Text } from 'react-native-paper';
// import { Image } from 'react-native';
// import SkillsForm from '../Components/SkillsForm';
// import Threads from '../Components/Threads';
// import Ask from '../Components/Ask';
// import Profile from '../Components/Profile';

// const profilePic = require('../assets/profile.jpg');
// const askIcon = require("../assets/ask.jpg");

// const BottomNavigationBar = () => {
//   const [index, setIndex] = React.useState(0);
//   const [routes] = React.useState([
//     { key: 'threads', title: 'Threads', icon: 'home' },
//     { key: 'Ask', title: 'Ask', icon: askIcon },
//     { key: 'SkillsForm', title: 'Skills Form', icon: 'format-list-bulleted' },
//     { key: 'Profile', title: 'Profile', icon: profilePic },
//   ]);

//   const renderScene = BottomNavigation.SceneMap({
//     threads: Threads,
//     Ask: Ask,
//     SkillsForm: SkillsForm,
//     Profile: Profile,
//   });

//   // const renderIcon = ({ route, focused, color, size } : { route: any; focused: boolean; color: string; size: number }) => {
//   //   return (
//   //     <Image
//   //       source={route.icon}
//   //       style={{ width: size, height: size, backgroundColor: 'transparent' }} // Adjust size and color as needed
//   //     />
//   //   );
//   // };

//   const renderIcon = ({ route, focused, color }: { route: any; focused: boolean; color: string }) => {
//   const { key, icon } = route;
//   let iconSource = null;

//   // Determine the icon source based on the route key
//   switch (key) {
//     case 'threads':
//       iconSource = require('../assets/logo.png');
//       break;
//     case 'Ask':
//       iconSource = require("../assets/ask.jpg");
//       break;
//     case 'SkillsForm':
//       // Adjust this path as needed
//       iconSource = require("../assets/skills.jpg");
//       break;
//     case 'Profile':
//       // Adjust this path as needed
//       iconSource = require("../assets/profile.jpg");
//       break;
//     default:
//       iconSource = null;
//   }

//   // Render the icon image
//   return iconSource ? <Image source={iconSource} style={{ width: 24, height: 24, tintColor: color }} /> : null;
// };

//   return (
//     <BottomNavigation
//       navigationState={{ index, routes }}
//       onIndexChange={setIndex}
//       renderScene={renderScene}
//       renderIcon={renderIcon}
//       barStyle={{ backgroundColor: 'transparent' }}
//     />
//   );
// };

// export default BottomNavigationBar;

import AsyncStorage from '@react-native-async-storage/async-storage';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useEffect, useState} from 'react';
import {ActivityIndicator, Image, ImageStyle} from 'react-native';
import ChatGpt from '../Components/ChatGpt';
import EditPost from '../Components/EditPost';
import Login from '../Components/Login';
import Profile from '../Components/Profile';
import Register from '../Components/Register';
import ResourceDetailScreen from '../Components/Resource/ResourceDetailScreen';
import ResourceLibrary from '../Components/Resource/ResourceLibrary';
import RoadmapComponent from '../Components/RoadMap';
import SavedTweets from '../Components/SavedTweets';
import ProjectForm from '../Components/Search/Searchpage';
import SkillsForm from '../Components/SkillsForm';
import Threads from '../Components/Threads';
import UserProfile from '../Components/UserProfile/UserProfile';
import ChatPage from '../Components/chatApp/ChatPage';
import HomePage from '../Components/chatApp/Homepage';
import SearchPage from '../Components/chatApp/SearchPage';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="RoadMap"
        component={RoadmapComponent}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ResourceDetail"
        component={ResourceDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SavedTweets"
        component={SavedTweets}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ChatGpt"
        component={ChatGpt}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditPost"
        component={EditPost}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Home"
        component={HomePage}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Chat"
        component={ChatPage}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Searchh"
        component={SearchPage}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const AppNavigator2 = () => {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="RoadMap"
        component={RoadmapComponent}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ResourceDetail"
        component={ResourceDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SavedTweets"
        component={SavedTweets}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ChatGpt"
        component={ChatGpt}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditPost"
        component={EditPost}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Home"
        component={HomePage}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Chat"
        component={ChatPage}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Searchh"
        component={SearchPage}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          let iconStyle: ImageStyle = {width: 24, height: 24};
          if (route.name === 'Threads') {
            iconName = focused
              ? require('../assets/logo.png') // Image for active state
              : require('../assets/logo.png'); // Image for inactive state
          } else if (route.name === 'Profile') {
            iconName = focused
              ? require('../assets/profile.png') // Image for active state
              : require('../assets/profile.png'); // Image for inactive state
          } else if (route.name === 'SkillsForm') {
            iconName = focused
              ? require('../assets/skills.png') // Image for active state
              : require('../assets/skills.png'); // Image for inactive state
          } else if (route.name === 'Search') {
            iconName = focused
              ? require('../assets/profile.png') // Image for active state
              : require('../assets/profile.png'); // Image for inactive state
          } else if (route.name === 'Resource') {
            iconName = focused
              ? require('../assets/profile.png') // Image for active state
              : require('../assets/profile.png'); // Image for inactive state
          }

          // Add outline style if focused
          if (focused) {
            iconStyle = {...iconStyle, borderWidth: 2, borderColor: 'blue'};
          }
          // You can return any component here
          return <Image source={iconName} style={{width: 24, height: 24}} />;
        },
      })}>
      <Tab.Screen name="Threads" component={Threads} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="SkillsForm" component={SkillsForm} />
      <Tab.Screen name="Search" component={ProjectForm} />
      <Tab.Screen name="Resource" component={ResourceLibrary} />
      <Tab.Screen name="SavedTweets" component={SavedTweets} />
      {/* <Tab.Screen name="ChatGpt" component={ChatGpt} /> */}
    </Tab.Navigator>
  );
};

const Navigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsLoggedIn(token !== null);
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
      />
    );
  }

  return isLoggedIn ? <AppNavigator2 /> : <AppNavigator />;
};

export default Navigator;
