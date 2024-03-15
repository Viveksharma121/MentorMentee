import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import base64 from 'base-64';
import React, {useCallback, useState} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';
import {Avatar, Card, IconButton, Subheading, Title} from 'react-native-paper';
const ProfilePage = () => {
  const navigation = useNavigation();
  const BASE_URL = Config.BASE_URL;
  const [userDetails, setUserDetails] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  const getUsernameFromToken = async token => {
    try {
      if (!token) {
        throw new Error('Token not found');
      }
      const [, payload] = token.split('.');
      const decodedPayload = base64.decode(payload);
      const payloadObject = JSON.parse(decodedPayload);
      return payloadObject.username;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('Token not found');
        return;
      }
      const username = await getUsernameFromToken(token);
      if (!username) {
        console.error('Username not found in token');
        return;
      }

      const response = await axios.get(`${BASE_URL}/user/${username}`);
      setUserDetails(response.data);

      try {
        const skillsResponse = await axios.get(
          `${BASE_URL}/api/${username}/skills`,
        );
        setSkills(skillsResponse.data.skills || []);
        setProjects(skillsResponse.data.projects || []);
      } catch (error) {
        console.error('Error fetching skills or projects:', error);
        setSkills([]);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUserDetails(null);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
    }, []),
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {userDetails ? (
        <>
          <Avatar.Text
            size={100}
            label={userDetails.username[0].toUpperCase()}
            style={styles.avatar}
          />
          <IconButton
            icon="cart"
            color="#000"
            size={24}
            onPress={() => navigation.navigate('BuyItemsPage')}
            style={styles.logoutButton}
          />
          <Title style={styles.username}>{userDetails.username}</Title>
          <Subheading style={styles.email}>
            Email: {userDetails.email}
          </Subheading>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.map((skill, index) => (
              <Card key={index} style={styles.card}>
                <Card.Content>
                  <Text style={styles.cardText}>{skill}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((project, index) => (
              <Card key={index} style={styles.card}>
                <Card.Content>
                  <Text style={styles.cardText}>{project.title}</Text>
                  <Text style={styles.linkText}>{project.githubLink}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </>
      ) : (
        <Text>Loading user details...</Text>
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('SkillsForm')}>
        <Text style={styles.addButtonText}>Add Skills / Projects</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('SavedTweets')}>
        <Text style={styles.addButtonText}>View Saved Tweets</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f5f5f5',
  },
  logoutButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },

  avatar: {
    backgroundColor: '#1da1f2',
    marginBottom: 10,
    elevation: 2,
    borderRadius: 50, // Making the avatar circular
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10, // Adding some space below the username
  },
  email: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  sectionContainer: {
    width: '90%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
  linkText: {
    fontSize: 14,
    color: '#007bff',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#1da1f2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    marginTop: 10,
    elevation: 2,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfilePage;
