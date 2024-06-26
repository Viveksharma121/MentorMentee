/**
 * @format
 */

import {NavigationContainer} from '@react-navigation/native';
import {AppRegistry} from 'react-native';
import {MD3LightTheme as DefaultTheme, PaperProvider} from 'react-native-paper';
import {name as appName} from './app.json';
import App from './src/App';
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    secondary: 'yellow',
  },
};
const Main = () => {
  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <App />
      </PaperProvider>
    </NavigationContainer>
  );
};
AppRegistry.registerComponent(appName, () => Main);
