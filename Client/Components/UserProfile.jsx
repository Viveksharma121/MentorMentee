// UserProfile.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';

const UserProfile = ({ route }) => {
    const BASE_URL = Config.BASE_URL;
    const { username } = route.params;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/searchitem?username=${username}`);
                const data = response.data;
                setUserData(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Error fetching user data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [BASE_URL, username]);

    const handleAskButtonPress = () => {
        // Add logic for the ASK button press
        console.log("Ask button pressed");
    };

    const handleFollowButtonPress = () => {
        // Add logic for the FOLLOW button press
        console.log("Follow button pressed");
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
                <Text>Loading...</Text>
            ) : error ? (
                <Text>{error}</Text>
            ) : (
                <View>
                    <View style={styles.header}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{userData.name.charAt(0)}</Text>
                        </View>
                        <Text style={styles.username}>{username}</Text>
                    </View>

                    <Text style={styles.label}>Position:</Text>
                    <Text style={styles.info}>{userData ? userData.position : 'Not specified'}</Text>

                    <Text style={styles.label}>Description:</Text>
                    <Text style={[styles.info, styles.bold]}>{userData ? userData.description : 'No description available'}</Text>

                    <Text style={styles.label}>Skills:</Text>
                    <View style={styles.card}>
                        {userData.skills && userData.skills.length > 0 ? (
                            userData.skills.map((skill, index) => (
                                <Text key={index} style={styles.cardItem}>{skill}</Text>
                            ))
                        ) : (
                            <Text>No skills listed</Text>
                        )}
                    </View>

                    <Text style={styles.label}>Projects:</Text>
                    <View style={styles.card}>
                        {userData.projects && userData.projects.length > 0 ? (
                            userData.projects.map((project, index) => (
                                <View key={index} style={styles.projectCardItem}>
                                    <Text style={styles.bold}>Title:</Text>
                                    <Text>{project.title}</Text>
                                    <Text style={styles.bold}>GitHub Link:</Text>
                                    <Text>{project.githubLink}</Text>
                                </View>
                            ))
                        ) : (
                            <Text>No projects listed</Text>
                        )}
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.askButton} onPress={handleAskButtonPress}>
                            <Text style={styles.buttonText}>ASK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.followButton} onPress={handleFollowButtonPress}>
                            <Text style={styles.buttonText}>FOLLOW</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 12,
    },
    info: {
        fontSize: 16,
        marginTop: 6,
    },
    bold: {
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#ecf0f1',
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    cardItem: {
        fontSize: 14,
        marginBottom: 8,
    },
    projectCardItem: {
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 16,
    },
    askButton: {
        flex: 1,
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    followButton: {
        flex: 1,
        backgroundColor: '#27ae60',
        padding: 12,
        borderRadius: 8,
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default UserProfile;
