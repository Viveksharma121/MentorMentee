import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';
export default function Login() {
  const BASE_URL = Config.BASE_URL;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      console.log('handle loggin called');
      if (username === '' || password === '') {
        Alert.alert('Alert', 'Please enter both username and password.', [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
      } else {
        const response = await axios.post(`${BASE_URL}/user/login`, {
          username,
          password,
        });
        // Store token in AsyncStorage
        console.log(response.data.token);
        await AsyncStorage.setItem('token', response.data.token);
        
        navigation.navigate('AppAll');
        // console.log(response.data._id);
        // if (response.status === 200) {
        //   // Successfully logged in, navigate to 'AppAll' or handle accordingly
        //   navigation.navigate('AppAll');
        // } else {
        //   // Handle login error, show alert or update state
        //   Alert.alert(
        //     'Login Failed',
        //     response.data.message || 'Something went wrong'
        //   );
        // }
      }
    } catch (error) {
      console.log('Login error:', error);
      // Handle other errors as needed
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputView}>
        <TextInput
          value={username}
          style={styles.inputText}
          placeholder="Username"
          placeholderTextColor="#AFAFAF"
          onChangeText={username => setUsername(username)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          value={password}
          style={styles.inputText}
          placeholder="Password"
          placeholderTextColor="#AFAFAF"
          onChangeText={password => setPassword(password)}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>LOGIN</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={{marginHorizontal: 15}}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.singUp}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputView: {
    width: '80%',
    backgroundColor: '#EAEAEA',
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 20,
  },
  inputText: {
    height: 50,
    color: '#777777',
    fontWeight: '800',
  },
  singUp: {
    color: '#39B54A',
    fontWeight: '500',
  },
  loginBtn: {
    width: '80%',
    backgroundColor: '#39B54A',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  loginText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  forgot: {
    color: '#777777',
    fontWeight: '500',
  },
  // Add any other styles as needed
});
