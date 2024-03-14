import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import base64 from 'base-64';
import React, {useEffect, useState} from 'react';
import {Pressable} from 'react-native';
import Swiper from 'react-native-swiper';

import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';

const BuyItemsPage = () => {
  const [username, setUsername] = useState('');
  const [credits, setCredits] = useState(0);
  const [selectedItem, setSelectedItem] = useState([]);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
    setRefreshing(false);
  };
  const items = [
    {
      id: 1,
      name: 'Shirt 1',
      description: 'A stylish shirt for your wardrobe',
      price: 50,
      image: 'https://images.unsplash.com/photo-1501544610428-bbc1a5a24341',
    },
    {
      id: 2,
      name: 'Shirt 2',
      description: 'Another stylish shirt for your wardrobe',
      price: 55,
      image: 'https://images.unsplash.com/photo-1519281961567-1e0e1c8e6713',
    },
    {
      id: 3,
      name: 'Shirt 3',
      description: 'A casual shirt for everyday wear',
      price: 45,
      image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd0b',
    },
    {
      id: 4,
      name: 'T-shirt 1',
      description: 'A comfortable t-shirt for casual outings',
      price: 35,
      image: 'https://images.unsplash.com/photo-1606780700407-0325bdf31964',
    },
    {
      id: 5,
      name: 'T-shirt 2',
      description: 'Another stylish t-shirt for casual wear',
      price: 40,
      image: 'https://images.unsplash.com/photo-1561350901-eb4a01f6477e',
    },
    {
      id: 6,
      name: 'T-shirt 3',
      description: 'A graphic t-shirt to express your style',
      price: 38,
      image: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366',
    },
    {
      id: 7,
      name: 'Book 1',
      description: 'Expand your mind with this captivating book',
      price: 30,
      image: 'https://images.unsplash.com/photo-1552332386-ec3c4360c3c9',
    },
    {
      id: 8,
      name: 'Book 2',
      description: 'Dive into a world of imagination with this book',
      price: 28,
      image: 'https://images.unsplash.com/photo-1593740677045-acaed755eaf7',
    },
    {
      id: 9,
      name: 'Diary 1',
      description: 'Jot down your thoughts and plans in this diary',
      price: 25,
      image: 'https://images.unsplash.com/photo-1595391728395-f79709df50f9',
    },
    {
      id: 10,
      name: 'Shirt 4',
      description: 'A trendy shirt to enhance your style',
      price: 48,
      image: 'https://images.unsplash.com/photo-1551873950-380456e32c08',
    },
    {
      id: 11,
      name: 'Shirt 5',
      description: 'A casual shirt for everyday wear',
      price: 42,
      image: 'https://images.unsplash.com/photo-1515442761041-0b48d1eacccb',
    },
    {
      id: 12,
      name: 'T-shirt 4',
      description: 'A comfortable t-shirt for daily wear',
      price: 32,
      image: 'https://images.unsplash.com/photo-1522302667191-14c99c1b4f64',
    },
    {
      id: 13,
      name: 'T-shirt 5',
      description: 'A cool t-shirt for your casual look',
      price: 36,
      image: 'https://images.unsplash.com/photo-1520444822591-00828f41dae8',
    },
    {
      id: 14,
      name: 'Book 3',
      description: 'Get lost in the world of fiction with this book',
      price: 32,
      image: 'https://images.unsplash.com/photo-1573116765919-2a1307dbd54b',
    },
    {
      id: 15,
      name: 'Book 4',
      description: 'Discover new ideas and perspectives with this book',
      price: 26,
      image: 'https://images.unsplash.com/photo-1571715878959-b0356628b6f9',
    },
    {
      id: 16,
      name: 'Diary 2',
      description: 'Keep track of your daily tasks with this diary',
      price: 22,
      image: 'https://images.unsplash.com/photo-1512724328123-33a9abaf9f6a',
    },
  ];

  const handleSelectItem = item => {
    const selectedItemIndex = selectedItem.findIndex(
      selected => selected.id === item.id,
    );

    if (selectedItemIndex === -1) {
      setSelectedItem([...selectedItem, item]);
    } else {
      const updatedSelectedItems = [...selectedItem];
      updatedSelectedItems.splice(selectedItemIndex, 1);
      setSelectedItem(updatedSelectedItems);
      console.log(selectedItem + 'itemss');
    }
  };

  const handleRedeemItem = async () => {
    try {
      const totalSelectedItemsPrice = selectedItem.reduce(
        (acc, curr) => acc + curr.price,
        0,
      );
      if (credits >= totalSelectedItemsPrice) {
        const updatedCredits = credits - totalSelectedItemsPrice;
        setCredits(updatedCredits);
        console.log(totalSelectedItemsPrice);
        await axios.post(`${Config.BASE_URL}/deduct-credits`, {
          username: username,
          price: totalSelectedItemsPrice,
        });

        setRedemptionHistory([...redemptionHistory, ...selectedItem]);

        console.log('Items redeemed successfully!');
        setSelectedItem([]);
      } else {
        console.log('Insufficient credits!');
      }
    } catch (error) {
      console.error('Error redeeming items:', error);
    }
  };

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
      const creditsResponse = await axios.get(
        `${Config.BASE_URL}/${storedUsername}/credits`,
      );
      setCredits(creditsResponse.data.credits);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Your Current Credit Points:{credits}
        </Text>
      </View>

      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleSelectItem(item)}
            style={styles.item}>
            <Image source={{uri: item.image}} style={styles.itemImage} />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemPrice}>Price: {item.price} points</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedItem.length > 0 && (
        <View style={styles.selectedItemContainer}>
          <Swiper style={styles.wrapper} loop={false} showsPagination={false}>
            {selectedItem.map(item => (
              <View key={item.id} style={styles.slide}>
                <Image
                  source={{uri: item.image}}
                  style={styles.selectedItemImage}
                />
                <Text style={styles.selectedItemName}>{item.name}</Text>
                <Text style={styles.selectedItemDescription}>
                  {item.description}
                </Text>
                <Text style={styles.selectedItemPrice}>
                  Price: {item.price} points
                </Text>
              </View>
            ))}
          </Swiper>
          <View style={styles.totalCostContainer}>
            <Text style={styles.totalCostText}>
              Total Cost:{' '}
              {selectedItem.reduce((acc, item) => acc + item.price, 0)} points
            </Text>
          </View>
          <Pressable
            style={({pressed}) => [
              {
                backgroundColor: pressed
                  ? 'rgb(210, 230, 255)'
                  : 'rgb(0, 0, 255)',
                opacity: pressed ? 0.5 : 1,
                borderRadius: 8,
                padding: 10,
                marginRight: 190,
                marginTop: -25,
              },
            ]}
            onPress={handleRedeemItem}>
            <Text style={styles.buttonText}>Redeem Item</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.redemptionHistoryContainer}>
        <Text style={styles.headerText}>Redemption History:</Text>
        {redemptionHistory.map((item, index) => (
          <View key={index} style={styles.historyItem}>
            <Image source={{uri: item.image}} style={styles.historyItemImage} />
            <Text>{item.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  totalCostContainer: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 10,
  },
  totalCostText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  selectedItemContainer: {
    marginBottom: 20,
  },
  wrapper: {
    height: 300,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    margin: 10,
    padding: 20,
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  item: {
    width: '48%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    backgroundColor: 'black',
  },
  itemImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    marginBottom: 10,
    borderRadius: 5,
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDescription: {
    marginBottom: 5,
  },
  itemPrice: {
    fontWeight: 'bold',
  },
  selectedItemContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedItemImage: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
    borderRadius: 5,
  },
  selectedItemName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedItemDescription: {
    marginBottom: 5,
  },
  selectedItemPrice: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  redemptionHistoryContainer: {
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  historyItemImage: {
    width: 30,
    height: 30,
    resizeMode: 'cover',
    marginRight: 10,
    borderRadius: 5,
  },
});

export default BuyItemsPage;
