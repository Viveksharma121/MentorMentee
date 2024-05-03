import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

const SkillSlider = ({skills}) => {
  return (
    <ScrollView contentContainerStyle={styles.sliderContainer}>
      {skills.map((skill, index) => (
        <View key={index} style={styles.skillItem}>
          <Text style={styles.skillText}>{skill}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SkillSlider;
