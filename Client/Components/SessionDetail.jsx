import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert, Linking, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import base64 from 'base-64';
import { useNavigation } from '@react-navigation/native';

const SessionDetailScreen = ({ route }) => {
    const { sessionId } = route.params;
    const [sessionDetails, setSessionDetails] = useState(null);
    const [currentUser, setCurrentUser] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            const fetchSessionDetails = async () => {
                try {
                    const sessionResponse = await axios.get(`${Config.BASE_URL}/sessions/${sessionId}`);
                    setSessionDetails(sessionResponse.data);

                    const token = await AsyncStorage.getItem('token');
                    if (token) {
                        const [, payload] = token.split('.');
                        const decodedPayload = base64.decode(payload);
                        const payloadObject = JSON.parse(decodedPayload);
                        setCurrentUser(payloadObject.username.toString());
                    }
                } catch (error) {
                    console.error('Error fetching session details:', error);
                }
            };

            fetchSessionDetails();
        }, [sessionId])
    );

    useEffect(() => {
        if (sessionDetails && currentUser) {
            const isUserEnrolled = sessionDetails.enrolledStudents.some(student => student.username === currentUser);
            setIsEnrolled(isUserEnrolled);
            setIsCreator(sessionDetails.createdBy === currentUser);
        }
    }, [sessionDetails, currentUser]);

    const enrollInSession = async () => {
        try {
            await axios.post(`${Config.BASE_URL}/sessions/enroll/${sessionId}`, {
                username: currentUser,
            });
            Alert.alert('Success', 'You have been enrolled in the session.');
            // Refresh session details to reflect the enrollment
            const updatedSessionResponse = await axios.get(`${Config.BASE_URL}/sessions/${sessionId}`);
            setSessionDetails(updatedSessionResponse.data);
        } catch (error) {
            console.error('Error enrolling in session:', error);
            Alert.alert('Error', 'Could not enroll in the session.');
        }
    };

    const handleMeetingLinkPress = () => {
        if (sessionDetails && sessionDetails.meetingLink) {
            Linking.openURL(sessionDetails.meetingLink);
        }
    };

    const deleteSession = async () => {
        try {
            await axios.delete(`${Config.BASE_URL}/sessions/${sessionId}`);
            Alert.alert('Success', 'Session deleted successfully.');
            navigation.goBack(); // Navigate back after session deletion
        } catch (error) {
            console.error('Error deleting session:', error);
            Alert.alert('Error', 'Could not delete the session.');
        }
    };

    if (!sessionDetails) return <View style={styles.container}><Text>Loading...</Text></View>;

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {sessionDetails.image && (
                    <Image
                        source={{ uri: sessionDetails.image }}
                        style={styles.image}
                    />
                )}
                <Text style={styles.title}>{sessionDetails.title}</Text>
                <Text style={styles.subtitle}>Description:</Text>
                <Text style={styles.text}>{sessionDetails.description}</Text>
                <Text style={styles.subtitle}>Category:</Text>
                <Text style={styles.text}>{sessionDetails.category}</Text>
                <Text style={styles.subtitle}>Meeting Link:</Text>
                <Text style={[styles.text, styles.link]} onPress={handleMeetingLinkPress}>{sessionDetails.meetingLink}</Text>
                <Text style={styles.subtitle}>Meeting Date:</Text>
                <Text style={styles.text}>{sessionDetails.meetingDate}</Text>
                <Text style={styles.subtitle}>Capacity:</Text>
                <Text style={styles.text}>{sessionDetails.capacity}</Text>
                {isCreator && (
                    <>
                        <Text style={styles.subtitle}>Enrolled Students:</Text>
                        <FlatList
                            data={sessionDetails.enrolledStudents}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.enrolledStudent}>
                                    <Text style={styles.enrolledStudentText}>{item.username}</Text>
                                    <Text style={styles.enrolledStudentText}>{item.email}</Text>
                                </View>
                            )}
                        />
                    </>
                )}
                {!isEnrolled && !isCreator && (
                    <Button title="Enroll" onPress={enrollInSession} />
                )}
                {isEnrolled && <Text style={styles.enrolledText}>You are already enrolled in this session.</Text>}
                {isCreator && (
                    <Button title="Delete Session" onPress={deleteSession} />
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#f0f0f0',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#666',
    },
    text: {
        fontSize: 16,
        color: '#444',
        marginBottom: 10,
    },
    link: {
        color: '#007bff',
        textDecorationLine: 'underline',
    },
    enrolledStudent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    enrolledStudentText: {
        fontSize: 16,
        color: '#555',
    },
    enrolledText: {
        marginTop: 10,
        fontSize: 16,
        color: 'green',
        textAlign: 'center',
    },
    image: {
        width: '100%',
        height: 200,
        marginBottom: 20,
    },
});

export default SessionDetailScreen;
