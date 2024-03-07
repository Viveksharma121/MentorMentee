import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';

const SkillSlider = ({skills}) => {
  return (
    <FlatList
      data={skills}
      renderItem={({item}) => (
        <View style={styles.skillItem}>
          <Text style={styles.skillText}>{item}</Text>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
      horizontal={false}
      numColumns={undefined}
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
  skillItem: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 40,
    marginBottom: 10,
  },
  skillText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SkillSlider;
