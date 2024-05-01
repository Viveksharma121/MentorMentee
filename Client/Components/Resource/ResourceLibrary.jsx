import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import base64 from 'base-64';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';
import Icon from 'react-native-vector-icons/FontAwesome';
import AddResourceForm from './AddResourceForm';

const ResourceLibrary = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [creditpoints, setcreditpoints] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Fetch resources again
    fetchResources();
    // Set refreshing to false after fetch is completed
    setRefreshing(false);
  }, []);

  const BASE_URL = Config.BASE_URL;
  const navigation = useNavigation();
  const [resources, setResources] = useState([]);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setusername] = useState('');

  const getName = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log(token);
      if (!token) {
        throw new Error('Token not found');
      }
      const [, payload] = token.split('.');

      const decodedPayload = base64.decode(payload);
      const payloadObject = JSON.parse(decodedPayload);
      const currentUser = payloadObject.username.toString();
      console.log('currrr', currentUser);
      setusername(currentUser);
      getPoints(currentUser);
    } catch (error) { }
  };

  useEffect(() => {
    getName();
    fetchResources();
  }, []);

  // Use useFocusEffect to fetch points whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getName();
    }, [])
  );

  const getPoints = async (username) => {
    try {
      const response = await axios.get(`${BASE_URL}/user/${username}`);
      console.log(response.data.credits);
      setcreditpoints(response.data.credits);
    } catch (error) {
      console.log(error + ' ubhbashchscshjbschbchwbhbc');
    }
  };

  const fetchResources = () => {
    axios
      .get(`${BASE_URL}/api/resource/allResources`)
      .then(response => {
        setResources(response.data);
      })
      .catch(error => {
        console.error('Error fetching resources:', error);
      });
  };

  const handleAddResource = () => {
    setShowAddResourceModal(true);
  };

  const handleResourceAdded = async () => {
    setShowAddResourceModal(false);
    fetchResources();
    await getPoints(username);
  };

  const navigateToDetailScreen = item => {
    navigation.navigate('ResourceDetail', { resource: item });
  };

  const handleSearch = () => {
    axios
      .get(`${BASE_URL}/api/resource/searchResources`, {
        params: { query: searchQuery },
      })
      .then(response => {
        setResources(response.data);
      })
      .catch(error => {
        console.error('Error searching resources:', error);
      });
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchResources(); // Reset to the default list when search is cleared
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resourceContainer}
      onPress={() => navigateToDetailScreen(item)}>
      <View style={styles.iconContainer}>
        <Icon name="link" size={24} color="blue" />
      </View>
      <View style={styles.resourceTextContainer}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Text style={styles.resourceDescription}>{item.description}</Text>
        <View style={styles.resourceFooter}>
          <View style={styles.footerRow}>
            <Text style={styles.resourceCategory}>
              Category: {item.category}
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.resourceUrl}>{item.url}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resource Library</Text>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or category"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
          <Icon name="times" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={resources}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {creditpoints > 1000 ? (
        <TouchableOpacity style={styles.addButton} onPress={handleAddResource}>
          <Text style={styles.addButtonText}>Add Resource</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.noCreditsContainer}>
          <Text style={styles.noCreditsText}>
            You need at least 1000 credit points to add a resource.
          </Text>
        </View>
      )}
      {console.log('Credit Points:', creditpoints)}

      <Modal
        visible={showAddResourceModal}
        animationType="slide"
        onRequestClose={() => setShowAddResourceModal(false)}>
        <View style={styles.modalContainer}>
          <AddResourceForm onResourceAdded={handleResourceAdded} />
          <Button
            title="Cancel"
            onPress={() => setShowAddResourceModal(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#000', // Charcoal black background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff', // White text color
  },
  noCreditsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  noCreditsText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  flatListContainer: {
    flexGrow: 1,
  },
  resourceContainer: {
    marginBottom: 20,
    backgroundColor: '#333', // Dark gray background
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row', // Align icon and text side by side
  },
  iconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceTextContainer: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff', // White text color
  },
  resourceDescription: {
    fontSize: 16,
    marginBottom: 10,
    color: '#fff', // White text color
  },
  resourceFooter: {
    flexDirection: 'column', // Change to column to make Category and URL appear on separate lines
    alignItems: 'flex-start', // Align items to start of the column
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceCategory: {
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#fff', // White text color
  },
  resourceUrl: {
    fontSize: 16,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    paddingLeft: 10,
    color: '#fff',
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    marginLeft: 10,
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ResourceLibrary;
