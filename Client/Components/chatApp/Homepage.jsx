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
  const [participants, setparticipants] = useState([]);
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
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (username) {
      fetchChatrooms();
      fetchAllChat();
    }
  }, [username]);

  const fetchAllChat = async () => {
    try {
      console.log('sending username', username);
      const response = await axios.get(
        `${BASE_URL}/api/chat/allchatrooms?username=${username}`,
      );
      console.log('all chatrooms');
      const participants = response.data.map(chatroom => chatroom.participants);
      console.log(participants);
      setparticipants(participants);
      console.log(chatrooms);
    } catch (error) {
      console.error('Error fetching chatrooms:', error);
    }
  };

  const fetchChatrooms = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/homepage`, {
        username: username,
      });

      setChatrooms(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching chatrooms:', error);
    }
  };

  const renderChatroomItem = ({item}) => {
    // Check if item.otherUserName matches the first participant in participants array
    const isMentor = participants.some(
      participant => participant[0] === item.otherUserName,
    );

    return (
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
          <Text style={styles.chatroomText}>
            {isMentor
              ? `${item.otherUserName} (Mentor)`
              : `${item.otherUserName} (Mentee)`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  chatroomItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
  },
  chatroomContent: {
    padding: 20,
  },
  chatroomText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 15,
    elevation: 5,
  },
});

export default HomePage;
