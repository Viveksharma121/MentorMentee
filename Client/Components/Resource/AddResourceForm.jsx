import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import base64 from 'base-64';
import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';

const AddResourceForm = ({onResourceAdded}) => {
  const BASE_URL = Config.BASE_URL;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');

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

  const handleSubmit = async () => {
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
    // Validate form fields
    if (!title || !description || !category || !url) {
      alert('Please fill out all fields');
      return;
    }

    console.log(title, description, category, url);
    // Send POST request to backend
    axios
      .post(`${BASE_URL}/api/resource/addResource`, {
        title,
        description,
        category,
        url,
        createdBy: username,
      })
      .then(response => {
        console.log('Resource added:', response.data);
        // Clear form fields
        setTitle('');
        setDescription('');
        setCategory('');
        setUrl('');
        // Trigger callback function to update resource list
        if (typeof onResourceAdded === 'function') {
          onResourceAdded();
        }
      })
      .catch(error => {
        console.error('Error adding resource:', error);
      });
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Add New Resource</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor="#000000"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, {height: 100}]}
        placeholder="Description"
        placeholderTextColor="#000000"
        value={description}
        onChangeText={setDescription}
        multiline={true}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        placeholderTextColor="#000000"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="URL"
        placeholderTextColor="#000000"
        value={url}
        onChangeText={setUrl}
      />
      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 350,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
  },
  input: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#000000',
  },
  button: {
    backgroundColor: '#2C4BFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default AddResourceForm;
