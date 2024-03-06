// SearchPage.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Config from 'react-native-config';

const SearchPage = () => {
  const BASE_URL = Config.BASE_URL;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigation = useNavigation();

  const handleSearch = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/search?query=${query}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const navigateToProfile = (username) => {
    // Navigate to the UserProfile screen with the username as a parameter
    navigation.navigate('UserProfile', { username });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter username or skill"
        value={query}
        onChangeText={(text) => setQuery(text)}
      />
      <Button title="Search" onPress={handleSearch} />

      <FlatList
        style={styles.list}
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigateToProfile(item.name)}>
            <View>
              <Text style={styles.itemText}>{item.name}</Text>
              {/* Display other information as needed */}
            </View>
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
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  list: {
    marginTop: 12,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchPage;
