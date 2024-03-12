import React from 'react';
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ProjectSlider = ({projects}) => {
  const handleLinkPress = url => {
    console.log(url);
    Linking.openURL(url);
  };

  return (
    <FlatList
      data={projects}
      renderItem={({item}) => (
        <View style={styles.projectItem}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <TouchableOpacity onPress={() => handleLinkPress(item.githubLink)}>
            <Text style={styles.githubLink}>GitHub Link</Text>
          </TouchableOpacity>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
      horizontal={false} // Set horizontal to false to make items wrap to the next row
      numColumns={undefined} // Allow items to wrap to the next row
      contentContainerStyle={styles.sliderContainer}
    />
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    paddingVertical: 10,
    flexDirection: 'row', // Ensure items are arranged horizontally
    flexWrap: 'wrap', // Allow items to wrap to the next row
  },
  projectItem: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    minWidth: 325,
    maxHeight: 65,
    marginBottom: 10,
  },
  projectTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  githubLink: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
});

export default ProjectSlider;
