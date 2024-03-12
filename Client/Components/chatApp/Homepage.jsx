import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState, useFocusEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';



const HomePage = () => {
    const [username, setUserName] = useState('');
  const navigation = useNavigation();
  const [chatroomsData, setChatroomsData] = useState([]);
  const [chatrooms, setChatrooms] = useState([]);

  // Function to get token and decode username
  const userName = async () => {
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

      useFocusEffect(
        useCallback(() => {
          userName();
            fetchChatrooms();
        }, []),
      );

  const fetchChatrooms = async () => {
    try {
      const response = await axios
        .post('http://10.0.2.2:5001/homepage', {
          username: username,
        })
        .then(response => {
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
        navigation.navigate('chat', {
          chatroomId: item.chatroomId,
          otherUserName: item.otherUserName,
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
        onPress={() => navigation.navigate('search', {myUserName: username})}>
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
