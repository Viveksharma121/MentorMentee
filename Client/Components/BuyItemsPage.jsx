import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'base-64';
import axios from 'axios';
import Config from 'react-native-config';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

const BuyItemsPage = () => {
    const [username, setUsername] = useState('');
    const [credits, setCredits] = useState(0);
    const [items, setItems] = useState([]);

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Token not found');
            }
            const [, payload] = token.split('.');
            const decodedPayload = base64.decode(payload);
            const payloadObject = JSON.parse(decodedPayload);
            const storedUsername = payloadObject.username.toString();

            setUsername(storedUsername); // Set the username

            // Fetch credits based on username
            const creditsResponse = await axios.get(`${Config.BASE_URL}/${storedUsername}/credits`);
            setCredits(creditsResponse.data.credits);

            // Fetch available items
            const dummyItems = [
                { id: 1, name: 'Cup', price: 250 },
                { id: 2, name: 'T-Shirt', price: 450 }
            ];
            setItems(dummyItems);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const buyItem = async (item) => {
        try {
            if (credits >= item.price) {
                // Deduct the price of the item from user's credits
                const updatedCredits = credits - item.price;
                setCredits(updatedCredits);

                // Make API call to deduct credits from user's account
                await axios.post(`${Config.BASE_URL}/deduct-credits`, {
                    username: username,
                    price: item.price
                });

                console.log(`Item '${item.name}' purchased successfully!`);
            } else {
                console.log('Insufficient credits!');
            }
        } catch (error) {
            console.error('Error buying item:', error);
        }
    };

    const renderItem = ({ item }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text>{item.name}</Text>
            <Text>{item.price} credits</Text>
            <Button title="Buy" onPress={() => buyItem(item)} />
        </View>
    );

    // Use useFocusEffect to fetch user data whenever the screen gains focus
    useFocusEffect(
        React.useCallback(() => {
            fetchUserData();
        }, [])
    );

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginBottom: 10 }}>Your Credits: {credits}</Text>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                style={{ width: '100%' }}
            />
        </View>
    );
};

export default BuyItemsPage;
