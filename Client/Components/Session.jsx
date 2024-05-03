import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native'; // Import useFocusEffect from React Navigation
import axios from 'axios';
import base64 from 'base-64';
import React, {useState} from 'react';
import {Button, FlatList, StyleSheet, Text, View} from 'react-native';
import Config from 'react-native-config';

const SessionPage = ({navigation}) => {
  const [sessions, setSessions] = useState([]);
  const [userCredits, setUserCredits] = useState(0);
  const BASE_URL = Config.BASE_URL;

  // Use useFocusEffect hook to fetch data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            throw new Error('Token not found');
          }
          const [, payload] = token.split('.');
          const decodedPayload = base64.decode(payload);
          const payloadObject = JSON.parse(decodedPayload);

          const userResponse = await axios.get(
            `${BASE_URL}/user/${payloadObject.username}`,
          );
          setUserCredits(userResponse.data.credits);

          const sessionsResponse = await axios.get(`${BASE_URL}/sessions`);
          setSessions(sessionsResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();

      // Cleanup function to clear state or unsubscribe if needed
      return () => {};
    }, []),
  );

  const handleViewSession = sessionId => {
    navigation.navigate('SessionsDetail', {sessionId}); // Navigate to SessionDetailScreen with sessionId as parameter
  };

  const renderSessionItem = ({item}) => (
    <View style={styles.card}>
      <Text style={styles.title}>Title: {item.title}</Text>
      <Text style={styles.info}>Category: {item.category}</Text>
      <Text style={styles.info}>Description: {item.description}</Text>
      <Text style={styles.info}>Created By: {item.createdBy}</Text>
      <Button
        title="View"
        onPress={() => handleViewSession(item._id)} // Pass sessionId to handleViewSession function
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={item => item._id}
      />
      {userCredits > 1000 ? (
        <Button
          title="Add Session"
          onPress={() => navigation.navigate('SessionsForm')}
        />
      ) : (
        <Text
          style={{
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#333',
            fontStyle: 'italic',
          }}>
          You need more than 1000 credit points to post a workshop.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  info: {
    marginBottom: 5,
    color: 'black',
  },
});

export default SessionPage;
