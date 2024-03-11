import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import base64 from 'base-64';
import { useFocusEffect } from '@react-navigation/native';

const SaveTweets = () => {
    const [savedTweets, setSavedTweets] = useState([]);

    const getUsernameFromToken = (token) => {
        const base64Url = token.split('.')[1];
        const base64Decoded = base64.decode(base64Url);
        return JSON.parse(base64Decoded).username; // Adjust according to your token structure
    };

    const fetchSavedTweets = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            const username = getUsernameFromToken(token);
            const response = await axios.get(`${Config.BASE_URL}/api/thread/${username}/saved-tweets`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSavedTweets(response.data);
        } catch (error) {
            console.error('Failed to fetch saved tweets:', error);
        }
    };

    const deleteSavedTweet = async (tweetId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token not found');
                return;
            }
            const username = getUsernameFromToken(token);
            await axios.delete(`${Config.BASE_URL}/api/thread/${username}/${tweetId}/delete-saved-tweet`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Filter out the deleted tweet from the savedTweets state
            const updatedTweets = savedTweets.filter(tweet => tweet.id !== tweetId);
            setSavedTweets(updatedTweets);

        } catch (error) {
            console.error('Failed to delete tweet:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSavedTweets();
        }, [])
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={savedTweets}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.tweetContainer}>
                        <Text style={styles.username}>{item.user_name}</Text>
                        <Text style={styles.tweetContent}>{item.content}</Text>
                        <Button title="Delete" onPress={() => deleteSavedTweet(item.id)} />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
    },
    tweetContainer: {
        backgroundColor: 'lightgrey',
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 5,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    tweetContent: {
        fontSize: 16,
    },
});

export default SaveTweets;
