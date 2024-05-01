import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'base-64';
import Config from 'react-native-config';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';

const SessionsForm = () => {
    const navigation = useNavigation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [capacity, setCapacity] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [category, setCategory] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [meetingDate, setMeetingDate] = useState('');
    const [image, setImage] = useState(null);
    const [userCredits, setUserCredits] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    throw new Error('Token not found');
                }
                const [, payload] = token.split('.');
                const decodedPayload = base64.decode(payload);
                const payloadObject = JSON.parse(decodedPayload);
                setCreatedBy(payloadObject.username);

                const userResponse = await axios.get(`${Config.BASE_URL}/user/${payloadObject.username}`);
                setUserCredits(userResponse.data.credits);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleImageUpload = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.error) {
                console.log('Image picker error:', response.error);
            } else if (!response.didCancel) {
                if (response.assets && response.assets.length > 0) {
                    const imageUri = response.assets[0].uri;
                    setImage({ uri: imageUri });
                }
            }
        });
    };

    const deductCredits = async () => {
        try {
            const updatedCredits = userCredits - 100;
            setUserCredits(updatedCredits);
            await axios.post(`${Config.BASE_URL}/update-credits`, {
                username: createdBy,
                actionType: 'sessionAdd',
            });
        } catch (error) {
            console.error('Error deducting credits:', error);
        }
    };

    const createSession = async () => {
        if (userCredits < 1000) {
            Alert.alert('Insufficient Credits', 'You do not have enough credits to create a session.');
            return;
        }

        try {
            const response = await axios.post(`${Config.BASE_URL}/session/add`, {
                title,
                description,
                capacity: parseInt(capacity, 10),
                createdBy,
                category,
                meetingLink,
                meetingDate,
                enrolledStudents: [],
                image: image ? image.uri : null,
            });

            await deductCredits();

            Alert.alert('Success', 'Session created successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Error creating session:', error);
            Alert.alert('Error', 'Failed to create session.');
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
                style={[styles.input, { color: 'white' }]}
            />
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, { color: 'white' }]}
            />
            <TextInput
                placeholder="Capacity"
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
                style={[styles.input, { color: 'white' }]}
            />
            <TextInput
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
                style={[styles.input, { color: 'white' }]}
            />
            <TextInput
                placeholder="Meeting Link"
                value={meetingLink}
                onChangeText={setMeetingLink}
                style={[styles.input, { color: 'white' }]}
            />
            <TextInput
                placeholder="Meeting Date"
                value={meetingDate}
                onChangeText={setMeetingDate}
                style={[styles.input, { color: 'white' }]}
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
        backgroundColor: '#000',
    },
    input: {
        marginBottom: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderColor: 'gray',
        borderWidth: 1,
        minWidth: 250,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 10,
    },
});

export default SessionsForm;
