// ProfilePage.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar, Title, Subheading } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import base64 from 'base-64';
import Config from 'react-native-config';

const ProfilePage = () => {
  const BASE_URL = Config.BASE_URL;
  const [userDetails, setUserDetails] = useState(null);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  const getUsernameFromToken = async (token) => {
    try {
      if (!token) {
        throw new Error('Token not found');
      }

      // Split the token into parts (header, payload, signature)
      const [, payload] = token.split('.');

      // Decode only the payload because it contains the username
      const decodedPayload = base64.decode(payload);

      const payloadObject = JSON.parse(decodedPayload);

      const username = payloadObject.username;
      console.log('Username:', username);

      return username.toString();
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  useEffect(() => {
    // Fetch user details using the username
    const fetchUserDetails = async () => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Token not found');
        }

        const username = await getUsernameFromToken(token);

        // Fetch user details
        const response = await axios.get(`${BASE_URL}/user/${username}`);
        console.log(response.data);
        setUserDetails(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <View style={styles.container}>
      {userDetails ? (
        <>
          <Avatar.Text
            size={80}
            label={userDetails.username[0].toUpperCase()}
            style={styles.avatar}
          />
          <Title style={styles.username}>{userDetails.username}</Title>
          <Subheading style={styles.email}>Email: {userDetails.email}</Subheading>
          {/* Add more user details as needed */}
        </>
      ) : (
        <Text>Loading user details...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Background color
  },
  avatar: {
    backgroundColor: '#3498db', // Avatar background color
  },
  username: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    marginTop: 5,
    fontSize: 16,
    color: '#555',
  },
});

export default ProfilePage;
