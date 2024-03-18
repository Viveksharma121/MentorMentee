import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Config from 'react-native-config';
import MentorCard from './MentorCard'; // Import MentorCard component

const SearchPage = () => {
  const BASE_URL = Config.BASE_URL;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const navigation = useNavigation();

  // Function to fetch all users
  const getAllUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/getAllUsers`);
      const data = await response.json();
      setResults(data);
      setFilteredResults(data); // Initialize filtered results with all users
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Effect hook to fetch all users when the component mounts
  useEffect(() => {
    getAllUsers();
  }, []);

  // Function to filter users based on query
  const filterUsers = () => {
    if (query.trim() === '') {
      setFilteredResults(results); // Reset to show all users if the query is empty
    } else {
      const filtered = results.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) || // Check if name matches
          (user.skills && user.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))) // Check if any skill matches
      );
      setFilteredResults(filtered);
    }
  };

  // Handle text input change
  const handleInputChange = (text) => {
    setQuery(text);
    filterUsers();
  };

  // Function to clear search and show all users
  const clearSearch = () => {
    setQuery('');
    setFilteredResults(results);
  };

  // Function to navigate to the user profile
  const navigateToProfile = (username) => {
    navigation.navigate('UserProfile', { userName: username }); // Pass the correct identifier for the user
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Type name or skills here"
          value={query}
          onChangeText={handleInputChange}
          placeholderTextColor="#fff"
        />
        {query.trim() !== '' && (
          <TouchableOpacity onPress={clearSearch}>
            <Text style={{ color: 'white' }}>✖️</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        style={styles.list}
        data={filteredResults}
        keyExtractor={(item) => item._id} // Assuming _id is the unique identifier for each user
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigateToProfile(item.name)} // Pass the correct identifier for the user
          >
            <MentorCard mentor={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    paddingLeft: 30, // Adjust left padding
    color: '#fff', // Set text color
  },
  list: {
    marginTop: 12,
  },
  item: {
    // Your custom styles for TouchableOpacity
  },
});

export default SearchPage;
