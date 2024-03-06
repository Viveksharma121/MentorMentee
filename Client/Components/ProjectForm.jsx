// SearchPage.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import Config from 'react-native-config';
const SearchPage = () => {
  const BASE_URL = Config.BASE_URL;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    // Make a request to your Node.js backend with the search query
    try {
      const response = await fetch(`${BASE_URL}/api/search?query=${query}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Enter username or skill"
        value={query}
        onChangeText={(text) => setQuery(text)}
      />
      <Button title="Search" onPress={handleSearch} />

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            {/* Display other information as needed */}
          </View>
        )}
      />
    </View>
  );
};

export default SearchPage;
