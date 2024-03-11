import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome for example
import AddResourceForm from './AddResourceForm';

const ResourceLibrary = () => {
  const BASE_URL = Config.BASE_URL;
  const navigation = useNavigation();
  const [resources, setResources] = useState([]);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

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

  const handleResourceAdded = () => {
    setShowAddResourceModal(false);
    fetchResources(); // Refresh resource list
  };

  const navigateToDetailScreen = item => {
    // Navigate to detail screen and pass the selected resource data
    navigation.navigate('ResourceDetail', {resource: item});
  };

  const renderItem = ({item}) => (
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
      <FlatList
        data={resources}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContainer}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddResource}>
        <Text style={styles.addButtonText}>Add Resource</Text>
      </TouchableOpacity>
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
});

export default ResourceLibrary;
