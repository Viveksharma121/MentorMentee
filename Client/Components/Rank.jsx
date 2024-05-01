import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import base64 from 'base-64';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Config from 'react-native-config';

const TopUsersPage = () => {
  const BASE_URL = Config.BASE_URL;
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchUsers();
    getUsername();
  }, []);

  const getUsername = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
      const [, payload] = token.split('.');
      const decodedPayload = base64.decode(payload);
      const payloadObject = JSON.parse(decodedPayload);
      setUsername(payloadObject.username.toString());
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/rank`);
      const data = response.data;
      const sortedUsers = data.sort((a, b) => b.credits - a.credits);
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const navigateToUserProfile = user => {
    // Navigate to the user's profile page with the username
    navigation.navigate('UserProfile', {userName: user.username});
  };

  const renderUserItem = ({item}) => {
    const isCurrentUser = item.username === username;
    return (
      <TouchableOpacity onPress={() => navigateToUserProfile(item)}>
        <View style={[styles.userItem, isCurrentUser && styles.currentUser]}>
          <Text style={[styles.username, isCurrentUser && styles.underline]}>
            {item.username}
          </Text>
          <Text style={styles.credits}>{item.credits} credits</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Users</Text>
      <FlatList
        data={users}
        keyExtractor={item => item._id}
        renderItem={renderUserItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    elevation: 2,
  },
  currentUser: {
    backgroundColor: '#ADD8E6', // Light Blue
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  credits: {
    fontSize: 16,
  },
});

export default TopUsersPage;
