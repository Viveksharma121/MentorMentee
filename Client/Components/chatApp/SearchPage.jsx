import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Config from 'react-native-config';

const SearchPage = ({ route }) => {
  const navigation = useNavigation();
  const { myUserName } = route.params || {};
  const [userName, setUserName] = useState('');
  const [foundUserName, setFoundUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter a username.');
      return;
    }

    if (userName === myUserName) {
      Alert.alert('Error', "You can't search for yourself.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${Config.BASE_URL}/search`, { username: userName });
      setFoundUserName(response.data.userName);
    } catch (error) {
      Alert.alert('Error', 'User does not exist or there was a problem with the search.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUser = async () => {
    try {
      const response = await axios.post(`${Config.BASE_URL}/chatroom`, {
        userName: foundUserName,
        myUsername: myUserName,
      });

      if (response.status === 200) {
        navigation.navigate('Chat', {
          chatroomId: response.data.chatroomId,
          userName: foundUserName,
          myUserName: myUserName,
        });
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create or find a chatroom.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Username to be Searched"
        value={userName}
        onChangeText={setUserName}
      />
      <Button title="Search" onPress={handleSearch} />
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      {foundUserName ? (
        <TouchableOpacity style={styles.userCard} onPress={handleUser}>
          <Text style={styles.userName}>{foundUserName}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  userCard: {
    marginVertical: 20,
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontWeight: 'bold',
  },
});

export default SearchPage;
