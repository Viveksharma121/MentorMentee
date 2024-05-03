import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import base64 from 'base-64';
import React, {useEffect, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';

const NotificationPage = () => {
  const BASE_URL = Config.BASE_URL;
  const [notifications, setNotifications] = useState([]);
  const [username, setUsername] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

  useFocusEffect(
    React.useCallback(() => {
      getUsername();
    }, []),
  );

  useEffect(() => {
    if (username) {
      fetchNotifications();
    }
  }, [username]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications/${username}`);
      if (response.status === 200) {
        setNotifications(response.data);
        console.log('this is total notis', response.data.length);
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleDeleteNotification = async notificationId => {
    try {
      await axios.delete(`${BASE_URL}/notifications/${notificationId}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const onRefresh = () => {
    console.log('we refreshed');
    setRefreshing(true); // refreshing shuru hua toh true kar do
    fetchNotifications(); // notification fetch karlo
    setRefreshing(false); // refreshing hogaya toh false kardo
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Text style={styles.heading}>Notifications</Text>
      <View style={styles.notificationList}>
        {notifications.map((notification, index) => (
          <View key={index} style={styles.notificationItem}>
            <View style={styles.notificationText}>
              <Text style={styles.sender}>{notification.sender}</Text>
              <Text style={styles.message}>{notification.message}</Text>
              <Text style={styles.message}>{notification.timestamp}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteNotification(notification._id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    justifyContent: 'space-between',
  },
  notificationText: {
    flex: 1,
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  message: {
    color: '#333',
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NotificationPage;
