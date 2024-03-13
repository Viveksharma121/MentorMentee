import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import base64 from 'base-64';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Config from 'react-native-config';
import Icon from 'react-native-vector-icons/Ionicons';

const HomePage = () => {
  const [username, setUserName] = useState('');
  const navigation = useNavigation();
  const BASE_URL = Config.BASE_URL;
  const [chatroomsData, setChatroomsData] = useState([]);
  const [chatrooms, setChatrooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found');
        }
        const [, payload] = token.split('.');
        const decodedPayload = base64.decode(payload);
        const payloadObject = JSON.parse(decodedPayload);
        setUserName(payloadObject.username.toString());
        console.log(payloadObject.username.toString() + '  payyy');
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (username) {
      fetchChatrooms();
    }
  }, [username]);

  const fetchChatrooms = async () => {
    try {
      console.log(username + 'i am loggin username');
      const response = await axios
        .post(`${BASE_URL}/homepage`, {
          username: username,
        })
        .then(response => {
          console.log(response);
          console.log('Response: ', response.data);
          setChatrooms(response.data);
        })
        .catch(err => {
          console.log('Error: ', err);
        });
    } catch (error) {
      console.error('Error fetching chatrooms:', error);
    }
  };

  const renderChatroomItem = ({item}) => (
    <TouchableOpacity
      style={styles.chatroomItem}
      onPress={() =>
        navigation.navigate('Chat', {
          chatroomId: item.chatroomId,
          userName: item.otherUserName,
          myUserName: username,
        })
      }>
      <View style={styles.chatroomContent}>
        <Text>{item.otherUserName}</Text>
        {/* <Text>{item.otheEmail}</Text> */}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <FlatList
        data={chatrooms}
        renderItem={renderChatroomItem}
        keyExtractor={item => item.chatroomId}
      />
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => navigation.navigate('Searchh', {myUserName: username})}>
        <Icon name="search" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    fontSize: 24,
    textAlign: 'center',
  },
  searchButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'blue',
    borderRadius: 50,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  chatroomItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default HomePage;
