import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'base-64';
import Config from 'react-native-config';
import { launchImageLibrary } from 'react-native-image-picker'; // Import launchImageLibrary
import { useNavigation } from '@react-navigation/native';

const SessionsForm = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [capacity, setCapacity] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [category, setCategory] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [meetingDate, setMeetingDate] = useState('');
    const [image, setImage] = useState(null);
    const BASE_URL = Config.BASE_URL;

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    throw new Error('Token not found');
                }
                const [, payload] = token.split('.');
                const decodedPayload = base64.decode(payload);
                const payloadObject = JSON.parse(decodedPayload);
                setCreatedBy(payloadObject.username.toString());
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        };

        fetchUsername();
    }, []);

    const handleImageUpload = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.error) {
                console.log('Image picker error:', response.error);
            } else if (!response.didCancel) {
                if (response.assets && response.assets.length > 0) {
                    const imageUri = response.assets[0].uri; // Get the URI of the selected image
                    console.log("Selected image URI:", imageUri);
                    setImage({ uri: imageUri }); // Set the image URI in state
                } else {
                    console.log('No image selected');
                }
            } else {
                console.log('Image selection cancelled');
            }
        });
    };

    const createSession = async () => {
        try {
            console.log()
            const response = await axios.post(`${BASE_URL}/session/add`, {
                title,
                description,
                capacity: parseInt(capacity),
                createdBy,
                category,
                meetingLink,
                meetingDate,
                enrolledStudents: [],
                image: image ? image.uri : null, // Use image URI if available

            });
            console.log('Session created:', response.data);
            // Navigate back after session is successfully created
            navigation.goBack();
        } catch (error) {
            console.error('Error creating session:', error);
            // Handle error
        }
    };

    return (
        <View style={styles.container}>
            {image && <Image source={image} style={styles.image} />}
            <Button title="Pick Image" onPress={handleImageUpload} />
            <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholderTextColor="white"
            />
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                placeholderTextColor="white"
            />
            <TextInput
                placeholder="Capacity"
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
                style={[styles.input, styles.capacityInput]}
                placeholderTextColor="white"
            />
            <TextInput
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
                style={styles.input}
                placeholderTextColor="white"
            />
            <TextInput
                placeholder="Meeting Link"
                value={meetingLink}
                onChangeText={setMeetingLink}
                style={styles.input}
                placeholderTextColor="white"
            />
            <TextInput
                placeholder="Meeting Date"
                value={meetingDate}
                onChangeText={setMeetingDate}
                style={styles.input}
                placeholderTextColor="white"
            />
            <Button title="Create Session" onPress={createSession} color="#841584" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    input: {
        marginBottom: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderColor: 'gray',
        borderWidth: 1,
        minWidth: 250,
        borderRadius: 8,
        color: 'white',
    },
    capacityInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 10,
    },
});

export default SessionsForm;
